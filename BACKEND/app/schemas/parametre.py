from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ParametreCreate(BaseModel):
    nom_entreprise: str
    adresse: str | None = None
    telephone: str | None = None
    email: str | None = None
    devise: str = "HTG"
    seuil_alerte_global: int = Field(default=5, ge=0)

    # Paramètres des reçus
    afficher_logo: bool = True
    afficher_adresse: bool = True
    afficher_telephone: bool = True
    afficher_email: bool = True
    message_recu: str | None = "Merci pour votre confiance !"
    format_ticket: str = "80mm"


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

    # Paramètres des reçus
    afficher_logo: bool | None = None
    afficher_adresse: bool | None = None
    afficher_telephone: bool | None = None
    afficher_email: bool | None = None
    message_recu: str | None = None
    format_ticket: str | None = None


class ParametreResponse(BaseModel):
    id_parametre: int

    nom_entreprise: str
    adresse: str | None
    telephone: str | None
    email: str | None

    devise: str
    seuil_alerte_global: int

    # Paramètres des reçus
    afficher_logo: bool
    afficher_adresse: bool
    afficher_telephone: bool
    afficher_email: bool
    message_recu: str | None
    format_ticket: str

    date_mise_a_jour: datetime

    model_config = ConfigDict(
        from_attributes=True
    )