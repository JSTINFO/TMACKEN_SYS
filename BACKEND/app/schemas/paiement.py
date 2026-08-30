from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


ModePaiement = Literal[
    "ESPECES",
    "CARTE",
    "VIREMENT",
    "CHEQUE",
    "AUTRE"
]


class PaiementCreate(BaseModel):
    montant: float = Field(gt=0)
    mode_paiement: ModePaiement
    id_vente: int
    id_utilisateur: int


class PaiementResponse(BaseModel):
    id_paiement: int
    date_paiement: datetime
    montant: float
    mode_paiement: str
    id_vente: int
    id_utilisateur: int

    model_config = ConfigDict(
        from_attributes=True
    )