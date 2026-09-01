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

from app.schemas.reservation import (
    ReservationCreate,
    ReservationUpdate,
    ReservationResponse,
    ReservationCompleteResponse
)

from app.core.security import get_current_user


router = APIRouter(
    prefix="/reservations",
    tags=["Réservations"]
)


# =========================================================
# FONCTION UTILITAIRE
# =========================================================

def build_reservation_complete(
    reservation,
    db: Session
):

    details_db = (
        db.query(
            DetailReservation,
            Produit
        )
        .join(
            Produit,
            Produit.id_produit ==
            DetailReservation.id_produit
        )
        .filter(
            DetailReservation.id_reservation ==
            reservation.id_reservation
        )
        .all()
    )

    details = []

    total = Decimal("0")

    for detail, produit in details_db:

        prix = Decimal(
            str(detail.prix_unitaire)
        )

        sous_total = (
            prix *
            detail.quantite
        )

        total += sous_total

        details.append({

            "id_produit":
                detail.id_produit,

            "nom_produit":
                produit.nom,

            "prix_unitaire":
                prix,

            "quantite":
                detail.quantite,

            "sous_total":
                sous_total

        })

    return {

        "id_reservation":
            reservation.id_reservation,

        "date_reservation":
            reservation.date_reservation,

        "statut":
            reservation.statut,

        "id_client":
            reservation.id_client,

        "id_utilisateur":
            reservation.id_utilisateur,

        "details":
            details,

        "total":
            total

    }


# =========================================================
# GET - TOUTES LES RESERVATIONS
# =========================================================

@router.get(
    "/",
    response_model=list[ReservationResponse]
)
def get_reservations(
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(
        get_current_user
    )
):

    reservations = (
        db.query(Reservation)
        .order_by(
            Reservation.date_reservation.desc()
        )
        .all()
    )

    return reservations


# =========================================================
# GET - RESERVATION COMPLETE
# =========================================================

@router.get(
    "/{id_reservation}",
    response_model=ReservationCompleteResponse
)
def get_reservation(
    id_reservation: int,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(
        get_current_user
    )
):

    reservation = (
        db.query(Reservation)
        .filter(
            Reservation.id_reservation ==
            id_reservation
        )
        .first()
    )

    if reservation is None:

        raise HTTPException(
            status_code=404,
            detail="Réservation introuvable"
        )

    return build_reservation_complete(
        reservation,
        db
    )


# =========================================================
# POST - CREER RESERVATION COMPLETE
# =========================================================

