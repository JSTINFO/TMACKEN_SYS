from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.models.parametre import Parametre
from app.schemas.parametre import (
    ParametreCreate,
    ParametreUpdate,
    ParametreResponse,
)


router = APIRouter(
    prefix="/parametres",
    tags=["Paramètres"]
)


@router.post(
    "/",
    response_model=ParametreResponse,
    status_code=201
)
def create_parametre(
    parametre_data: ParametreCreate,
    db: Session = Depends(get_db)
):
    parametre = Parametre(
        nom_entreprise=parametre_data.nom_entreprise,
        adresse=parametre_data.adresse,
        telephone=parametre_data.telephone,
        email=parametre_data.email,
        devise=parametre_data.devise,
        seuil_alerte_global=parametre_data.seuil_alerte_global
    )

    db.add(parametre)
    db.commit()
    db.refresh(parametre)

    return parametre


@router.get(
    "/",
    response_model=list[ParametreResponse]
)
def get_parametres(
    db: Session = Depends(get_db)
):
    return db.query(Parametre).all()


@router.get(
    "/{id_parametre}",
    response_model=ParametreResponse
)
def get_parametre(
    id_parametre: int,
    db: Session = Depends(get_db)
):
    parametre = db.query(Parametre).filter(
        Parametre.id_parametre == id_parametre
    ).first()

    if parametre is None:
        raise HTTPException(
            status_code=404,
            detail="Paramètre introuvable"
        )

    return parametre


@router.put(
    "/{id_parametre}",
    response_model=ParametreResponse
)
def update_parametre(
    id_parametre: int,
    parametre_data: ParametreUpdate,
    db: Session = Depends(get_db)
):
    parametre = db.query(Parametre).filter(
        Parametre.id_parametre == id_parametre
    ).first()

    if parametre is None:
        raise HTTPException(
            status_code=404,
            detail="Paramètre introuvable"
        )

    donnees = parametre_data.model_dump(
        exclude_unset=True
    )

    for champ, valeur in donnees.items():
        setattr(parametre, champ, valeur)

    db.commit()
    db.refresh(parametre)

    return parametre