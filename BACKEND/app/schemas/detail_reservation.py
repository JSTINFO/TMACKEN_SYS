from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


# =========================================================
# BASE
# =========================================================

class DetailReservationBase(BaseModel):

    quantite: int = Field(
        gt=0
    )

    prix_unitaire: Decimal


# =========================================================
# CREATION
# =========================================================

class DetailReservationCreate(
    DetailReservationBase
):

    id_reservation: int

    id_produit: int


# =========================================================
# MODIFICATION
# =========================================================

class DetailReservationUpdate(BaseModel):

    quantite: int | None = Field(
        default=None,
        gt=0
    )

    prix_unitaire: Decimal | None = None


# =========================================================
# REPONSE
# =========================================================

class DetailReservationResponse(
    DetailReservationBase
):

    id_reservation: int

    id_produit: int

    model_config = ConfigDict(
        from_attributes=True
    )