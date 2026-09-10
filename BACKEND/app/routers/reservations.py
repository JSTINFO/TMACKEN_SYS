from __future__ import annotations

from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.dependencies import get_db

from app.models.reservation import Reservation
from app.models.detail_reservation import DetailReservation
from app.models.client import Client
from app.models.produit import Produit
from app.models.stock import Stock
from app.models.utilisateur import Utilisateur
from app.models.paiement import Paiement
from app.models.mouvement_stock import MouvementStock

from app.schemas.reservation import (
    ReservationCreate,
    ReservationUpdate,
    ReservationResponse,
    ReservationCompleteResponse,
    ReservationPaiementCreate,
)

from app.core.security import get_current_user


router = APIRouter(
    prefix="/reservations",
    tags=["Réservations"],
)


# =========================================================
# CALCUL TOTAL RESERVATION
# =========================================================

def calculer_total_reservation(
    reservation: Reservation,
    db: Session,
):
    """
    Retourne :
        total_brut
        montant_rabais
        total_final
    """

    details_db = (
        db.query(DetailReservation, Produit)
        .join(
            Produit,
            Produit.id_produit == DetailReservation.id_produit,
        )
        .filter(
            DetailReservation.id_reservation
            == reservation.id_reservation
        )
        .all()
    )

    total_brut = Decimal("0.00")

    for detail, produit in details_db:
        prix = Decimal(str(detail.prix_unitaire))
        total_brut += prix * detail.quantite

    rabais = Decimal(str(reservation.rabais or 0))

    if rabais < Decimal("0"):
        rabais = Decimal("0")

    if reservation.type_rabais == "POURCENTAGE":

        if rabais > Decimal("100"):
            rabais = Decimal("100")

        montant_rabais = (
            total_brut * rabais / Decimal("100")
        )

    else:

        montant_rabais = rabais

    if montant_rabais > total_brut:
        montant_rabais = total_brut

    total_final = total_brut - montant_rabais

    return (
        total_brut,
        montant_rabais,
        total_final,
    )


# =========================================================
# CONSTRUIRE RESERVATION COMPLETE
# =========================================================

def build_reservation_complete(
    reservation: Reservation,
    db: Session,
):

    details_db = (
        db.query(DetailReservation, Produit)
        .join(
            Produit,
            Produit.id_produit == DetailReservation.id_produit,
        )
        .filter(
            DetailReservation.id_reservation
            == reservation.id_reservation
        )
        .all()
    )

    details = []
    total_brut = Decimal("0.00")

    for detail, produit in details_db:

        prix = Decimal(str(detail.prix_unitaire))

        sous_total = prix * detail.quantite

        total_brut += sous_total

        details.append(
            {
                "id_produit": detail.id_produit,
                "nom_produit": produit.nom,
                "prix_unitaire": prix,
                "quantite": detail.quantite,
                "sous_total": sous_total,
            }
        )

    rabais = Decimal(str(reservation.rabais or 0))

    if rabais < Decimal("0"):
        rabais = Decimal("0")

    if reservation.type_rabais == "POURCENTAGE":

        if rabais > Decimal("100"):
            rabais = Decimal("100")

        montant_rabais = (
            total_brut * rabais / Decimal("100")
        )

    else:

        montant_rabais = rabais

    if montant_rabais > total_brut:
        montant_rabais = total_brut

    total_final = total_brut - montant_rabais

    return {
        "id_reservation": reservation.id_reservation,
        "date_reservation": reservation.date_reservation,
        "statut": reservation.statut,
        "id_client": reservation.id_client,
        "id_utilisateur": reservation.id_utilisateur,

        "details": details,

        "total": total_final,

        "rabais": float(rabais),
        "type_rabais": reservation.type_rabais,
    }


# =========================================================
# GET - TOUTES LES RESERVATIONS
# =========================================================

@router.get(
    "/",
    response_model=list[ReservationResponse],
)
def get_reservations(
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_user),
):

    return (
        db.query(Reservation)
        .order_by(
            Reservation.date_reservation.desc()
        )
        .all()
    )


# =========================================================
# GET - RESERVATION COMPLETE
# =========================================================

