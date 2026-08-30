from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict


class ReservationBase(BaseModel):
    statut: Literal[
        "EN_ATTENTE",
        "CONFIRMEE",
        "ANNULEE",
        "TERMINEE"
    ] = "EN_ATTENTE"


class ReservationCreate(ReservationBase):
    id_client: int
    id_utilisateur: int


class ReservationUpdate(BaseModel):
    statut: Literal[
        "EN_ATTENTE",
        "CONFIRMEE",
        "ANNULEE",
        "TERMINEE"
    ] | None = None


class ReservationResponse(ReservationBase):
    id_reservation: int
    date_reservation: datetime
    id_client: int
    id_utilisateur: int

    model_config = ConfigDict(
        from_attributes=True
    )



# =========================================================
# DETAIL D'UNE RESERVATION
# =========================================================

class ReservationDetailProduitResponse(BaseModel):
    id_detail_reservation: int
    id_produit: int
    nom_produit: str
    prix_unitaire: float
    quantite: int

    model_config = ConfigDict(
        from_attributes=True
    )


class ReservationCompleteResponse(BaseModel):
    id_reservation: int
    date_reservation: datetime
    statut: str
    id_client: int
    id_utilisateur: int
    details: list[ReservationDetailProduitResponse]

    model_config = ConfigDict(
        from_attributes=True
    )