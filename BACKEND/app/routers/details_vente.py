from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.dependencies import get_db

from app.models.vente import Vente
from app.models.detail_vente import DetailVente
from app.models.produit import Produit

from app.schemas.detail_vente import (
    DetailVenteCreate,
    DetailVenteUpdate,
    DetailVenteResponse
)


router = APIRouter(
    prefix="/details-vente",
    tags=["Détails Vente"]
)


def recalculer_total(
    vente: Vente,
    db: Session
):
    details = db.query(DetailVente).filter(
        DetailVente.id_vente == vente.id_vente
    ).all()

    total = sum(
        (
            Decimal(str(detail.prix_unitaire))
            * detail.quantite
            for detail in details
        ),
        Decimal("0")
    )

    vente.total = total


@router.post(
    "/",
    response_model=DetailVenteResponse,
    status_code=201
)
def create_detail_vente(
    detail_data: DetailVenteCreate,
    db: Session = Depends(get_db)
):

    vente = db.query(Vente).filter(
        Vente.id_vente == detail_data.id_vente
    ).first()

    if vente is None:
        raise HTTPException(
            status_code=404,
            detail="Vente introuvable"
        )

    if vente.statut != "EN_COURS":
        raise HTTPException(
            status_code=400,
            detail="Impossible de modifier cette vente"
        )

    produit = db.query(Produit).filter(
        Produit.id_produit == detail_data.id_produit
    ).first()

    if produit is None:
        raise HTTPException(
            status_code=404,
            detail="Produit introuvable"
        )

    existe = db.query(DetailVente).filter(
        DetailVente.id_vente == detail_data.id_vente,
        DetailVente.id_produit == detail_data.id_produit
    ).first()

    if existe:
        raise HTTPException(
            status_code=400,
            detail="Ce produit existe déjà dans cette vente"
        )

    detail = DetailVente(
        id_vente=detail_data.id_vente,
        id_produit=detail_data.id_produit,
        prix_unitaire=produit.prix,
        quantite=detail_data.quantite
    )

    db.add(detail)

    recalculer_total(vente, db)

    db.commit()
    db.refresh(detail)

    return detail


@router.get(
    "/",
    response_model=list[DetailVenteResponse]
)
def get_details_vente(
    db: Session = Depends(get_db)
):

    return db.query(DetailVente).all()


@router.get(
    "/{id_detail_vente}",
    response_model=DetailVenteResponse
)
def get_detail_vente(
    id_detail_vente: int,
    db: Session = Depends(get_db)
):

    detail = db.query(DetailVente).filter(
        DetailVente.id_detail_vente == id_detail_vente
    ).first()

    if detail is None:
        raise HTTPException(
            status_code=404,
            detail="Détail de vente introuvable"
        )

    return detail


@router.put(
    "/{id_detail_vente}",
    response_model=DetailVenteResponse
)
def update_detail_vente(
    id_detail_vente: int,
    detail_data: DetailVenteUpdate,
    db: Session = Depends(get_db)
):

    detail = db.query(DetailVente).filter(
        DetailVente.id_detail_vente == id_detail_vente
    ).first()

    if detail is None:
        raise HTTPException(
            status_code=404,
            detail="Détail de vente introuvable"
        )

    vente = db.query(Vente).filter(
        Vente.id_vente == detail.id_vente
    ).first()

    if vente is None:
        raise HTTPException(
            status_code=404,
            detail="Vente introuvable"
        )

    if vente.statut != "EN_COURS":
        raise HTTPException(
            status_code=400,
            detail="Impossible de modifier cette vente"
        )

    detail.quantite = detail_data.quantite

    recalculer_total(vente, db)

    db.commit()
    db.refresh(detail)

    return detail


@router.delete(
    "/{id_detail_vente}"
)
def delete_detail_vente(
    id_detail_vente: int,
    db: Session = Depends(get_db)
):

    detail = db.query(DetailVente).filter(
        DetailVente.id_detail_vente == id_detail_vente
    ).first()

    if detail is None:
        raise HTTPException(
            status_code=404,
            detail="Détail de vente introuvable"
        )

    vente = db.query(Vente).filter(
        Vente.id_vente == detail.id_vente
    ).first()

    if vente is None:
        raise HTTPException(
            status_code=404,
            detail="Vente introuvable"
        )

    if vente.statut != "EN_COURS":
        raise HTTPException(
            status_code=400,
            detail="Impossible de modifier cette vente"
        )

    db.delete(detail)
    db.flush()

    recalculer_total(vente, db)

    db.commit()

    return {
        "message": "Détail de vente supprimé"
    }