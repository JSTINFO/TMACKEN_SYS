from __future__ import annotations

from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.dependencies import get_db

from app.models.paiement import Paiement
from app.models.vente import Vente
from app.models.reservation import Reservation

from app.models.detail_vente import DetailVente
from app.models.detail_reservation import DetailReservation

from app.models.utilisateur import Utilisateur
from app.models.produit import Produit

from app.models.stock import Stock
from app.models.mouvement_stock import MouvementStock

from app.schemas.paiement import (
    PaiementCreate,
    PaiementResponse
)

from app.core.security import get_current_user


router = APIRouter(
    prefix="/paiements",
    tags=["Paiements"]
)


# =========================================================
# OUTILS
# =========================================================

def calculer_total_vente(
    vente: Vente,
    db: Session
):
    """
    Calcule le total brut, le montant du rabais
    et le total final d'une vente.
    """

    details = (
        db.query(DetailVente)
        .filter(
            DetailVente.id_vente == vente.id_vente
        )
        .all()
    )

    total_brut = Decimal("0")

    for detail in details:

        prix = Decimal(
            str(detail.prix_unitaire)
        )

        total_brut += (
            prix * detail.quantite
        )

    rabais = Decimal(
        str(vente.rabais or 0)
    )

    if rabais < 0:
        rabais = Decimal("0")

    if vente.type_rabais == "POURCENTAGE":

        if rabais > Decimal("100"):
            raise HTTPException(
                status_code=400,
                detail=(
                    "Le rabais en pourcentage "
                    "ne peut pas dépasser 100 %."
                )
            )

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
        total_brut
        - montant_rabais
    )

    return (
        total_brut,
        montant_rabais,
        total_final
    )


def calculer_total_reservation(
    reservation: Reservation,
    db: Session
):
    """
    Calcule le total d'une réservation
    avec son rabais.
    """

    details = (
        db.query(DetailReservation)
        .filter(
            DetailReservation.id_reservation
            == reservation.id_reservation
        )
        .all()
    )

    total_brut = Decimal("0")

    for detail in details:

        prix = Decimal(
            str(detail.prix_unitaire)
        )

        total_brut += (
            prix * detail.quantite
        )

    rabais = Decimal(
        str(reservation.rabais or 0)
    )

    if rabais < 0:
        rabais = Decimal("0")

    if reservation.type_rabais == "POURCENTAGE":

        if rabais > Decimal("100"):
            raise HTTPException(
                status_code=400,
                detail=(
                    "Le rabais en pourcentage "
                    "ne peut pas dépasser 100 %."
                )
            )

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
        total_brut
        - montant_rabais
    )

    return (
        total_brut,
        montant_rabais,
        total_final
    )


# =========================================================
# POST - ENREGISTRER UN PAIEMENT
# =========================================================

