from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ParametreCreate(BaseModel):
    nom_entreprise: str
    adresse: str | None = None
    telephone: str | None = None
    email: str | None = None
    devise: str = "HTG"
    seuil_alerte_global: int = Field(default=5, ge=0)


class ParametreUpdate(BaseModel):
    nom_entreprise: str | None = None
    adresse: str | None = None
    telephone: str | None = None
    email: str | None = None
    devise: str | None = None
    seuil_alerte_global: int | None = Field(
        default=None,
        ge=0
    )


class ParametreResponse(BaseModel):
    id_parametre: int
    nom_entreprise: str
    adresse: str | None
    telephone: str | None
    email: str | None
    devise: str
    seuil_alerte_global: int
    date_mise_a_jour: datetime

    model_config = ConfigDict(
        from_attributes=True
    )