from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.models.utilisateur import Utilisateur
from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.utilisateur import (
    UtilisateurUpdate,
    PasswordUpdate
)
from app.schemas.utilisateur import UtilisateurUpdate


from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_user,
    ACCESS_TOKEN_EXPIRE_MINUTES
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentification"]
)


# ==========================================
# CONNEXION
# ==========================================

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


# ==========================================
# UTILISATEUR CONNECTÉ
# ==========================================

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
        "role": current_user.role,
        "entreprise": (
            {
                "id_entreprise": current_user.entreprise.id_entreprise,
                "nom": current_user.entreprise.nom,
                "adresse": current_user.entreprise.adresse,
                "telephone": current_user.entreprise.telephone,
                "email": current_user.entreprise.email,
                "site_web": current_user.entreprise.site_web,
                "logo": current_user.entreprise.logo,
            }
            if current_user.entreprise
            else None
        )
    }


# ==========================================
# MODIFIER MON PROFIL
# ==========================================

@router.put("/me")
def update_me(
    data: UtilisateurUpdate,
    current_user: Utilisateur = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    # --------------------------------------
    # NOM
    # --------------------------------------

    if data.nom is not None:
        current_user.nom = data.nom.strip()


    # --------------------------------------
    # PRÉNOM
    # --------------------------------------

    if data.prenom is not None:
        current_user.prenom = data.prenom.strip()


    # --------------------------------------
    # USERNAME
    # --------------------------------------

    if data.username is not None:

        nouveau_username = data.username.strip()

        if not nouveau_username:
            raise HTTPException(
                status_code=400,
                detail="Le nom d'utilisateur ne peut pas être vide"
            )

        utilisateur_existant = (
            db.query(Utilisateur)
            .filter(
                Utilisateur.username == nouveau_username,
                Utilisateur.id_utilisateur != current_user.id_utilisateur
            )
            .first()
        )

        if utilisateur_existant:
            raise HTTPException(
                status_code=400,
                detail="Ce nom d'utilisateur est déjà utilisé"
            )

        current_user.username = nouveau_username


    # --------------------------------------
    # SAUVEGARDE
    # --------------------------------------

    db.commit()

    db.refresh(current_user)


    # --------------------------------------
    # RÉPONSE
    # --------------------------------------

    return {
        "id_utilisateur": current_user.id_utilisateur,
        "nom": current_user.nom,
        "prenom": current_user.prenom,
        "username": current_user.username,
        "statut": current_user.statut,
        "role": current_user.role,
        "date_creation": current_user.date_creation
    }

    # ==========================================
# MODIFIER LE MOT DE PASSE
# ==========================================

@router.put("/me/password")
def update_password(
    data: PasswordUpdate,
    current_user: Utilisateur = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    # Vérifier l'ancien mot de passe
    if not verify_password(
        data.actuel,
        current_user.password
    ):
        raise HTTPException(
            status_code=400,
            detail="Le mot de passe actuel est incorrect"
        )


    # Vérifier que le nouveau mot de passe
    # n'est pas vide
    if not data.nouveau.strip():

        raise HTTPException(
            status_code=400,
            detail="Le nouveau mot de passe ne peut pas être vide"
        )


    # Vérifier que le nouveau mot de passe
    # est différent de l'ancien
    if verify_password(
        data.nouveau,
        current_user.password
    ):

        raise HTTPException(
            status_code=400,
            detail="Le nouveau mot de passe doit être différent"
        )


    # Hasher le nouveau mot de passe
    current_user.password = get_password_hash(
        data.nouveau
    )


    # Sauvegarder
    db.commit()


    return {
        "message": "Mot de passe modifié avec succès"
    }