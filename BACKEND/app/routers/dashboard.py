from decimal import Decimal

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database.dependencies import get_db

from app.models.client import Client
from app.models.produit import Produit
from app.models.stock import Stock
from app.models.vente import Vente
from app.models.mouvement_stock import MouvementStock
from app.models.reservation import Reservation
from app.models.paiement import Paiement


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/")
def get_dashboard(
    db: Session = Depends(get_db)
):

    # =========================================================
    # STATISTIQUES PRINCIPALES
    # =========================================================

    total_clients = (
        db.query(
            func.count(Client.id_client)
        )
        .scalar()
        or 0
    )

    total_produits = (
        db.query(
            func.count(Produit.id_produit)
        )
        .scalar()
        or 0
    )

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

    stocks_faibles = (
        db.query(Stock)
        .join(
            Produit,
            Produit.id_produit == Stock.id_produit
        )
        .filter(
            Stock.quantite <= Produit.seuil_alerte
        )
        .count()
    )

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
    # GRAPHIQUE — VENTES PAR MOIS
    # =========================================================

    ventes_par_mois = []

    resultats_ventes = (
        db.query(
            func.year(Vente.date_vente).label("annee"),
            func.month(Vente.date_vente).label("mois"),
            func.coalesce(
                func.sum(Vente.total),
                0
            ).label("total")
        )
        .filter(
            Vente.statut != "ANNULEE"
        )
        .group_by(
            func.year(Vente.date_vente),
            func.month(Vente.date_vente)
        )
        .order_by(
            func.year(Vente.date_vente),
            func.month(Vente.date_vente)
        )
        .all()
    )

    for ligne in resultats_ventes:

        ventes_par_mois.append({
            "annee": ligne.annee,
            "mois": ligne.mois,
            "total": float(ligne.total or 0)
        })

    # =========================================================
    # GRAPHIQUE — RÉSERVATIONS PAR MOIS
    # =========================================================

    reservations_par_mois = []

    resultats_reservations = (
        db.query(
            func.year(
                Reservation.date_reservation
            ).label("annee"),

            func.month(
                Reservation.date_reservation
            ).label("mois"),

            func.count(
                Reservation.id_reservation
            ).label("total")
        )
        .filter(
            Reservation.statut != "ANNULEE"
        )
        .group_by(
            func.year(
                Reservation.date_reservation
            ),
            func.month(
                Reservation.date_reservation
            )
        )
        .order_by(
            func.year(
                Reservation.date_reservation
            ),
            func.month(
                Reservation.date_reservation
            )
        )
        .all()
    )

    for ligne in resultats_reservations:

        reservations_par_mois.append({
            "annee": ligne.annee,
            "mois": ligne.mois,
            "total": int(ligne.total or 0)
        })

    # =========================================================
    # GRAPHIQUE — PAIEMENTS PAR MODE
    # =========================================================

    paiements_par_mode = []

    resultats_paiements = (
        db.query(
            Paiement.mode_paiement.label("mode"),
            func.coalesce(
                func.sum(Paiement.montant),
                0
            ).label("total")
        )
        .group_by(
            Paiement.mode_paiement
        )
        .order_by(
            Paiement.mode_paiement
        )
        .all()
    )

    for ligne in resultats_paiements:

        paiements_par_mode.append({
            "mode": ligne.mode,
            "total": float(ligne.total or 0)
        })

    # =========================================================
    # ACTIVITÉ RÉCENTE
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
            "valeur": float(vente.total or 0),
            "date": vente.date_vente
        })

    # ---------------------------------------------------------
    # DERNIERS CLIENTS
    # ---------------------------------------------------------

    clients_recents = (
        db.query(Client)
        .order_by(
            Client.date_creation.desc()
        )
        .limit(5)
        .all()
    )

    for client in clients_recents:

        activites.append({
            "type": "client",
            "titre": "Client enregistré",
            "description": (
                f"{client.prenom} {client.nom}"
            ),
            "valeur": None,
            "date": client.date_creation
        })

    # ---------------------------------------------------------
    # DERNIERS MOUVEMENTS DE STOCK
    # ---------------------------------------------------------

    mouvements_recents = (
        db.query(MouvementStock)
        .join(
            Produit,
            Produit.id_produit
            == MouvementStock.id_produit
        )
        .order_by(
            MouvementStock.date_mouvement.desc()
        )
        .limit(5)
        .all()
    )

    for mouvement in mouvements_recents:

        if mouvement.type_mouvement == "ENTREE":
            titre = "Stock ajouté"
        else:
            titre = "Stock sorti"

        activites.append({
            "type": "stock",
            "titre": titre,
            "description": mouvement.produit.nom,
            "valeur": mouvement.quantite,
            "date": mouvement.date_mouvement
        })

    # =========================================================
    # TRI DES ACTIVITÉS
    # =========================================================

    activites.sort(
        key=lambda activite: activite["date"],
        reverse=True
    )

    activites = activites[:5]

    # =========================================================
    # CONVERSION DES DATES
    # =========================================================

    for activite in activites:

        if activite["date"] is not None:

            activite["date"] = (
                activite["date"].isoformat()
            )

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
            "stocks_faibles": stocks_faibles
        },

        # -----------------------------------------------------
        # VENTES
        # -----------------------------------------------------

        "ventes": {
            "du_mois": float(ventes_du_mois)
        },

        # -----------------------------------------------------
        # GRAPHIQUE VENTES
        # -----------------------------------------------------

        "ventes_par_mois": ventes_par_mois,

        # -----------------------------------------------------
        # GRAPHIQUE RÉSERVATIONS
        # -----------------------------------------------------

        "reservations_par_mois": reservations_par_mois,

        # -----------------------------------------------------
        # GRAPHIQUE PAIEMENTS
        # -----------------------------------------------------

        "paiements_par_mode": paiements_par_mode,

        # -----------------------------------------------------
        # ACTIVITÉ RÉCENTE
        # -----------------------------------------------------

        "activites_recentes": activites
    }