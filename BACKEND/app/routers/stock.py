from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.models.stock import Stock
from app.models.produit import Produit
from app.schemas.stock import StockResponse


router = APIRouter(
    prefix="/stock",
    tags=["Stock"]
)


@router.get("/", response_model=list[StockResponse])
def get_stocks(
    db: Session = Depends(get_db)
):
    stocks = db.query(Stock).all()

    return stocks


@router.get("/alertes")
def get_alertes_stock(
    db: Session = Depends(get_db)
):
    stocks = (
        db.query(Stock)
        .join(Produit, Stock.id_produit == Produit.id_produit)
        .filter(
            Stock.quantite <= Produit.seuil_alerte
        )
        .all()
    )

    return [
        {
            "id_stock": stock.id_stock,
            "id_produit": stock.id_produit,
            "nom_produit": stock.produit.nom,
            "quantite": stock.quantite,
            "seuil_alerte": stock.produit.seuil_alerte,
            "message": "Stock faible"
        }
        for stock in stocks
    ]