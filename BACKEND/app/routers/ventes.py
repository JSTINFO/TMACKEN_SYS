from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.dependencies import get_db

from app.models.vente import Vente
from app.models.client import Client
from app.models.detail_vente import DetailVente
from app.models.produit import Produit
from app.models.stock import Stock
from app.models.mouvement_stock import MouvementStock
from app.models.utilisateur import Utilisateur


from app.schemas.vente import (
    VenteCreate,
    VenteUpdate,
    VenteResponse,
    VenteCompleteResponse
)

from app.core.security import get_current_user


router = APIRouter(
    prefix="/ventes",
    tags=["Ventes"]
)


# =========================================================
# CREER UNE VENTE
# =========================================================

@router.post(
    "/",
    response_model=VenteResponse,
    status_code=201
)
def create_vente(
    vente_data: VenteCreate,
    db: Session = Depends(get_db)
):

    # =====================================================
    # CLIENT
    # =====================================================

    client = db.query(Client).filter(
        Client.id_client == vente_data.id_client
    ).first()

    if client is None:
        raise HTTPException(
            status_code=404,
            detail="Client introuvable"
        )

    # =====================================================
    # UTILISATEUR
    # =====================================================

    utilisateur = db.query(Utilisateur).filter(
        Utilisateur.id_utilisateur ==
        vente_data.id_utilisateur
    ).first()

    if utilisateur is None:
        raise HTTPException(
            status_code=404,
            detail="Utilisateur introuvable"
        )

    # =====================================================
    # VERIFIER LES DETAILS
    # =====================================================

    if not vente_data.details:
        raise HTTPException(
            status_code=400,
            detail="La vente doit contenir au moins un produit"
        )

    # =====================================================
    # VERIFIER LES PRODUITS
    # =====================================================

    produits = []

    total = Decimal("0")

    for detail_data in vente_data.details:

        produit = db.query(Produit).filter(
            Produit.id_produit ==
            detail_data.id_produit
        ).first()

        if produit is None:
            raise HTTPException(
                status_code=404,
                detail=(
                    f"Produit introuvable : "
                    f"{detail_data.id_produit}"
                )
            )

        if not produit.statut:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Le produit "
                    f"'{produit.nom}' est désactivé"
                )
            )

        # -------------------------------------------------
        # Vérifier le stock
        # -------------------------------------------------

        stock = db.query(Stock).filter(
            Stock.id_produit ==
            detail_data.id_produit
        ).first()

        if stock is None:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Aucun stock disponible "
                    f"pour '{produit.nom}'"
                )
            )

        if detail_data.quantite > stock.quantite:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Stock insuffisant pour "
                    f"'{produit.nom}'. "
                    f"Disponible : {stock.quantite}, "
                    f"demandé : {detail_data.quantite}"
                )
            )

        # -------------------------------------------------
        # Total
        # -------------------------------------------------

        sous_total = (
            Decimal(str(produit.prix))
            * detail_data.quantite
        )

        total += sous_total

        produits.append(
            (detail_data, produit)
        )

    # =====================================================
    # VERIFIER RABAIS
    # =====================================================

    rabais = Decimal(
        str(vente_data.rabais or 0)
    )

    if rabais < 0:
        raise HTTPException(
            status_code=400,
            detail="Le rabais ne peut pas être négatif"
        )

    # -----------------------------------------------------
    # RABAIS EN POURCENTAGE
    # -----------------------------------------------------

    if vente_data.type_rabais == "POURCENTAGE":

        if rabais > Decimal("100"):
            raise HTTPException(
                status_code=400,
                detail=(
                    "Le rabais en pourcentage "
                    "ne peut pas dépasser 100 %."
                )
            )

        montant_rabais = (
            total * rabais / Decimal("100")
        )

    # -----------------------------------------------------
    # RABAIS EN MONTANT
    # -----------------------------------------------------

    else:

        montant_rabais = rabais

    # -----------------------------------------------------
    # EMPECHER UN TOTAL NEGATIF
    # -----------------------------------------------------

    if montant_rabais > total:
        montant_rabais = total

    # =====================================================
    # TOTAL FINAL
    # =====================================================

    total_final = total - montant_rabais

    # =====================================================
    # VERIFIER DOUBLON PRODUIT
    # =====================================================

    produits_ids = [
        detail.id_produit
        for detail in vente_data.details
    ]

    if len(produits_ids) != len(set(produits_ids)):
        raise HTTPException(
            status_code=400,
            detail=(
                "Un même produit ne peut pas "
                "être ajouté deux fois dans une vente."
            )
        )

    # =====================================================
    # CREER LA VENTE
    # =====================================================

    vente = Vente(
        id_client=vente_data.id_client,
        id_utilisateur=vente_data.id_utilisateur,
        statut="EN_COURS",
        total=total_final,
        rabais=rabais,
        type_rabais=vente_data.type_rabais
    )

    db.add(vente)

    # Important : récupérer id_vente
    db.flush()

    # =====================================================
    # CREER LES DETAILS
    # =====================================================

    for detail_data, produit in produits:

        detail = DetailVente(
            id_vente=vente.id_vente,
            id_produit=produit.id_produit,
            prix_unitaire=produit.prix,
            quantite=detail_data.quantite
        )

        db.add(detail)

    # =====================================================
    # ENREGISTRER
    # =====================================================

    db.commit()

    db.refresh(vente)

    return vente

