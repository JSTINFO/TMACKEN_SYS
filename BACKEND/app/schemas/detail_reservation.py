from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class DetailReservationBase(BaseModel):
    quantite: int
    prix_unitaire: Decimal


class DetailReservationCreate(DetailReservationBase):
    id_reservation: int
    id_produit: int


class DetailReservationUpdate(BaseModel):
    quantite: int | None = None
    prix_unitaire: Decimal | None = None


class DetailReservationResponse(DetailReservationBase):
    id_reservation: int
    id_produit: int

    model_config = ConfigDict(
        from_attributes=True
    )