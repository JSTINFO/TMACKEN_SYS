from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.dependencies import get_db

from app.models.detail_reservation import DetailReservation
from app.models.reservation import Reservation
from app.models.produit import Produit
from app.models.stock import Stock

from app.schemas.detail_reservation import (
    DetailReservationCreate,
    DetailReservationUpdate,
    DetailReservationResponse
)


router = APIRouter(
    prefix="/details-reservation",
    tags=["Details Reservation"]
)


# =========================================================
# POST - AJOUTER UN PRODUIT A UNE RESERVATION
# =========================================================

@router.post(
    "/",
    response_model=DetailReservationResponse,
    status_code=201
)
def create_detail_reservation(
    detail_data: DetailReservationCreate,
    db: Session = Depends(get_db)
):

    # -----------------------------------------------------
    # Vérifier la réservation
    # -----------------------------------------------------

    reservation = db.query(Reservation).filter(
        Reservation.id_reservation == detail_data.id_reservation
    ).first()

    if reservation is None:
        raise HTTPException(
            status_code=404,
            detail="Réservation introuvable"
        )

    # -----------------------------------------------------
    # Vérifier le statut de la réservation
    # -----------------------------------------------------

    if reservation.statut in ["ANNULEE", "TERMINEE"]:
        raise HTTPException(
            status_code=400,
            detail="Impossible de modifier cette réservation"
        )

    # -----------------------------------------------------
    # Vérifier le produit
    # -----------------------------------------------------

    produit = db.query(Produit).filter(
        Produit.id_produit == detail_data.id_produit
    ).first()

    if produit is None:
        raise HTTPException(
            status_code=404,
            detail="Produit introuvable"
        )

    # -----------------------------------------------------
    # Vérifier que le produit est actif
    # -----------------------------------------------------

    if not produit.statut:
        raise HTTPException(
            status_code=400,
            detail="Ce produit est désactivé"
        )

    # -----------------------------------------------------
    # Vérifier le stock
    # -----------------------------------------------------

    stock = db.query(Stock).filter(
        Stock.id_produit == detail_data.id_produit
    ).first()

    if stock is None:
        raise HTTPException(
            status_code=400,
            detail="Aucun stock disponible pour ce produit"
        )

    if detail_data.quantite > stock.quantite:
        raise HTTPException(
            status_code=400,
            detail="Quantité demandée supérieure au stock disponible"
        )

    # -----------------------------------------------------
    # Vérifier si le produit existe déjà
    # -----------------------------------------------------

    detail_existant = db.query(DetailReservation).filter(
        DetailReservation.id_reservation == detail_data.id_reservation,
        DetailReservation.id_produit == detail_data.id_produit
    ).first()

    if detail_existant is not None:
        raise HTTPException(
            status_code=400,
            detail="Ce produit existe déjà dans cette réservation"
        )

    # -----------------------------------------------------
    # Créer le détail
    # -----------------------------------------------------

    detail = DetailReservation(
        id_reservation=detail_data.id_reservation,
        id_produit=detail_data.id_produit,
        prix_unitaire=produit.prix,
        quantite=detail_data.quantite
    )

    db.add(detail)
    db.commit()
    db.refresh(detail)

    return detail


# =========================================================
# GET - TOUS LES DETAILS
# =========================================================

@router.get(
    "/",
    response_model=list[DetailReservationResponse]
)
def get_details_reservation(
    db: Session = Depends(get_db)
):

    details = db.query(
        DetailReservation
    ).order_by(
        DetailReservation.id_detail_reservation.desc()
    ).all()

    return details


# =========================================================
# GET - UN DETAIL
# =========================================================

@router.get(
    "/{id_detail_reservation}",
    response_model=DetailReservationResponse
)
def get_detail_reservation(
    id_detail_reservation: int,
    db: Session = Depends(get_db)
):

    detail = db.query(DetailReservation).filter(
        DetailReservation.id_detail_reservation == id_detail_reservation
    ).first()

    if detail is None:
        raise HTTPException(
            status_code=404,
            detail="Détail de réservation introuvable"
        )

    return detail


# =========================================================
# PUT - MODIFIER LA QUANTITE
# =========================================================

@router.put(
    "/{id_detail_reservation}",
    response_model=DetailReservationResponse
)
def update_detail_reservation(
    id_detail_reservation: int,
    detail_data: DetailReservationUpdate,
    db: Session = Depends(get_db)
):

    # -----------------------------------------------------
    # Chercher le détail
    # -----------------------------------------------------

    detail = db.query(DetailReservation).filter(
        DetailReservation.id_detail_reservation == id_detail_reservation
    ).first()

    if detail is None:
        raise HTTPException(
            status_code=404,
            detail="Détail de réservation introuvable"
        )

    # -----------------------------------------------------
    # Chercher la réservation
    # -----------------------------------------------------

    reservation = db.query(Reservation).filter(
        Reservation.id_reservation == detail.id_reservation
    ).first()

    if reservation is None:
        raise HTTPException(
            status_code=404,
            detail="Réservation introuvable"
        )

    # -----------------------------------------------------
    # Vérifier le statut
    # -----------------------------------------------------

    if reservation.statut in ["ANNULEE", "TERMINEE"]:
        raise HTTPException(
            status_code=400,
            detail="Impossible de modifier cette réservation"
        )

    # -----------------------------------------------------
    # Chercher le stock
    # -----------------------------------------------------

    stock = db.query(Stock).filter(
        Stock.id_produit == detail.id_produit
    ).first()

    if stock is None:
        raise HTTPException(
            status_code=400,
            detail="Aucun stock disponible pour ce produit"
        )

    # -----------------------------------------------------
    # Vérifier la nouvelle quantité
    # -----------------------------------------------------

    if detail_data.quantite > stock.quantite:
        raise HTTPException(
            status_code=400,
            detail="Quantité demandée supérieure au stock disponible"
        )

    # -----------------------------------------------------
    # Modifier
    # -----------------------------------------------------

    detail.quantite = detail_data.quantite

    db.commit()
    db.refresh(detail)

    return detail


# =========================================================
# DELETE - SUPPRIMER UN DETAIL
# =========================================================

@router.delete(
    "/{id_detail_reservation}",
    status_code=204
)
def delete_detail_reservation(
    id_detail_reservation: int,
    db: Session = Depends(get_db)
):

    detail = db.query(DetailReservation).filter(
        DetailReservation.id_detail_reservation == id_detail_reservation
    ).first()

    if detail is None:
        raise HTTPException(
            status_code=404,
            detail="Détail de réservation introuvable"
        )

    reservation = db.query(Reservation).filter(
        Reservation.id_reservation == detail.id_reservation
    ).first()

    if reservation is None:
        raise HTTPException(
            status_code=404,
            detail="Réservation introuvable"
        )

    if reservation.statut in ["ANNULEE", "TERMINEE"]:
        raise HTTPException(
            status_code=400,
            detail="Impossible de modifier cette réservation"
        )

    db.delete(detail)
    db.commit()