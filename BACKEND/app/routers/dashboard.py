from __future__ import annotations

from decimal import Decimal

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database.dependencies import get_db

from app.models.client import Client
from app.models.produit import Produit
from app.models.stock import Stock
from app.models.vente import Vente
from app.models.reservation import Reservation


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/")
def get_dashboard(
    db: Session = Depends(get_db)
):

    # =========================================================
    # STATISTIQUES
    # =========================================================

    # ---------------------------------------------------------
    # TOTAL CLIENTS
    # ---------------------------------------------------------

    total_clients = (
        db.query(
            func.count(Client.id_client)
        )
        .scalar()
        or 0
    )

    # ---------------------------------------------------------
    # TOTAL PRODUITS
    # ---------------------------------------------------------

    total_produits = (
        db.query(
            func.count(Produit.id_produit)
        )
        .scalar()
        or 0
    )

    # ---------------------------------------------------------
    # STOCK DISPONIBLE
    # ---------------------------------------------------------

    stock_disponible = (
        db.query(
            func.coalesce(
                func.sum(Stock.quantite),
                0
            )
        )
        .scalar()
        or 0
    )

    # ---------------------------------------------------------
    # PRODUITS EN STOCK FAIBLE
    # ---------------------------------------------------------

    produits_stock_faible = (
        db.query(Stock, Produit)
        .join(
            Produit,
            Produit.id_produit == Stock.id_produit
        )
        .filter(
            Stock.quantite <= Produit.seuil_alerte
        )
        .order_by(
            Stock.quantite.asc()
        )
        .all()
    )

    # Nombre de produits en stock faible
    stocks_faibles = len(produits_stock_faible)

    # Liste détaillée des produits
    liste_stocks_faibles = []

    for stock, produit in produits_stock_faible:

        liste_stocks_faibles.append({
            "id_produit": produit.id_produit,
            "nom": produit.nom,
            "description": produit.description,
            "quantite": stock.quantite,
            "seuil_alerte": produit.seuil_alerte
        })

    # =========================================================
    # VENTES DU MOIS
    # =========================================================

    ventes_du_mois = (
        db.query(
            func.coalesce(
                func.sum(Vente.total),
                0
            )
        )
        .filter(
            func.year(Vente.date_vente)
            == func.year(func.current_timestamp()),

            func.month(Vente.date_vente)
            == func.month(func.current_timestamp()),

            Vente.statut != "ANNULEE"
        )
        .scalar()
        or Decimal("0.00")
    )

    # =========================================================
    # ACTIVITÉ RÉCENTE
    # =========================================================
    #
    # UNIQUEMENT :
    # - ventes
    # - réservations
    #
    # =========================================================

    activites = []

    # ---------------------------------------------------------
    # DERNIÈRES VENTES
    # ---------------------------------------------------------

    ventes_recentes = (
        db.query(Vente)
        .filter(
            Vente.statut != "ANNULEE"
        )
        .order_by(
            Vente.date_vente.desc()
        )
        .limit(5)
        .all()
    )

    for vente in ventes_recentes:

        activites.append({
            "type": "vente",
            "titre": "Nouvelle vente",
            "description": f"Vente #{vente.id_vente}",
            "valeur": float(vente.total),
            "date": vente.date_vente.isoformat()
            if vente.date_vente
            else None
        })

    # ---------------------------------------------------------
    # DERNIÈRES RÉSERVATIONS
    # ---------------------------------------------------------

    reservations_recentes = (
        db.query(Reservation)
        .filter(
            Reservation.statut != "ANNULEE"
        )
        .order_by(
            Reservation.date_reservation.desc()
        )
        .limit(5)
        .all()
    )

    for reservation in reservations_recentes:

        activites.append({
            "type": "reservation",
            "titre": "Nouvelle réservation",
            "description": (
                f"Réservation #{reservation.id_reservation}"
            ),
            "valeur": None,
            "date": reservation.date_reservation.isoformat()
            if reservation.date_reservation
            else None
        })

    # ---------------------------------------------------------
    # TRI DES ACTIVITÉS
    # ---------------------------------------------------------

    # Les dates sont déjà converties en ISO,
    # donc on peut les trier directement.

    activites.sort(
        key=lambda activite: activite["date"] or "",
        reverse=True
    )

    # Garder seulement les 5 dernières activités
    activites = activites[:5]

    # =========================================================
    # RÉPONSE
    # =========================================================

    return {

        # -----------------------------------------------------
        # CLIENTS
        # -----------------------------------------------------

        "clients": {
            "total": total_clients
        },

        # -----------------------------------------------------
        # PRODUITS
        # -----------------------------------------------------

        "produits": {
            "total": total_produits
        },

        # -----------------------------------------------------
        # STOCK
        # -----------------------------------------------------

        "stock": {
            "disponible": stock_disponible,

            # ON CONSERVE CETTE VALEUR
            "stocks_faibles": stocks_faibles,

            # Nouvelle liste détaillée
            "produits_faibles": liste_stocks_faibles
        },

        # -----------------------------------------------------
        # VENTES
        # -----------------------------------------------------

        "ventes": {
            "du_mois": float(ventes_du_mois)
        },

        # -----------------------------------------------------
        # ACTIVITÉ RÉCENTE
        # -----------------------------------------------------

        "activites_recentes": activites
    }