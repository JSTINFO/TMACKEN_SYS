from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.models.utilisateur import Utilisateur
from app.schemas.utilisateur import UtilisateurResponse


router = APIRouter(
    prefix="/utilisateurs",
    tags=["Utilisateurs"]
)


@router.get("/", response_model=list[UtilisateurResponse])
def get_utilisateurs(
    db: Session = Depends(get_db)
):
    return (
        db.query(Utilisateur)
        .order_by(Utilisateur.nom, Utilisateur.prenom)
        .all()
    )