@router.get(
    "/{id_reservation}",
    response_model=ReservationCompleteResponse,
)
def get_reservation(
    id_reservation: int,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_user),
):

    reservation = (
        db.query(Reservation)
        .filter(
            Reservation.id_reservation
            == id_reservation
        )
        .first()
    )

    if reservation is None:
        raise HTTPException(
            status_code=404,
            detail="Réservation introuvable",
        )

    return build_reservation_complete(
        reservation,
        db,
    )


# =========================================================
# POST - CREER RESERVATION COMPLETE
# =========================================================

@router.post(
    "/",
    response_model=ReservationCompleteResponse,
    status_code=201,
)
def create_reservation(
    reservation_data: ReservationCreate,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_user),
):

    # -----------------------------------------------------
    # CLIENT
    # -----------------------------------------------------

    client = (
        db.query(Client)
        .filter(
            Client.id_client
            == reservation_data.id_client
        )
        .first()
    )

    if client is None:
        raise HTTPException(
            status_code=404,
            detail="Client introuvable",
        )

    # -----------------------------------------------------
    # DETAILS
    # -----------------------------------------------------

    if not reservation_data.details:
        raise HTTPException(
            status_code=400,
            detail=(
                "La réservation doit contenir "
                "au moins un produit."
            ),
        )

    produits_ids = [
        detail.id_produit
        for detail in reservation_data.details
    ]

    if len(produits_ids) != len(set(produits_ids)):
        raise HTTPException(
            status_code=400,
            detail=(
                "Un même produit ne peut pas "
                "être ajouté deux fois."
            ),
        )

    produits_valides = []

    for detail_data in reservation_data.details:

        produit = (
            db.query(Produit)
            .filter(
                Produit.id_produit
                == detail_data.id_produit
            )
            .first()
        )

        if produit is None:
            raise HTTPException(
                status_code=404,
                detail=(
                    f"Produit #{detail_data.id_produit} "
                    "introuvable."
                ),
            )

        if not produit.statut:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Le produit « {produit.nom} » "
                    "est désactivé."
                ),
            )

        if detail_data.quantite <= 0:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"La quantité du produit "
                    f"« {produit.nom} » "
                    "doit être supérieure à 0."
                ),
            )

        stock = (
            db.query(Stock)
            .filter(
                Stock.id_produit
                == detail_data.id_produit
            )
            .first()
        )

        if stock is None:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Aucun stock disponible "
                    f"pour « {produit.nom} »."
                ),
            )

        if detail_data.quantite > stock.quantite:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Stock insuffisant pour "
                    f"« {produit.nom} ». "
                    f"Disponible : {stock.quantite}, "
                    f"demandé : {detail_data.quantite}"
                ),
            )

        produits_valides.append(
            (
                detail_data,
                produit,
            )
        )

    # -----------------------------------------------------
    # RABAIS
    # -----------------------------------------------------

    rabais = Decimal(
        str(reservation_data.rabais or 0)
    )

    if rabais < Decimal("0"):
        raise HTTPException(
            status_code=400,
            detail="Le rabais ne peut pas être négatif.",
        )

    if (
        reservation_data.type_rabais
        == "POURCENTAGE"
        and rabais > Decimal("100")
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "Le rabais en pourcentage "
                "ne peut pas dépasser 100 %."
            ),
        )

    # -----------------------------------------------------
    # CALCUL TOTAL BRUT
    # -----------------------------------------------------

    total_brut = Decimal("0.00")

    for detail_data, produit in produits_valides:

        prix = Decimal(str(produit.prix))

        total_brut += (
            prix * detail_data.quantite
        )

    # -----------------------------------------------------
    # CALCUL MONTANT RABAIS
    # -----------------------------------------------------

    if reservation_data.type_rabais == "POURCENTAGE":

        montant_rabais = (
            total_brut
            * rabais
            / Decimal("100")
        )

    else:

        montant_rabais = rabais

    if montant_rabais > total_brut:
        montant_rabais = total_brut

    total_final = (
        total_brut - montant_rabais
    )

    # -----------------------------------------------------
    # CREATION
    # -----------------------------------------------------

    try:

        reservation = Reservation(
            id_client=reservation_data.id_client,
            id_utilisateur=current_user.id_utilisateur,
            statut="EN_ATTENTE",

            rabais=rabais,

            type_rabais=
                reservation_data.type_rabais,
        )

        db.add(reservation)

        db.flush()

        # -------------------------------------------------
        # DETAILS
        # -------------------------------------------------

        for detail_data, produit in produits_valides:

            detail = DetailReservation(
                id_reservation=
                    reservation.id_reservation,

                id_produit=
                    detail_data.id_produit,

                prix_unitaire=
                    produit.prix,

                quantite=
                    detail_data.quantite,
            )

            db.add(detail)

        db.commit()

        db.refresh(reservation)

    except Exception as e:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=(
                "Impossible de créer "
                "la réservation."
            ),
        ) from e

    return build_reservation_complete(
        reservation,
        db,
    )


