from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ClientBase(BaseModel):
    nom: str
    prenom: str
    telephone: str | None = None
    email: str | None = None
    adresse: str | None = None


class ClientCreate(ClientBase):
    pass


class ClientUpdate(BaseModel):
    nom: str | None = None
    prenom: str | None = None
    telephone: str | None = None
    email: str | None = None
    adresse: str | None = None


class ClientResponse(ClientBase):
    id_client: int
    date_creation: datetime
    id_utilisateur: int

    model_config = ConfigDict(
        from_attributes=True
    )