from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database.dependencies import get_db

from app.models.vente import Vente
from app.models.detail_vente import DetailVente
from app.models.produit import Produit
from app.models.stock import Stock


router = APIRouter(
    prefix="/rapports",
    tags=["Rapports"]
)


@router.get("/dashboard")
def rapport_dashboard(
    db: Session = Depends(get_db)
):
    nombre_ventes = db.query(Vente).filter(
        Vente.statut == "PAYEE"
    ).count()

    chiffre_affaires = db.query(
        func.coalesce(
            func.sum(Vente.total),
            0
        )
    ).filter(
        Vente.statut == "PAYEE"
    ).scalar()

    produits_vendus = db.query(
        func.coalesce(
            func.sum(DetailVente.quantite),
            0
        )
    ).join(
        Vente,
        DetailVente.id_vente == Vente.id_vente
    ).filter(
        Vente.statut == "PAYEE"
    ).scalar()

    stock_faible = db.query(
        Stock
    ).join(
        Produit,
        Stock.id_produit == Produit.id_produit
    ).filter(
        Stock.quantite <= Produit.seuil_alerte
    ).count()

    return {
        "nombre_ventes": nombre_ventes,
        "chiffre_affaires": float(chiffre_affaires),
        "produits_vendus": int(produits_vendus),
        "stock_faible": stock_faible
    }


@router.get("/ventes")
def rapport_ventes(
    db: Session = Depends(get_db)
):

    ventes = db.query(Vente).filter(
        Vente.statut == "PAYEE"
    ).order_by(
        Vente.date_vente.desc()
    ).all()

    return [
        {
            "id_vente": vente.id_vente,
            "date_vente": vente.date_vente,
            "total": float(vente.total),
            "id_client": vente.id_client,
            "id_utilisateur": vente.id_utilisateur
        }
        for vente in ventes
    ]


@router.get("/stock-faible")
def rapport_stock_faible(
    db: Session = Depends(get_db)
):

    stocks = (
        db.query(Stock)
        .join(
            Produit,
            Stock.id_produit == Produit.id_produit
        )
        .filter(
            Stock.quantite <= Produit.seuil_alerte
        )
        .all()
    )

    return [
        {
            "id_produit": stock.id_produit,
            "nom_produit": stock.produit.nom,
            "quantite": stock.quantite,
            "seuil_alerte": stock.produit.seuil_alerte
        }
        for stock in stocks
    ]