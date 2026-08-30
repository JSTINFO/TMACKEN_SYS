from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.dependencies import get_db

from app.models.paiement import Paiement
from app.models.vente import Vente
from app.models.utilisateur import Utilisateur

from app.schemas.paiement import (
    PaiementCreate,
    PaiementResponse,
)


router = APIRouter(
    prefix="/paiements",
    tags=["Paiements"]
)


@router.post(
    "/",
    response_model=PaiementResponse,
    status_code=201
)
def create_paiement(
    paiement_data: PaiementCreate,
    db: Session = Depends(get_db)
):

    vente = db.query(Vente).filter(
        Vente.id_vente == paiement_data.id_vente
    ).first()

    if vente is None:
        raise HTTPException(
            status_code=404,
            detail="Vente introuvable"
        )

    utilisateur = db.query(Utilisateur).filter(
        Utilisateur.id_utilisateur == paiement_data.id_utilisateur
    ).first()

    if utilisateur is None:
        raise HTTPException(
            status_code=404,
            detail="Utilisateur introuvable"
        )

    if vente.statut != "EN_COURS":
        raise HTTPException(
            status_code=400,
            detail="Cette vente ne peut plus recevoir de paiement"
        )

    paiement = Paiement(
        montant=paiement_data.montant,
        mode_paiement=paiement_data.mode_paiement,
        id_vente=paiement_data.id_vente,
        id_utilisateur=paiement_data.id_utilisateur
    )

    db.add(paiement)

    vente.statut = "PAYEE"

    db.commit()
    db.refresh(paiement)

    return paiement


@router.get(
    "/",
    response_model=list[PaiementResponse]
)
def get_paiements(
    db: Session = Depends(get_db)
):

    return db.query(Paiement).order_by(
        Paiement.id_paiement.desc()
    ).all()


@router.get(
    "/{id_paiement}",
    response_model=PaiementResponse
)
def get_paiement(
    id_paiement: int,
    db: Session = Depends(get_db)
):

    paiement = db.query(Paiement).filter(
        Paiement.id_paiement == id_paiement
    ).first()

    if paiement is None:
        raise HTTPException(
            status_code=404,
            detail="Paiement introuvable"
        )

    return paiement