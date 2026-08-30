from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.models.mouvement_stock import MouvementStock
from app.models.stock import Stock
from app.models.produit import Produit
from app.models.utilisateur import Utilisateur

from app.schemas.mouvement_stock import (
    MouvementStockCreate,
    MouvementStockResponse
)


router = APIRouter(
    prefix="/mouvements-stock",
    tags=["Mouvements Stock"]
)



@router.post(
    "/",
    response_model=MouvementStockResponse,
    status_code=201
)
def create_mouvement_stock(
    mouvement_data: MouvementStockCreate,
    db: Session = Depends(get_db)
):
    # Vérifier que le produit existe
    produit = db.query(Produit).filter(
        Produit.id_produit == mouvement_data.id_produit
    ).first()

    if produit is None:
        raise HTTPException(
            status_code=404,
            detail="Produit introuvable"
        )

    # Vérifier que l'utilisateur existe
    utilisateur = db.query(Utilisateur).filter(
        Utilisateur.id_utilisateur == mouvement_data.id_utilisateur
    ).first()

    if utilisateur is None:
        raise HTTPException(
            status_code=404,
            detail="Utilisateur introuvable"
        )

    # Vérifier la quantité
    if mouvement_data.quantite <= 0:
        raise HTTPException(
            status_code=400,
            detail="La quantité doit être supérieure à 0"
        )

    # Vérifier le type de mouvement
    if mouvement_data.type_mouvement not in ["ENTREE", "SORTIE"]:
        raise HTTPException(
            status_code=400,
            detail="Type de mouvement invalide"
        )

    # Chercher le stock du produit
    stock = db.query(Stock).filter(
        Stock.id_produit == mouvement_data.id_produit
    ).first()

    # Si le stock n'existe pas encore, on le crée à 0
    if stock is None:
        stock = Stock(
            id_produit=mouvement_data.id_produit,
            quantite=0
        )

        db.add(stock)
        db.flush()

    # Gérer ENTREE
    if mouvement_data.type_mouvement == "ENTREE":

        stock.quantite += mouvement_data.quantite

    # Gérer SORTIE
    elif mouvement_data.type_mouvement == "SORTIE":

        if mouvement_data.quantite > stock.quantite:
            raise HTTPException(
                status_code=400,
                detail="Stock insuffisant"
            )

        stock.quantite -= mouvement_data.quantite

    # Créer le mouvement
    mouvement = MouvementStock(
        type_mouvement=mouvement_data.type_mouvement,
        quantite=mouvement_data.quantite,
        motif=mouvement_data.motif,
        id_produit=mouvement_data.id_produit,
        id_utilisateur=mouvement_data.id_utilisateur
    )

    db.add(mouvement)

    db.commit()
    db.refresh(mouvement)

    return mouvement


@router.get("/", response_model=list[MouvementStockResponse])
def get_mouvements_stock(
    db: Session = Depends(get_db)
):
    mouvements = db.query(MouvementStock).order_by(
        MouvementStock.date_mouvement.desc()
    ).all()

    return mouvements


@router.get(
    "/{id_mouvement}",
    response_model=MouvementStockResponse
)
def get_mouvement_stock(
    id_mouvement: int,
    db: Session = Depends(get_db)
):
    mouvement = db.query(MouvementStock).filter(
        MouvementStock.id_mouvement == id_mouvement
    ).first()

    if mouvement is None:
        raise HTTPException(
            status_code=404,
            detail="Mouvement de stock introuvable"
        )

    return mouvement