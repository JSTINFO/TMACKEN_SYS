from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.dependencies import get_db

from app.models.reservation import Reservation
from app.models.client import Client
from app.models.utilisateur import Utilisateur
from app.models.detail_reservation import DetailReservation
from app.models.produit import Produit
from app.models.stock import Stock
from app.models.mouvement_stock import MouvementStock

from app.schemas.reservation import (
    ReservationCreate,
    ReservationUpdate,
    ReservationResponse,
    ReservationCompleteResponse
)


router = APIRouter(
    prefix="/reservations",
    tags=["Reservations"]
)


# =========================================================
# POST - CREER UNE RESERVATION
# =========================================================

@router.post(
    "/",
    response_model=ReservationResponse,
    status_code=201
)
def create_reservation(
    reservation_data: ReservationCreate,
    db: Session = Depends(get_db)
):

    # Vérifier le client
    client = db.query(Client).filter(
        Client.id_client == reservation_data.id_client
    ).first()

    if client is None:
        raise HTTPException(
            status_code=404,
            detail="Client introuvable"
        )

    # Vérifier l'utilisateur
    utilisateur = db.query(Utilisateur).filter(
        Utilisateur.id_utilisateur == reservation_data.id_utilisateur
    ).first()

    if utilisateur is None:
        raise HTTPException(
            status_code=404,
            detail="Utilisateur introuvable"
        )

    # Créer la réservation
    reservation = Reservation(
        id_client=reservation_data.id_client,
        id_utilisateur=reservation_data.id_utilisateur,
        statut=reservation_data.statut
    )

    db.add(reservation)
    db.commit()
    db.refresh(reservation)

    return reservation


# =========================================================
# GET - TOUTES LES RESERVATIONS
# =========================================================

@router.get(
    "/",
    response_model=list[ReservationResponse]
)
def get_reservations(
    db: Session = Depends(get_db)
):

    reservations = db.query(
        Reservation
    ).order_by(
        Reservation.id_reservation.desc()
    ).all()

    return reservations


# =========================================================
# GET - UNE RESERVATION COMPLETE
# =========================================================

@router.get(
    "/{id_reservation}",
    response_model=ReservationCompleteResponse
)
def get_reservation(
    id_reservation: int,
    db: Session = Depends(get_db)
):

    # Chercher la réservation
    reservation = db.query(Reservation).filter(
        Reservation.id_reservation == id_reservation
    ).first()

    if reservation is None:
        raise HTTPException(
            status_code=404,
            detail="Réservation introuvable"
        )

    # Chercher les détails + produits
    details_db = (
        db.query(
            DetailReservation.id_detail_reservation,
            DetailReservation.id_produit,
            Produit.nom.label("nom_produit"),
            Produit.prix.label("prix_unitaire"),
            DetailReservation.quantite
        )
        .join(
            Produit,
            DetailReservation.id_produit == Produit.id_produit
        )
        .filter(
            DetailReservation.id_reservation == id_reservation
        )
        .all()
    )

    details = []

    total = 0

    for detail in details_db:

        sous_total = (
            float(detail.prix_unitaire)
            * detail.quantite
        )

        details.append({
            "id_detail_reservation": detail.id_detail_reservation,
            "id_produit": detail.id_produit,
            "nom_produit": detail.nom_produit,
            "prix_unitaire": float(detail.prix_unitaire),
            "quantite": detail.quantite,
            "sous_total": sous_total
        })

        total += sous_total

    return {
        "id_reservation": reservation.id_reservation,
        "date_reservation": reservation.date_reservation,
        "statut": reservation.statut,
        "id_client": reservation.id_client,
        "id_utilisateur": reservation.id_utilisateur,
        "details": details,
        "total": total
    }


# =========================================================
# PUT - MODIFIER LE STATUT
# =========================================================

