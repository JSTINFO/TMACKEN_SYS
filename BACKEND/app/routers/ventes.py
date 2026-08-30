from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.dependencies import get_db

from app.models.vente import Vente
from app.models.client import Client
from app.models.utilisateur import Utilisateur
from app.models.detail_vente import DetailVente
from app.models.produit import Produit
from app.models.stock import Stock
from app.models.mouvement_stock import MouvementStock

from app.schemas.vente import (
    VenteCreate,
    VenteUpdate,
    VenteResponse,
    VenteCompleteResponse
)


router = APIRouter(
    prefix="/ventes",
    tags=["Ventes"]
)


@router.post(
    "/",
    response_model=VenteResponse,
    status_code=201
)
def create_vente(
    vente_data: VenteCreate,
    db: Session = Depends(get_db)
):

    client = db.query(Client).filter(
        Client.id_client == vente_data.id_client
    ).first()

    if client is None:
        raise HTTPException(
            status_code=404,
            detail="Client introuvable"
        )

    utilisateur = db.query(Utilisateur).filter(
        Utilisateur.id_utilisateur == vente_data.id_utilisateur
    ).first()

    if utilisateur is None:
        raise HTTPException(
            status_code=404,
            detail="Utilisateur introuvable"
        )

    vente = Vente(
        id_client=vente_data.id_client,
        id_utilisateur=vente_data.id_utilisateur,
        statut=vente_data.statut,
        total=0
    )

    db.add(vente)
    db.commit()
    db.refresh(vente)

    return vente


@router.get(
    "/",
    response_model=list[VenteResponse]
)
def get_ventes(
    db: Session = Depends(get_db)
):

    return db.query(Vente).order_by(
        Vente.id_vente.desc()
    ).all()


@router.get(
    "/{id_vente}",
    response_model=VenteCompleteResponse
)
def get_vente(
    id_vente: int,
    db: Session = Depends(get_db)
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

        sous_total = (
            Decimal(str(detail.prix_unitaire))
            * detail.quantite
        )

        details.append({
            "id_detail_vente": detail.id_detail_vente,
            "id_produit": detail.id_produit,
            "nom_produit": detail.nom_produit,
            "prix_unitaire": float(detail.prix_unitaire),
            "quantite": detail.quantite,
            "sous_total": float(sous_total)
        })

        total_calcul += sous_total

    return {
        "id_vente": vente.id_vente,
        "date_vente": vente.date_vente,
        "total": float(vente.total),
        "statut": vente.statut,
        "id_client": vente.id_client,
        "id_utilisateur": vente.id_utilisateur,
        "details": details,
        "total_calcul": float(total_calcul)
    }


@router.put(
    "/{id_vente}",
    response_model=VenteResponse
)
def update_vente(
    id_vente: int,
    vente_data: VenteUpdate,
    db: Session = Depends(get_db)
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

    transitions_autorisees = {
        "EN_COURS": [
            "PAYEE",
            "ANNULEE"
        ],
        "PAYEE": [],
        "ANNULEE": []
    }

    if nouveau_statut not in transitions_autorisees[ancien_statut]:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Transition impossible : "
                f"{ancien_statut} → {nouveau_statut}"
            )
        )

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
                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"Stock insuffisant pour le produit "
                        f"{detail.id_produit}. "
                        f"Disponible : {stock.quantite}, "
                        f"demandé : {detail.quantite}"
                    )
                )

            stocks_a_modifier.append(
                (detail, stock)
            )

        for detail, stock in stocks_a_modifier:

            stock.quantite -= detail.quantite

            mouvement = MouvementStock(
                type_mouvement="SORTIE",
                quantite=detail.quantite,
                motif=f"Vente #{id_vente}",
                id_produit=detail.id_produit,
                id_utilisateur=vente.id_utilisateur
            )

            db.add(mouvement)

        vente.statut = "PAYEE"

    elif (
        ancien_statut == "EN_COURS"
        and nouveau_statut == "ANNULEE"
    ):

        vente.statut = "ANNULEE"

    db.commit()
    db.refresh(vente)

    return vente