from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


# =========================================================
# DETAIL PRODUIT D'UNE RESERVATION
# =========================================================

class ReservationProduitCreate(BaseModel):
    id_produit: int
    quantite: int = Field(gt=0)


# =========================================================
# RESERVATION
# =========================================================

class ReservationBase(BaseModel):
    statut: Literal[
        "EN_ATTENTE",
        "CONFIRMEE",
        "ANNULEE",
        "TERMINEE"
    ] = "EN_ATTENTE"


class ReservationCreate(BaseModel):
    id_client: int

    details: list[ReservationProduitCreate] = Field(
        min_length=1
    )


class ReservationUpdate(BaseModel):
    statut: Literal[
        "EN_ATTENTE",
        "CONFIRMEE",
        "ANNULEE",
        "TERMINEE"
    ] | None = None


# =========================================================
# REPONSE SIMPLE
# =========================================================

class ReservationResponse(BaseModel):
    id_reservation: int
    date_reservation: datetime
    statut: str
    id_client: int
    id_utilisateur: int

    model_config = ConfigDict(
        from_attributes=True
    )


# =========================================================
# DETAIL PRODUIT
# =========================================================

class ReservationDetailProduitResponse(BaseModel):
    id_produit: int
    nom_produit: str
    prix_unitaire: Decimal
    quantite: int
    sous_total: float

    model_config = ConfigDict(
        from_attributes=True
    )


# =========================================================
# RESERVATION COMPLETE
# =========================================================

class ReservationCompleteResponse(BaseModel):
    id_reservation: int
    date_reservation: datetime
    statut: str
    id_client: int
    id_utilisateur: int

    details: list[ReservationDetailProduitResponse]

    total: Decimal

    model_config = ConfigDict(
        from_attributes=True
    )