@router.put(
    "/{id_reservation}",
    response_model=ReservationResponse
)
def update_reservation(
    id_reservation: int,
    reservation_data: ReservationUpdate,
    db: Session = Depends(get_db)
):

    # =====================================================
    # 1. CHERCHER LA RESERVATION
    # =====================================================

    reservation = db.query(Reservation).filter(
        Reservation.id_reservation == id_reservation
    ).first()

    if reservation is None:
        raise HTTPException(
            status_code=404,
            detail="Réservation introuvable"
        )

    ancien_statut = reservation.statut
    nouveau_statut = reservation_data.statut

    # =====================================================
    # 2. VERIFIER LA TRANSITION
    # =====================================================

    transitions_autorisees = {
        "EN_ATTENTE": [
            "CONFIRMEE",
            "ANNULEE"
        ],
        "CONFIRMEE": [
            "TERMINEE",
            "ANNULEE"
        ],
        "ANNULEE": [],
        "TERMINEE": []
    }

    if nouveau_statut not in transitions_autorisees[ancien_statut]:

        raise HTTPException(
            status_code=400,
            detail=(
                f"Transition impossible : "
                f"{ancien_statut} → {nouveau_statut}"
            )
        )

    # =====================================================
    # 3. CONFIRMATION DE LA RESERVATION
    # =====================================================

    if (
        ancien_statut == "EN_ATTENTE"
        and nouveau_statut == "CONFIRMEE"
    ):

        # -------------------------------------------------
        # Récupérer les détails
        # -------------------------------------------------

        details = db.query(DetailReservation).filter(
            DetailReservation.id_reservation == id_reservation
        ).all()

        if not details:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Impossible de confirmer une réservation "
                    "sans produit"
                )
            )

        # -------------------------------------------------
        # Vérifier TOUS les stocks AVANT de modifier
        # -------------------------------------------------

        stocks_a_modifier = []

        for detail in details:

            stock = db.query(Stock).filter(
                Stock.id_produit == detail.id_produit
            ).first()

            if stock is None:

                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"Aucun stock disponible pour "
                        f"le produit {detail.id_produit}"
                    )
                )

            if detail.quantite > stock.quantite:

                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"Stock insuffisant pour le produit "
                        f"{detail.id_produit}. "
                        f"Disponible : {stock.quantite}, "
                        f"demandé : {detail.quantite}"
                    )
                )

            stocks_a_modifier.append(
                (detail, stock)
            )

        # -------------------------------------------------
        # Tous les stocks sont suffisants
        # On peut maintenant effectuer les sorties
        # -------------------------------------------------

        for detail, stock in stocks_a_modifier:

            stock.quantite -= detail.quantite

            mouvement = MouvementStock(
                type_mouvement="SORTIE",
                quantite=detail.quantite,
                motif=f"Réservation #{id_reservation}",
                id_produit=detail.id_produit,
                id_utilisateur=reservation.id_utilisateur
            )

            db.add(mouvement)

        # -------------------------------------------------
        # Confirmer
        # -------------------------------------------------

        reservation.statut = "CONFIRMEE"

    # =====================================================
    # 4. ANNULATION AVANT CONFIRMATION
    # =====================================================

    elif (
        ancien_statut == "EN_ATTENTE"
        and nouveau_statut == "ANNULEE"
    ):

        reservation.statut = "ANNULEE"

    # =====================================================
    # 5. ANNULATION APRES CONFIRMATION
    # =====================================================

    elif (
        ancien_statut == "CONFIRMEE"
        and nouveau_statut == "ANNULEE"
    ):

        details = db.query(DetailReservation).filter(
            DetailReservation.id_reservation == id_reservation
        ).all()

        for detail in details:

            stock = db.query(Stock).filter(
                Stock.id_produit == detail.id_produit
            ).first()

            if stock is None:

                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"Stock introuvable pour "
                        f"le produit {detail.id_produit}"
                    )
                )

            # Restitution du stock
            stock.quantite += detail.quantite

            # Mouvement d'entrée
            mouvement = MouvementStock(
                type_mouvement="ENTREE",
                quantite=detail.quantite,
                motif=f"Annulation réservation #{id_reservation}",
                id_produit=detail.id_produit,
                id_utilisateur=reservation.id_utilisateur
            )

            db.add(mouvement)

        reservation.statut = "ANNULEE"

    # =====================================================
    # 6. CONFIRMEE → TERMINEE
    # =====================================================

    elif (
        ancien_statut == "CONFIRMEE"
        and nouveau_statut == "TERMINEE"
    ):

        reservation.statut = "TERMINEE"

    # =====================================================
    # 7. SAUVEGARDER
    # =====================================================

    db.commit()
    db.refresh(reservation)

    return reservation