@router.post(
    "/",
    response_model=ReservationCompleteResponse,
    status_code=201
)
def create_reservation(
    reservation_data: ReservationCreate,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(
        get_current_user
    )
):

    # =====================================================
    # VERIFIER CLIENT
    # =====================================================

    client = (
        db.query(Client)
        .filter(
            Client.id_client ==
            reservation_data.id_client
        )
        .first()
    )

    if client is None:

        raise HTTPException(
            status_code=404,
            detail="Client introuvable"
        )


    # =====================================================
    # VERIFIER QU'IL Y A DES PRODUITS
    # =====================================================

    if not reservation_data.details:

        raise HTTPException(
            status_code=400,
            detail="La réservation doit contenir au moins un produit."
        )


    # =====================================================
    # EMPECHER DOUBLON PRODUIT
    # =====================================================

    produits_ids = [
        detail.id_produit
        for detail in reservation_data.details
    ]

    if len(produits_ids) != len(
        set(produits_ids)
    ):

        raise HTTPException(
            status_code=400,
            detail="Un même produit ne peut pas être ajouté deux fois."
        )


    # =====================================================
    # VERIFIER TOUS LES PRODUITS
    # =====================================================

    produits_valides = []


    for detail_data in reservation_data.details:

        produit = (
            db.query(Produit)
            .filter(
                Produit.id_produit ==
                detail_data.id_produit
            )
            .first()
        )

        if produit is None:

            raise HTTPException(
                status_code=404,
                detail=(
                    f"Produit #{detail_data.id_produit} "
                    "introuvable."
                )
            )


        # Produit actif

        if not produit.statut:

            raise HTTPException(
                status_code=400,
                detail=(
                    f"Le produit « {produit.nom} » "
                    "est désactivé."
                )
            )


        # Quantité

        if detail_data.quantite <= 0:

            raise HTTPException(
                status_code=400,
                detail=(
                    f"La quantité du produit "
                    f"« {produit.nom} » doit être supérieure à 0."
                )
            )


        # Stock

        stock = (
            db.query(Stock)
            .filter(
                Stock.id_produit ==
                detail_data.id_produit
            )
            .first()
        )

        if stock is None:

            raise HTTPException(
                status_code=400,
                detail=(
                    f"Aucun stock disponible "
                    f"pour « {produit.nom} »."
                )
            )


        if detail_data.quantite > stock.quantite:

            raise HTTPException(
                status_code=400,
                detail=(
                    f"Stock insuffisant pour "
                    f"« {produit.nom} ». "
                    f"Disponible : {stock.quantite}."
                )
            )


        produits_valides.append(
            (
                detail_data,
                produit
            )
        )


    # =====================================================
    # CREATION RESERVATION
    # =====================================================

    try:

        reservation = Reservation(

            id_client=
                reservation_data.id_client,

            id_utilisateur=
                current_user.id_utilisateur,

            statut=
                "EN_ATTENTE"

        )

        db.add(reservation)

        db.flush()


        # =================================================
        # CREER LES DETAILS
        # =================================================

        for detail_data, produit in produits_valides:

            detail = DetailReservation(

                id_reservation=
                    reservation.id_reservation,

                id_produit=
                    detail_data.id_produit,

                prix_unitaire=
                    produit.prix,

                quantite=
                    detail_data.quantite

            )

            db.add(detail)


        db.commit()

        db.refresh(reservation)


    except Exception:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Impossible de créer la réservation."
        )


    return build_reservation_complete(
        reservation,
        db
    )


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
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(
        get_current_user
    )
):

    reservation = (
        db.query(Reservation)
        .filter(
            Reservation.id_reservation ==
            id_reservation
        )
        .first()
    )

    if reservation is None:

        raise HTTPException(
            status_code=404,
            detail="Réservation introuvable"
        )


    new_status = reservation_data.statut


    if new_status is None:

        return reservation


    old_status = reservation.statut


    # =====================================================
    # RIEN A FAIRE
    # =====================================================

    if old_status == new_status:

        return reservation


    # =====================================================
    # RESERVATION TERMINEE
    # =====================================================

    if old_status == "TERMINEE":

        raise HTTPException(
            status_code=400,
            detail="Une réservation terminée ne peut plus être modifiée."
        )


    # =====================================================
    # RESERVATION ANNULEE
    # =====================================================

    if old_status == "ANNULEE":

        raise HTTPException(
            status_code=400,
            detail="Une réservation annulée ne peut plus être modifiée."
        )


    # =====================================================
    # EN_ATTENTE -> CONFIRMEE
    # =====================================================

    if (
        old_status == "EN_ATTENTE"
        and new_status == "CONFIRMEE"
    ):

        details = (
            db.query(DetailReservation)
            .filter(
                DetailReservation.id_reservation ==
                reservation.id_reservation
            )
            .all()
        )


        if not details:

            raise HTTPException(
                status_code=400,
                detail="Impossible de confirmer une réservation sans produit."
            )


        # Vérifier le stock AVANT de modifier quoi que ce soit

        for detail in details:

            stock = (
                db.query(Stock)
                .filter(
                    Stock.id_produit ==
                    detail.id_produit
                )
                .first()
            )

            produit = (
                db.query(Produit)
                .filter(
                    Produit.id_produit ==
                    detail.id_produit
                )
                .first()
            )


            if stock is None:

                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"Aucun stock disponible "
                        f"pour le produit #{detail.id_produit}."
                    )
                )


            if stock.quantite < detail.quantite:

                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"Stock insuffisant pour "
                        f"« {produit.nom} »."
                    )
                )


        # Maintenant seulement diminuer le stock

        for detail in details:

            stock = (
                db.query(Stock)
                .filter(
                    Stock.id_produit ==
                    detail.id_produit
                )
                .first()
            )

            stock.quantite -= detail.quantite


    # =====================================================
    # CONFIRMEE -> ANNULEE
    # =====================================================

    elif (
        old_status == "CONFIRMEE"
        and new_status == "ANNULEE"
    ):

        details = (
            db.query(DetailReservation)
            .filter(
                DetailReservation.id_reservation ==
                reservation.id_reservation
            )
            .all()
        )


        for detail in details:

            stock = (
                db.query(Stock)
                .filter(
                    Stock.id_produit ==
                    detail.id_produit
                )
                .first()
            )


            if stock is None:

                stock = Stock(

                    id_produit=
                        detail.id_produit,

                    quantite=0

                )

                db.add(stock)

                db.flush()


            stock.quantite += detail.quantite


    # =====================================================
    # EN_ATTENTE -> ANNULEE
    # =====================================================

    elif (
        old_status == "EN_ATTENTE"
        and new_status == "ANNULEE"
    ):

        # Aucun stock à remettre,
        # car le stock n'a pas encore été diminué.

        pass


    # =====================================================
    # CONFIRMEE -> TERMINEE
    # =====================================================

    elif (
        old_status == "CONFIRMEE"
        and new_status == "TERMINEE"
    ):

        # Le stock a déjà été diminué
        # lors de la confirmation.

        pass


    else:

        raise HTTPException(
            status_code=400,
            detail=(
                f"Transition impossible : "
                f"{old_status} → {new_status}"
            )
        )


    # =====================================================
    # ENREGISTRER LE NOUVEAU STATUT
    # =====================================================

    reservation.statut = new_status

    db.commit()

    db.refresh(reservation)

    return reservation