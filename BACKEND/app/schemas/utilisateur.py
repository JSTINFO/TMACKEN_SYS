from datetime import datetime

from pydantic import BaseModel, ConfigDict


class UtilisateurBase(BaseModel):
    nom: str
    prenom: str
    username: str


class UtilisateurCreate(UtilisateurBase):
    password: str


class UtilisateurUpdate(BaseModel):
    nom: str | None = None
    prenom: str | None = None
    username: str | None = None
    password: str | None = None
    statut: bool | None = None


class UtilisateurResponse(UtilisateurBase):
    id_utilisateur: int
    statut: bool
    date_creation: datetime

    model_config = ConfigDict(
        from_attributes=True
    )