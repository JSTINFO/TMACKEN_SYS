from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


# =========================================================
# MODES DE PAIEMENT
# =========================================================

ModePaiement = Literal[
    "ESPECES",
    "CARTE",
    "VIREMENT",
    "CHEQUE",
    "AUTRE"
]


# =========================================================
# CREATION D'UN PAIEMENT
# =========================================================

class PaiementCreate(BaseModel):

    montant: float = Field(
        gt=0
    )

    mode_paiement: ModePaiement

    id_vente: int | None = None

    id_reservation: int | None = None

    id_utilisateur: int


# =========================================================
# REPONSE
# =========================================================

class PaiementResponse(BaseModel):

    id_paiement: int

    date_paiement: datetime

    montant: float

    mode_paiement: str

    id_vente: int | None

    id_reservation: int | None

    id_utilisateur: int

    model_config = ConfigDict(
        from_attributes=True
    )