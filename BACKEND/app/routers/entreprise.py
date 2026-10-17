from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
)
from fastapi.responses import Response
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


# ============================================================
# ENTREPRISE DE L'UTILISATEUR CONNECTÉ
# ============================================================

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
            Entreprise.id_entreprise == current_user.id_entreprise
        )
        .first()
    )

    if entreprise is None:
        raise HTTPException(
            status_code=404,
            detail="Entreprise introuvable"
        )

    return {
    "id_entreprise": entreprise.id_entreprise,
    "nom": entreprise.nom,
    "adresse": entreprise.adresse,
    "telephone": entreprise.telephone,
    "email": entreprise.email,
    "site_web": entreprise.site_web,
    "has_logo": entreprise.logo_data is not None,
}

# ============================================================
# MODIFIER LES INFORMATIONS DE L'ENTREPRISE
# ============================================================

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
            Entreprise.id_entreprise == current_user.id_entreprise
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

    return {
    "id_entreprise": entreprise.id_entreprise,
    "nom": entreprise.nom,
    "adresse": entreprise.adresse,
    "telephone": entreprise.telephone,
    "email": entreprise.email,
    "site_web": entreprise.site_web,
    "has_logo": entreprise.logo_data is not None,
}


# ============================================================
# UPLOAD DU LOGO
# ============================================================

@router.post(
    "/me/logo",
    response_model=EntrepriseResponse
)
async def upload_logo(
    file: UploadFile = File(...),
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
            Entreprise.id_entreprise == current_user.id_entreprise
        )
        .first()
    )

    if entreprise is None:
        raise HTTPException(
            status_code=404,
            detail="Entreprise introuvable"
        )

    # Formats autorisés
    allowed_types = {
        "image/png",
        "image/jpeg",
        "image/webp",
    }

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=(
                "Format de logo non autorisé. "
                "Utilisez PNG, JPG ou WEBP."
            )
        )

    # Lecture du fichier
    content = await file.read()

    # Taille maximale : 5 MB
    max_size = 5 * 1024 * 1024

    if len(content) > max_size:
        raise HTTPException(
            status_code=400,
            detail="Le logo ne doit pas dépasser 5 MB."
        )

    if len(content) == 0:
        raise HTTPException(
            status_code=400,
            detail="Le fichier du logo est vide."
        )

    # Stockage DIRECTEMENT dans MySQL
    entreprise.logo_data = content
    entreprise.logo_mime_type = file.content_type
    entreprise.logo_filename = file.filename

    db.commit()
    db.refresh(entreprise)

    return {
    "id_entreprise": entreprise.id_entreprise,
    "nom": entreprise.nom,
    "adresse": entreprise.adresse,
    "telephone": entreprise.telephone,
    "email": entreprise.email,
    "site_web": entreprise.site_web,
    "has_logo": entreprise.logo_data is not None,
}


# ============================================================
# AFFICHER LE LOGO DE L'ENTREPRISE CONNECTÉE
# ============================================================

@router.get(
    "/me/logo"
)
def get_my_logo(
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
            Entreprise.id_entreprise == current_user.id_entreprise
        )
        .first()
    )

    if entreprise is None:
        raise HTTPException(
            status_code=404,
            detail="Entreprise introuvable"
        )

    if not entreprise.logo_data:
        raise HTTPException(
            status_code=404,
            detail="Aucun logo configuré"
        )

    return Response(
        content=entreprise.logo_data,
        media_type=entreprise.logo_mime_type or "image/png",
        headers={
            "Content-Disposition": "inline"
        }
    )


# ============================================================
# ENTREPRISE PUBLIQUE
# ============================================================

@router.get(
    "/public",
    response_model=EntrepriseResponse
)
def get_public_entreprise(
    db: Session = Depends(get_db)
):
    entreprise = (
        db.query(Entreprise)
        .order_by(
            Entreprise.id_entreprise.asc()
        )
        .first()
    )

    if entreprise is None:
        raise HTTPException(
            status_code=404,
            detail="Aucune entreprise configurée"
        )

    return {
    "id_entreprise": entreprise.id_entreprise,
    "nom": entreprise.nom,
    "adresse": entreprise.adresse,
    "telephone": entreprise.telephone,
    "email": entreprise.email,
    "site_web": entreprise.site_web,
    "has_logo": entreprise.logo_data is not None,
}

# ============================================================
# LOGO PUBLIC
# ============================================================

@router.get(
    "/public/logo"
)
def get_public_logo(
    db: Session = Depends(get_db)
):
    entreprise = (
        db.query(Entreprise)
        .order_by(
            Entreprise.id_entreprise.asc()
        )
        .first()
    )

    if entreprise is None:
        raise HTTPException(
            status_code=404,
            detail="Aucune entreprise configurée"
        )

    if not entreprise.logo_data:
        raise HTTPException(
            status_code=404,
            detail="Aucun logo configuré"
        )

    return Response(
        content=entreprise.logo_data,
        media_type=entreprise.logo_mime_type or "image/png",
        headers={
            "Content-Disposition": "inline"
        }
    )