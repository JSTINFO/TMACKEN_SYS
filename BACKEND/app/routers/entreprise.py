from pathlib import Path
import uuid
from sqlalchemy.orm import Session

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    UploadFile,
    File,
)

from app.database.dependencies import get_db
from app.models.entreprise import Entreprise
from app.models.utilisateur import Utilisateur

from app.schemas.entreprise import (
    EntrepriseResponse,
    EntrepriseUpdate,
)

from app.core.security import get_current_user

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.models.entreprise import Entreprise
from app.models.utilisateur import Utilisateur

from app.schemas.entreprise import (
    EntrepriseResponse,
    EntrepriseUpdate,
)

from app.core.security import get_current_user


router = APIRouter(
    prefix="/entreprise",
    tags=["Entreprise"]
)


# =========================================================
# GET - ENTREPRISE DE L'UTILISATEUR CONNECTÉ
# =========================================================

@router.get(
    "/me",
    response_model=EntrepriseResponse
)
def get_my_entreprise(
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_user)
):

    if current_user.id_entreprise is None:
        raise HTTPException(
            status_code=404,
            detail="Aucune entreprise associée à cet utilisateur"
        )

    entreprise = (
        db.query(Entreprise)
        .filter(
            Entreprise.id_entreprise
            == current_user.id_entreprise
        )
        .first()
    )

    if entreprise is None:
        raise HTTPException(
            status_code=404,
            detail="Entreprise introuvable"
        )

    return entreprise


# =========================================================
# PUT - MODIFIER L'ENTREPRISE
# =========================================================

@router.put(
    "/me",
    response_model=EntrepriseResponse
)
def update_my_entreprise(
    entreprise_data: EntrepriseUpdate,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_user)
):

    if current_user.id_entreprise is None:
        raise HTTPException(
            status_code=404,
            detail="Aucune entreprise associée à cet utilisateur"
        )

    entreprise = (
        db.query(Entreprise)
        .filter(
            Entreprise.id_entreprise
            == current_user.id_entreprise
        )
        .first()
    )

    if entreprise is None:
        raise HTTPException(
            status_code=404,
            detail="Entreprise introuvable"
        )

    entreprise.nom = entreprise_data.nom
    entreprise.adresse = entreprise_data.adresse
    entreprise.telephone = entreprise_data.telephone
    entreprise.email = entreprise_data.email
    entreprise.site_web = entreprise_data.site_web

    db.commit()
    db.refresh(entreprise)

    return entreprise


# =========================================================
# POST - UPLOAD LOGO ENTREPRISE
# =========================================================

@router.post(
    "/me/logo",
    response_model=EntrepriseResponse
)
async def upload_logo(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_user),
):

    # -----------------------------------------------------
    # Vérifier l'entreprise
    # -----------------------------------------------------

    if current_user.id_entreprise is None:
        raise HTTPException(
            status_code=404,
            detail="Aucune entreprise associée à cet utilisateur"
        )

    entreprise = (
        db.query(Entreprise)
        .filter(
            Entreprise.id_entreprise
            == current_user.id_entreprise
        )
        .first()
    )

    if entreprise is None:
        raise HTTPException(
            status_code=404,
            detail="Entreprise introuvable"
        )

    # -----------------------------------------------------
    # Vérifier le type de fichier
    # -----------------------------------------------------

    allowed_types = {
        "image/png": ".png",
        "image/jpeg": ".jpg",
        "image/webp": ".webp",
    }

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=(
                "Format de logo non autorisé. "
                "Utilisez PNG, JPG ou WEBP."
            )
        )

    # -----------------------------------------------------
    # Lire le fichier
    # -----------------------------------------------------

    content = await file.read()

    # -----------------------------------------------------
    # Limite : 5 MB
    # -----------------------------------------------------

    max_size = 5 * 1024 * 1024

    if len(content) > max_size:
        raise HTTPException(
            status_code=400,
            detail="Le logo ne doit pas dépasser 5 MB."
        )

    # -----------------------------------------------------
    # Dossier de stockage
    # -----------------------------------------------------

    upload_dir = (
        Path(__file__).resolve().parent.parent
        / "uploads"
        / "entreprise"
    )

    upload_dir.mkdir(
        parents=True,
        exist_ok=True
    )

    # -----------------------------------------------------
    # Nom unique
    # -----------------------------------------------------

    extension = allowed_types[file.content_type]

    filename = (
        f"entreprise_{entreprise.id_entreprise}_"
        f"{uuid.uuid4().hex}{extension}"
    )

    file_path = upload_dir / filename

    # -----------------------------------------------------
    # Supprimer l'ancien logo
    # -----------------------------------------------------

    if entreprise.logo:
        old_filename = Path(
            entreprise.logo
        ).name

        old_path = upload_dir / old_filename

        if old_path.exists():
            old_path.unlink()

    # -----------------------------------------------------
    # Sauvegarder le nouveau logo
    # -----------------------------------------------------

    with open(file_path, "wb") as buffer:
        buffer.write(content)

    # -----------------------------------------------------
    # Enregistrer le chemin en DB
    # -----------------------------------------------------

    entreprise.logo = (
        f"/uploads/entreprise/{filename}"
    )

    db.commit()
    db.refresh(entreprise)

    return entreprise