# =========================================================
# PUT - MODIFIER LE STATUT
# =========================================================

@router.put(
    "/{id_reservation}",
    response_model=ReservationResponse,
)
def update_reservation(
    id_reservation: int,
    reservation_data: ReservationUpdate,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_user),
):

    reservation = (
        db.query(Reservation)
        .filter(
            Reservation.id_reservation
            == id_reservation
        )
        .first()
    )

    if reservation is None:
        raise HTTPException(
            status_code=404,
            detail="Réservation introuvable",
        )

    new_status = reservation_data.statut

    if new_status is None:
        return reservation

    old_status = reservation.statut

    if old_status == new_status:
        return reservation

    if old_status == "TERMINEE":
        raise HTTPException(
            status_code=400,
            detail=(
                "Une réservation terminée "
                "ne peut plus être modifiée."
            ),
        )

    if old_status == "ANNULEE":
        raise HTTPException(
            status_code=400,
            detail=(
                "Une réservation annulée "
                "ne peut plus être modifiée."
            ),
        )

    # =====================================================
    # CONFIRMATION UNIQUEMENT VIA PAIEMENT
    # =====================================================

    if new_status == "CONFIRMEE":
        raise HTTPException(
            status_code=400,
            detail=(
                "Une réservation est confirmée uniquement après "
                "un paiement validé. Utilisez l'action de paiement."
            ),
        )

    # =====================================================
    # AUTRES TRANSITIONS
    # =====================================================

    elif new_status == "TERMINEE":

        raise HTTPException(
            status_code=400,
            detail=(
                "Une réservation doit être payée "
                "pour devenir terminée."
            ),
        )

    elif new_status == "ANNULEE":

        if old_status == "CONFIRMEE":
            raise HTTPException(
                status_code=400,
                detail=(
                    "Une réservation confirmée "
                    "ne peut pas être annulée "
                    "automatiquement après sortie du stock."
                ),
            )

        reservation.statut = "ANNULEE"

    else:

        raise HTTPException(
            status_code=400,
            detail=(
                f"Transition impossible : "
                f"{old_status} -> {new_status}"
            ),
        )

    try:

        db.commit()
        db.refresh(reservation)

    except Exception as e:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=(
                "Impossible de modifier "
                "la réservation."
            ),
        ) from e

    return reservation


# =========================================================
# POST - PAYER UNE RESERVATION
# =========================================================

