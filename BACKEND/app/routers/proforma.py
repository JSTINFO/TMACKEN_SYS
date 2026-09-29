from datetime import date
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.dependencies import get_db

from app.models.proforma import Proforma
from app.models.detail_proforma import DetailProforma
from app.models.client import Client
from app.models.produit import Produit
from app.models.utilisateur import Utilisateur

from app.schemas.proforma import (
    ProformaCreate,
    ProformaUpdate,
    ProformaResponse,
    ProformaCompleteResponse
)

from app.core.security import get_current_user


router = APIRouter(
    prefix="/proformas",
    tags=["Proformas"]
)


# =========================================================
# CREER UNE PROFORMA
# =========================================================

@router.post(
    "/",
    response_model=ProformaResponse,
    status_code=201
)
def create_proforma(
    proforma_data: ProformaCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    # =====================================================
    # CLIENT
    # =====================================================

    client = db.query(Client).filter(
        Client.id_client == proforma_data.id_client
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
        proforma_data.id_utilisateur
    ).first()

    if utilisateur is None:
        raise HTTPException(
            status_code=404,
            detail="Utilisateur introuvable"
        )

    # =====================================================
    # DETAILS
    # =====================================================

    if not proforma_data.details:
        raise HTTPException(
            status_code=400,
            detail="La proforma doit contenir au moins un produit"
        )

    # =====================================================
    # VERIFIER LES PRODUITS
    # =====================================================

    produits = []

    total = Decimal("0")

    for detail_data in proforma_data.details:

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
        # Calcul du sous-total
        # -------------------------------------------------

        prix_unitaire = Decimal(
            str(produit.prix)
        )

        sous_total = (
            prix_unitaire *
            detail_data.quantite
        )

        total += sous_total

        produits.append(
            (detail_data, produit)
        )

    # =====================================================
    # VERIFIER DOUBLON PRODUIT
    # =====================================================

    produits_ids = [
        detail.id_produit
        for detail in proforma_data.details
    ]

    if len(produits_ids) != len(set(produits_ids)):
        raise HTTPException(
            status_code=400,
            detail=(
                "Un même produit ne peut pas "
                "être ajouté deux fois dans une proforma."
            )
        )

    # =====================================================
    # VERIFIER RABAIS
    # =====================================================

    rabais = Decimal(
        str(proforma_data.rabais or 0)
    )

    if rabais < 0:
        raise HTTPException(
            status_code=400,
            detail="Le rabais ne peut pas être négatif"
        )

    # -----------------------------------------------------
    # RABAIS EN POURCENTAGE
    # -----------------------------------------------------

    if proforma_data.type_rabais == "POURCENTAGE":

        if rabais > Decimal("100"):
            raise HTTPException(
                status_code=400,
                detail=(
                    "Le rabais en pourcentage "
                    "ne peut pas dépasser 100 %."
                )
            )

        montant_rabais = (
            total *
            rabais /
            Decimal("100")
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
    # NUMERO PROFORMA
    # =====================================================

    derniere_proforma = db.query(
        Proforma
    ).order_by(
        Proforma.id_proforma.desc()
    ).first()

    if derniere_proforma is None:
        numero_proforma = "PF-000001"

    else:
        numero_proforma = (
            f"PF-{derniere_proforma.id_proforma + 1:06d}"
        )

    # =====================================================
    # CREER LA PROFORMA
    # =====================================================

    proforma = Proforma(
        numero_proforma=numero_proforma,
        date_validite=proforma_data.date_validite,
        id_client=proforma_data.id_client,
        id_utilisateur=proforma_data.id_utilisateur,
        statut=proforma_data.statut,
        total=total_final,
        rabais=rabais,
        type_rabais=proforma_data.type_rabais
    )

    db.add(proforma)

    # Important :
    # récupérer id_proforma avant de créer les détails
    db.flush()

    # =====================================================
    # CREER LES DETAILS
    # =====================================================

    for detail_data, produit in produits:

        prix_unitaire = Decimal(
            str(produit.prix)
        )

        sous_total = (
            prix_unitaire *
            detail_data.quantite
        )

        detail = DetailProforma(
            id_proforma=proforma.id_proforma,
            id_produit=produit.id_produit,
            prix_unitaire=prix_unitaire,
            quantite=detail_data.quantite,
            sous_total=sous_total
        )

        db.add(detail)

    # =====================================================
    # ENREGISTRER
    # =====================================================

    db.commit()

    db.refresh(proforma)

    return proforma


# =========================================================
# LISTE DES PROFORMAS
# =========================================================

@router.get(
    "/",
    response_model=list[ProformaResponse]
)
def get_proformas(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    return db.query(
        Proforma
    ).order_by(
        Proforma.id_proforma.desc()
    ).all()


# =========================================================
# DETAIL D'UNE PROFORMA
# =========================================================

@router.get(
    "/{id_proforma}",
    response_model=ProformaCompleteResponse
)
def get_proforma(
    id_proforma: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    proforma = db.query(
        Proforma
    ).filter(
        Proforma.id_proforma == id_proforma
    ).first()

    if proforma is None:
        raise HTTPException(
            status_code=404,
            detail="Proforma introuvable"
        )

    # =====================================================
    # RECUPERER LES DETAILS
    # =====================================================

    details_db = (
        db.query(
            DetailProforma.id_detail_proforma,
            DetailProforma.id_produit,
            Produit.nom.label("nom_produit"),
            DetailProforma.prix_unitaire,
            DetailProforma.quantite
        )
        .join(
            Produit,
            DetailProforma.id_produit ==
            Produit.id_produit
        )
        .filter(
            DetailProforma.id_proforma ==
            id_proforma
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
            prix *
            detail.quantite
        )

        details.append({
            "id_detail_proforma":
                detail.id_detail_proforma,

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

    # =====================================================
    # REPONSE
    # =====================================================

    return {
        "id_proforma":
            proforma.id_proforma,

        "numero_proforma":
            proforma.numero_proforma,

        "date_creation":
            proforma.date_creation,

        "date_validite":
            proforma.date_validite,

        "total":
            float(proforma.total),

        "rabais":
            float(proforma.rabais or 0),

        "type_rabais":
            proforma.type_rabais,

        "statut":
            proforma.statut,

        "id_client":
            proforma.id_client,

        "id_utilisateur":
            proforma.id_utilisateur,

        "details":
            details,

        "total_calcul":
            float(total_calcul)
    }


# =========================================================
# MODIFIER LE STATUT
# =========================================================

@router.put(
    "/{id_proforma}",
    response_model=ProformaResponse
)
def update_proforma(
    id_proforma: int,
    proforma_data: ProformaUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    proforma = db.query(
        Proforma
    ).filter(
        Proforma.id_proforma == id_proforma
    ).first()

    if proforma is None:
        raise HTTPException(
            status_code=404,
            detail="Proforma introuvable"
        )

    ancien_statut = proforma.statut
    nouveau_statut = proforma_data.statut

    # =====================================================
    # AUCUN CHANGEMENT
    # =====================================================

    if ancien_statut == nouveau_statut:
        raise HTTPException(
            status_code=400,
            detail="La proforma possède déjà ce statut"
        )

    # =====================================================
    # PROFORMA TERMINEE
    # =====================================================

    if ancien_statut in [
        "REFUSEE",
        "ANNULEE",
        "CONVERTIE"
    ]:
        raise HTTPException(
            status_code=400,
            detail="Cette proforma ne peut plus être modifiée"
        )

    # =====================================================
    # TRANSITIONS
    # =====================================================

    transitions_autorisees = {
        "BROUILLON": [
            "ENVOYEE",
            "ANNULEE"
        ],

        "ENVOYEE": [
            "ACCEPTEE",
            "REFUSEE",
            "EXPIREE",
            "ANNULEE"
        ],

        "ACCEPTEE": [
            "CONVERTIE",
            "ANNULEE"
        ]
    }

    if nouveau_statut not in transitions_autorisees.get(
        ancien_statut,
        []
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                f"Transition impossible : "
                f"{ancien_statut} → {nouveau_statut}"
            )
        )

    proforma.statut = nouveau_statut

    db.commit()

    db.refresh(proforma)

    return proforma