# =========================================================
# LISTE DES VENTES
# =========================================================

@router.get(
    "/",
    response_model=list[VenteResponse]
)
def get_ventes(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    return db.query(Vente).order_by(
        Vente.id_vente.desc()
    ).all()


# =========================================================
# DETAIL D'UNE VENTE
# =========================================================

@router.get(
    "/{id_vente}",
    response_model=VenteCompleteResponse
)
def get_vente(
    id_vente: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    vente = db.query(Vente).filter(
        Vente.id_vente == id_vente
    ).first()

    if vente is None:
        raise HTTPException(
            status_code=404,
            detail="Vente introuvable"
        )

    details_db = (
        db.query(
            DetailVente.id_detail_vente,
            DetailVente.id_produit,
            Produit.nom.label("nom_produit"),
            DetailVente.prix_unitaire,
            DetailVente.quantite
        )
        .join(
            Produit,
            DetailVente.id_produit == Produit.id_produit
        )
        .filter(
            DetailVente.id_vente == id_vente
        )
        .all()
    )

    details = []

    total_calcul = Decimal("0")

    for detail in details_db:

        prix = Decimal(
            str(detail.prix_unitaire)
        )

        sous_total = (
            prix * detail.quantite
        )

        details.append({
            "id_detail_vente":
                detail.id_detail_vente,

            "id_produit":
                detail.id_produit,

            "nom_produit":
                detail.nom_produit,

            "prix_unitaire":
                float(prix),

            "quantite":
                detail.quantite,

            "sous_total":
                float(sous_total)
        })

        total_calcul += sous_total

    return {
        "id_vente":
            vente.id_vente,

        "date_vente":
            vente.date_vente,

        "total":
            float(vente.total),

        "rabais": float(vente.rabais or 0),
        
        "type_rabais": vente.type_rabais,

        "statut":
            vente.statut,

        "id_client":
            vente.id_client,

        "id_utilisateur":
            vente.id_utilisateur,

        "details":
            details,

        "total_calcul":
            float(total_calcul)

        
    }


# =========================================================
# MODIFIER LE STATUT
# =========================================================

@router.put(
    "/{id_vente}",
    response_model=VenteResponse
)
def update_vente(
    id_vente: int,
    vente_data: VenteUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    vente = db.query(Vente).filter(
        Vente.id_vente == id_vente
    ).first()

    if vente is None:
        raise HTTPException(
            status_code=404,
            detail="Vente introuvable"
        )

    ancien_statut = vente.statut
    nouveau_statut = vente_data.statut

    # -----------------------------------------------------
    # Aucun changement
    # -----------------------------------------------------

    if ancien_statut == nouveau_statut:
        raise HTTPException(
            status_code=400,
            detail="La vente possède déjà ce statut"
        )

    # -----------------------------------------------------
    # Vente déjà terminée
    # -----------------------------------------------------

    if ancien_statut in [
        "PAYEE",
        "ANNULEE"
    ]:
        raise HTTPException(
            status_code=400,
            detail="Cette vente ne peut plus être modifiée"
        )

    # =====================================================
    # PASSAGE EN PAYEE
    # =====================================================

    if (
        ancien_statut == "EN_COURS"
        and nouveau_statut == "PAYEE"
    ):

        details = db.query(DetailVente).filter(
            DetailVente.id_vente == id_vente
        ).all()

        if not details:
            raise HTTPException(
                status_code=400,
                detail="Impossible de payer une vente sans produit"
            )

        stocks_a_modifier = []

        for detail in details:

            stock = db.query(Stock).filter(
                Stock.id_produit == detail.id_produit
            ).first()

            if stock is None:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"Aucun stock pour le produit "
                        f"{detail.id_produit}"
                    )
                )

            if detail.quantite > stock.quantite:
                produit = db.query(Produit).filter(
                    Produit.id_produit ==
                    detail.id_produit
                ).first()

                nom_produit = (
                    produit.nom
                    if produit
                    else str(detail.id_produit)
                )

                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"Stock insuffisant pour "
                        f"« {nom_produit} ». "
                        f"Disponible : {stock.quantite}, "
                        f"demandé : {detail.quantite}"
                    )
                )

            stocks_a_modifier.append(
                (detail, stock)
            )

        # -------------------------------------------------
        # Diminuer le stock
        # -------------------------------------------------

        for detail, stock in stocks_a_modifier:

            stock.quantite -= detail.quantite

            mouvement = MouvementStock(
                type_mouvement="SORTIE",
                quantite=detail.quantite,
                motif=f"Vente #{id_vente}",
                id_produit=detail.id_produit,
                id_utilisateur=current_user.id_utilisateur
            )

            db.add(mouvement)

        vente.statut = "PAYEE"

    # =====================================================
    # ANNULATION
    # =====================================================

    elif (
        ancien_statut == "EN_COURS"
        and nouveau_statut == "ANNULEE"
    ):

        vente.statut = "ANNULEE"

    else:

        raise HTTPException(
            status_code=400,
            detail=(
                f"Transition impossible : "
                f"{ancien_statut} → {nouveau_statut}"
            )
        )

    db.commit()
    db.refresh(vente)

    return vente