@router.post(
    "/{id_reservation}/payer",
    status_code=200,
)
def payer_reservation(
    id_reservation: int,
    paiement_data: ReservationPaiementCreate,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_user),
):

    # =====================================================
    # RESERVATION
    # =====================================================

    reservation = (
        db.query(Reservation)
        .filter(
            Reservation.id_reservation == id_reservation
        )
        .first()
    )

    if reservation is None:
        raise HTTPException(
            status_code=404,
            detail="Réservation introuvable",
        )

    # =====================================================
    # REGLE METIER
    # =====================================================

    if reservation.statut == "ANNULEE":
        raise HTTPException(
            status_code=400,
            detail="Une réservation annulée ne peut pas être payée.",
        )

    if reservation.statut == "TERMINEE":
        raise HTTPException(
            status_code=400,
            detail="Cette réservation est déjà terminée.",
        )

    if reservation.statut == "CONFIRMEE":
        raise HTTPException(
            status_code=400,
            detail="Cette réservation est déjà confirmée et son paiement a déjà été traité.",
        )

    if reservation.statut != "EN_ATTENTE":
        raise HTTPException(
            status_code=400,
            detail=(
                f"Statut invalide pour paiement : "
                f"{reservation.statut}"
            ),
        )

    # =====================================================
    # DETAILS
    # =====================================================

    details = (
        db.query(DetailReservation)
        .filter(
            DetailReservation.id_reservation == id_reservation
        )
        .all()
    )

    if not details:
        raise HTTPException(
            status_code=400,
            detail=(
                "Impossible de payer une réservation sans produit."
            ),
        )

    # =====================================================
    # TOTAL AVEC RABAIS
    # =====================================================

    (
        total_brut,
        montant_rabais,
        total_final,
    ) = calculer_total_reservation(
        reservation,
        db,
    )

    montant_paiement = Decimal(
        str(paiement_data.montant)
    ).quantize(Decimal("0.01"))

    total_final = total_final.quantize(Decimal("0.01"))

    # =====================================================
    # MONTANT EXACT
    # =====================================================

    if montant_paiement != total_final:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Montant incorrect. "
                f"Total brut : {total_brut:.2f}. "
                f"Rabais : {montant_rabais:.2f}. "
                f"Total à payer : {total_final:.2f}"
            ),
        )

    # =====================================================
    # VERIFIER LE STOCK AVANT TOUTE MODIFICATION
    # =====================================================

    stocks_a_modifier = []

    for detail in details:

        stock = (
            db.query(Stock)
            .filter(
                Stock.id_produit == detail.id_produit
            )
            .with_for_update()
            .first()
        )

        produit = (
            db.query(Produit)
            .filter(
                Produit.id_produit == detail.id_produit
            )
            .first()
        )

        if produit is None:
            raise HTTPException(
                status_code=404,
                detail=(
                    f"Produit #{detail.id_produit} introuvable."
                ),
            )

        if not produit.statut:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Le produit « {produit.nom} » est désactivé."
                ),
            )

        if stock is None:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Aucun stock disponible pour « {produit.nom} »."
                ),
            )

        if stock.quantite < detail.quantite:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Stock insuffisant pour « {produit.nom} ». "
                    f"Disponible : {stock.quantite}, "
                    f"demandé : {detail.quantite}"
                ),
            )

        stocks_a_modifier.append((detail, stock, produit))

    # =====================================================
    # TRANSACTION UNIQUE
    #
    # Paiement + stock + mouvement + confirmation
    # sont validés ensemble.
    # =====================================================

    try:

        paiement = Paiement(
            montant=montant_paiement,
            mode_paiement=paiement_data.mode_paiement,
            id_reservation=reservation.id_reservation,
            id_utilisateur=current_user.id_utilisateur,
        )

        db.add(paiement)

        # -------------------------------------------------
        # DIMINUER LE STOCK UNE SEULE FOIS
        # -------------------------------------------------

        for detail, stock, produit in stocks_a_modifier:

            stock.quantite -= detail.quantite

            mouvement = MouvementStock(
                type_mouvement="SORTIE",
                quantite=detail.quantite,
                motif=(
                    f"Paiement Réservation "
                    f"#{reservation.id_reservation}"
                ),
                id_produit=detail.id_produit,
                id_utilisateur=current_user.id_utilisateur,
            )

            db.add(mouvement)

        # -------------------------------------------------
        # LE PAIEMENT CONFIRME LA RESERVATION
        # -------------------------------------------------

        reservation.statut = "CONFIRMEE"

        db.commit()

        db.refresh(reservation)
        db.refresh(paiement)

    except HTTPException:
        db.rollback()
        raise

    except Exception as e:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Impossible d'enregistrer le paiement de la réservation.",
        ) from e

    # =====================================================
    # REPONSE
    # =====================================================

    return {
        "message": (
            "Paiement enregistré, stock diminué et réservation "
            "confirmée avec succès."
        ),

        "reservation": build_reservation_complete(
            reservation,
            db,
        ),

        "id_reservation": reservation.id_reservation,
        "id_paiement": paiement.id_paiement,
        "mode_paiement": paiement.mode_paiement,
        "montant": float(paiement.montant),
        "total_brut": float(total_brut),
        "rabais": float(montant_rabais),
        "total_final": float(total_final),
    }

