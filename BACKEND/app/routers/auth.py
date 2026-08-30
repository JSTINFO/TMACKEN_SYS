from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.models.utilisateur import Utilisateur
from app.schemas.auth import LoginRequest, TokenResponse
from app.core.security import (
    verify_password,
    create_access_token,
    get_current_user,
    ACCESS_TOKEN_EXPIRE_MINUTES
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentification"]
)


@router.post(
    "/login",
    response_model=TokenResponse
)
def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):

    utilisateur = db.query(Utilisateur).filter(
        Utilisateur.username == login_data.username
    ).first()

    if utilisateur is None:
        raise HTTPException(
            status_code=401,
            detail="Username ou mot de passe incorrect"
        )

    if not verify_password(
        login_data.password,
        utilisateur.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Username ou mot de passe incorrect"
        )

    token = create_access_token(
        data={
            "sub": str(utilisateur.id_utilisateur)
        },
        expires_delta=timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }


@router.get("/me")
def get_me(
    current_user: Utilisateur = Depends(get_current_user)
):
    return {
        "id_utilisateur": current_user.id_utilisateur,
        "nom": current_user.nom,
        "prenom": current_user.prenom,
        "username": current_user.username,
        "statut": current_user.statut,
        "role": current_user.role
    }