@router.post(
    "/",
    response_model=PaiementResponse,
    status_code=201
)
def create_paiement(
    paiement_data: PaiementCreate,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(
        get_current_user
    )
):

    # =====================================================
    # VERIFIER LA CIBLE
    # =====================================================

    if (
        paiement_data.id_vente is None
        and paiement_data.id_reservation is None
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "Le paiement doit être associé "
                "à une vente ou à une réservation."
            )
        )

    if (
        paiement_data.id_vente is not None
        and paiement_data.id_reservation is not None
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "Un paiement ne peut pas être associé "
                "simultanément à une vente et une réservation "
                "dans cette opération."
            )
        )

    # =====================================================
    # UTILISATEUR
    # =====================================================

    user_id = current_user.id_utilisateur

    utilisateur = (
        db.query(Utilisateur)
        .filter(
            Utilisateur.id_utilisateur == user_id
        )
        .first()
    )

    if utilisateur is None:
        raise HTTPException(
            status_code=404,
            detail="Utilisateur introuvable."
        )

    montant_paiement = Decimal(
        str(paiement_data.montant)
    )

    if montant_paiement <= Decimal("0"):
        raise HTTPException(
            status_code=400,
            detail="Le montant du paiement doit être supérieur à zéro."
        )

    # =====================================================
    # =====================================================
    #                 PAIEMENT D'UNE VENTE
    # =====================================================
    # =====================================================

    if paiement_data.id_vente is not None:

        vente = (
            db.query(Vente)
            .filter(
                Vente.id_vente
                == paiement_data.id_vente
            )
            .first()
        )

        if vente is None:
            raise HTTPException(
                status_code=404,
                detail="Vente introuvable."
            )

        # -------------------------------------------------
        # STATUT
        # -------------------------------------------------

        if vente.statut != "EN_COURS":

            raise HTTPException(
                status_code=400,
                detail=(
                    "Cette vente ne peut plus "
                    "recevoir de paiement."
                )
            )

        # -------------------------------------------------
        # DETAILS
        # -------------------------------------------------

        details = (
            db.query(DetailVente)
            .filter(
                DetailVente.id_vente
                == vente.id_vente
            )
            .all()
        )

        if not details:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Impossible de payer une vente "
                    "sans produit."
                )
            )

        # -------------------------------------------------
        # TOTAL
        # -------------------------------------------------

        (
            total_brut,
            montant_rabais,
            total_final
        ) = calculer_total_vente(
            vente,
            db
        )

        # -------------------------------------------------
        # VERIFIER PAIEMENTS EXISTANTS
        # -------------------------------------------------

        paiements_existants = (
            db.query(Paiement)
            .filter(
                Paiement.id_vente
                == vente.id_vente
            )
            .all()
        )

        total_deja_paye = sum(
            (
                Decimal(str(p.montant))
                for p in paiements_existants
            ),
            Decimal("0")
        )

        montant_restant = (
            total_final
            - total_deja_paye
        )

        if montant_restant <= Decimal("0"):

            raise HTTPException(
                status_code=400,
                detail="Cette vente est déjà entièrement payée."
            )

        if montant_paiement > montant_restant:

            raise HTTPException(
                status_code=400,
                detail=(
                    f"Montant trop élevé. "
                    f"Montant restant : "
                    f"{montant_restant:.2f}"
                )
            )

        # -------------------------------------------------
        # PAIEMENT
        # -------------------------------------------------

        paiement = Paiement(
            montant=montant_paiement,
            mode_paiement=paiement_data.mode_paiement,
            id_vente=vente.id_vente,
            id_reservation=None,
            id_utilisateur=user_id
        )

        db.add(paiement)

        # -------------------------------------------------
        # NOUVEAU TOTAL PAYE
        # -------------------------------------------------

        nouveau_total_paye = (
            total_deja_paye
            + montant_paiement
        )

        # -------------------------------------------------
        # PAIEMENT COMPLET
        # -------------------------------------------------

        if nouveau_total_paye >= total_final:

            # ---------------------------------------------
            # VERIFICATION STOCK
            # ---------------------------------------------

            stocks_a_modifier = []

            for detail in details:

                stock = (
                    db.query(Stock)
                    .filter(
                        Stock.id_produit
                        == detail.id_produit
                    )
                    .first()
                )

                produit = (
                    db.query(Produit)
                    .filter(
                        Produit.id_produit
                        == detail.id_produit
                    )
                    .first()
                )

                if stock is None:

                    raise HTTPException(
                        status_code=400,
                        detail=(
                            f"Aucun stock disponible "
                            f"pour le produit "
                            f"#{detail.id_produit}."
                        )
                    )

                if stock.quantite < detail.quantite:

                    nom_produit = (
                        produit.nom
                        if produit
                        else f"#{detail.id_produit}"
                    )

                    raise HTTPException(
                        status_code=400,
                        detail=(
                            f"Stock insuffisant pour "
                            f"« {nom_produit} ». "
                            f"Disponible : "
                            f"{stock.quantite}, "
                            f"demandé : "
                            f"{detail.quantite}."
                        )
                    )

                stocks_a_modifier.append(
                    (detail, stock)
                )

            # ---------------------------------------------
            # DIMINUER STOCK
            # ---------------------------------------------

            for detail, stock in stocks_a_modifier:

                stock.quantite -= detail.quantite

                mouvement = MouvementStock(
                    type_mouvement="SORTIE",
                    quantite=detail.quantite,
                    motif=(
                        f"Paiement Vente "
                        f"#{vente.id_vente}"
                    ),
                    id_produit=detail.id_produit,
                    id_utilisateur=user_id
                )

                db.add(mouvement)

            vente.statut = "PAYEE"

        # -------------------------------------------------
        # ENREGISTRER
        # -------------------------------------------------

        try:

            db.commit()

            db.refresh(paiement)

        except Exception:

            db.rollback()

            raise HTTPException(
                status_code=500,
                detail=(
                    "Impossible d'enregistrer "
                    "le paiement."
                )
            )

        return paiement

    # =====================================================
    # =====================================================
    #              PAIEMENT D'UNE RESERVATION
    # =====================================================
    # =====================================================

    reservation = (
        db.query(Reservation)
        .filter(
            Reservation.id_reservation
            == paiement_data.id_reservation
        )
        .first()
    )

    if reservation is None:

        raise HTTPException(
            status_code=404,
            detail="Réservation introuvable."
        )

    # -----------------------------------------------------
    # STATUT
    # -----------------------------------------------------

    if reservation.statut in [
        "ANNULEE",
        "TERMINEE"
    ]:

        raise HTTPException(
            status_code=400,
            detail=(
                "Cette réservation ne peut plus "
                "recevoir de paiement."
            )
        )

    # -----------------------------------------------------
    # DETAILS
    # -----------------------------------------------------

    details_reservation = (
        db.query(DetailReservation)
        .filter(
            DetailReservation.id_reservation
            == reservation.id_reservation
        )
        .all()
    )

    if not details_reservation:

        raise HTTPException(
            status_code=400,
            detail=(
                "Impossible de payer une réservation "
                "sans produit."
            )
        )

    # -----------------------------------------------------
    # TOTAL RESERVATION
    # -----------------------------------------------------

    (
        total_brut,
        montant_rabais,
        total_final
    ) = calculer_total_reservation(
        reservation,
        db
    )

    # -----------------------------------------------------
    # PAIEMENTS DEJA ENREGISTRES
    # -----------------------------------------------------

    paiements_existants = (
        db.query(Paiement)
        .filter(
            Paiement.id_reservation
            == reservation.id_reservation
        )
        .all()
    )

    total_deja_paye = sum(
        (
            Decimal(str(p.montant))
            for p in paiements_existants
        ),
        Decimal("0")
    )

    montant_restant = (
        total_final
        - total_deja_paye
    )

    if montant_restant <= Decimal("0"):

        raise HTTPException(
            status_code=400,
            detail=(
                "Cette réservation est déjà "
                "entièrement payée."
            )
        )

    if montant_paiement > montant_restant:

        raise HTTPException(
            status_code=400,
            detail=(
                f"Montant trop élevé. "
                f"Montant restant : "
                f"{montant_restant:.2f}"
            )
        )

    # =====================================================
    # PAIEMENT PARTIEL
    # =====================================================

    nouveau_total_paye = (
        total_deja_paye
        + montant_paiement
    )

    if nouveau_total_paye < total_final:

        paiement = Paiement(
            montant=montant_paiement,
            mode_paiement=paiement_data.mode_paiement,
            id_vente=None,
            id_reservation=reservation.id_reservation,
            id_utilisateur=user_id
        )

        db.add(paiement)

        try:

            db.commit()

            db.refresh(paiement)

        except Exception:

            db.rollback()

            raise HTTPException(
                status_code=500,
                detail=(
                    "Impossible d'enregistrer "
                    "le paiement."
                )
            )

        return paiement

    # =====================================================
    # PAIEMENT COMPLET
    # =====================================================

    # Le paiement complet confirme la réservation.
    # Le stock est diminué uniquement après validation du paiement.

    # -----------------------------------------------------
    # VERIFIER LE STOCK AVANT TOUTE MUTATION
    # -----------------------------------------------------

    stocks_a_modifier = []

    for detail_reservation in details_reservation:

        stock = (
            db.query(Stock)
            .filter(
                Stock.id_produit == detail_reservation.id_produit
            )
            .first()
        )

        produit = (
            db.query(Produit)
            .filter(
                Produit.id_produit == detail_reservation.id_produit
            )
            .first()
        )

        if stock is None:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Aucun stock disponible pour le produit "
                    f"#{detail_reservation.id_produit}."
                )
            )

        if stock.quantite < detail_reservation.quantite:
            nom_produit = (
                produit.nom
                if produit
                else f"#{detail_reservation.id_produit}"
            )

            raise HTTPException(
                status_code=400,
                detail=(
                    f"Stock insuffisant pour « {nom_produit} ». "
                    f"Disponible : {stock.quantite}, "
                    f"demandé : {detail_reservation.quantite}."
                )
            )

        stocks_a_modifier.append(
            (detail_reservation, stock)
        )

    # -----------------------------------------------------
    # CREER LA VENTE
    # -----------------------------------------------------

    vente = Vente(
        id_client=reservation.id_client,
        id_utilisateur=user_id,
        statut="PAYEE",
        rabais=reservation.rabais,
        type_rabais=reservation.type_rabais,
        total=total_final
    )

    db.add(vente)
    db.flush()

    # -----------------------------------------------------
    # COPIER LES DETAILS
    # -----------------------------------------------------

    for detail_reservation in details_reservation:

        detail_vente = DetailVente(
            id_vente=vente.id_vente,
            id_produit=detail_reservation.id_produit,
            prix_unitaire=detail_reservation.prix_unitaire,
            quantite=detail_reservation.quantite
        )

        db.add(detail_vente)

    # -----------------------------------------------------
    # CREER LE PAIEMENT
    # -----------------------------------------------------
    # Le paiement reste lié à la réservation.
    # Il ne doit PAS contenir id_vente et id_reservation à la fois.

    paiement = Paiement(
        montant=montant_paiement,
        mode_paiement=paiement_data.mode_paiement,
        id_vente=None,
        id_reservation=reservation.id_reservation,
        id_utilisateur=user_id
    )

    db.add(paiement)

    # -----------------------------------------------------
    # DIMINUER LE STOCK + CREER LES MOUVEMENTS
    # -----------------------------------------------------

    for detail_reservation, stock in stocks_a_modifier:

        stock.quantite -= detail_reservation.quantite

        mouvement = MouvementStock(
            type_mouvement="SORTIE",
            quantite=detail_reservation.quantite,
            motif=(
                f"Paiement Réservation "
                f"#{reservation.id_reservation}"
            ),
            id_produit=detail_reservation.id_produit,
            id_utilisateur=user_id
        )

        db.add(mouvement)

    # -----------------------------------------------------
    # RESERVATION CONFIRMEE
    # -----------------------------------------------------

    reservation.statut = "CONFIRMEE"

    # -----------------------------------------------------
    # ENREGISTREMENT ATOMIQUE
    # -----------------------------------------------------

    try:

        db.commit()

        db.refresh(vente)
        db.refresh(paiement)
        db.refresh(reservation)

    except Exception:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=(
                "Impossible d'enregistrer "
                "le paiement et la vente."
            )
        )

    # =====================================================
    # REPONSE
    # =====================================================

    return {
        "id_paiement": paiement.id_paiement,
        "date_paiement": paiement.date_paiement,
        "montant": paiement.montant,
        "mode_paiement": paiement.mode_paiement,
        "id_vente": paiement.id_vente,
        "id_reservation": paiement.id_reservation,
        "id_utilisateur": paiement.id_utilisateur
    }


# =========================================================
# GET - TOUS LES PAIEMENTS
# =========================================================

@router.get(
    "/",
    response_model=list[PaiementResponse]
)
def get_paiements(
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(
        get_current_user
    )
):

    return (
        db.query(Paiement)
        .order_by(
            Paiement.date_paiement.desc()
        )
        .all()
    )


# =========================================================
# GET - UN PAIEMENT
# =========================================================

@router.get(
    "/{id_paiement}",
    response_model=PaiementResponse
)
def get_paiement(
    id_paiement: int,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(
        get_current_user
    )
):

    paiement = (
        db.query(Paiement)
        .filter(
            Paiement.id_paiement
            == id_paiement
        )
        .first()
    )

    if paiement is None:

        raise HTTPException(
            status_code=404,
            detail="Paiement introuvable."
        )

    return paiement