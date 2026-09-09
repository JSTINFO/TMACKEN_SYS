from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


# =========================================================
# TYPES
# =========================================================

StatutReservation = Literal[
    "EN_ATTENTE",
    "CONFIRMEE",
    "ANNULEE",
    "TERMINEE",
]

TypeRabais = Literal[
    "MONTANT",
    "POURCENTAGE",
]

ModePaiement = Literal[
    "ESPECES",
    "CARTE",
    "VIREMENT",
    "CHEQUE",
    "AUTRE",
]


# =========================================================
# DETAIL RESERVATION - BASE
# =========================================================

class DetailReservationBase(BaseModel):

    id_produit: int

    quantite: int = Field(
        gt=0
    )


# =========================================================
# DETAIL RESERVATION - CREATION
# =========================================================

class DetailReservationCreate(
    DetailReservationBase
):
    pass


# =========================================================
# DETAIL RESERVATION - REPONSE
# =========================================================

class DetailReservationResponse(BaseModel):

    id_produit: int

    nom_produit: str

    prix_unitaire: Decimal

    quantite: int

    sous_total: Decimal

    model_config = ConfigDict(
        from_attributes=True
    )


# =========================================================
# RESERVATION - BASE
# =========================================================

class ReservationBase(BaseModel):

    id_client: int

    rabais: float = Field(
        default=0,
        ge=0
    )

    type_rabais: TypeRabais = "MONTANT"


# =========================================================
# RESERVATION - CREATION
# =========================================================

class ReservationCreate(
    ReservationBase
):

    details: list[DetailReservationCreate] = Field(
        min_length=1
    )


# =========================================================
# RESERVATION - MODIFICATION
# =========================================================

class ReservationUpdate(BaseModel):

    statut: StatutReservation | None = None


# =========================================================
# RESERVATION - REPONSE SIMPLE
# =========================================================

class ReservationResponse(BaseModel):

    id_reservation: int

    date_reservation: datetime

    statut: str

    id_client: int

    id_utilisateur: int

    rabais: float

    type_rabais: str

    model_config = ConfigDict(
        from_attributes=True
    )


# =========================================================
# RESERVATION - REPONSE COMPLETE
# =========================================================

class ReservationCompleteResponse(BaseModel):

    id_reservation: int

    date_reservation: datetime

    statut: str

    id_client: int

    id_utilisateur: int

    details: list[DetailReservationResponse]

    total: Decimal

    rabais: float

    type_rabais: str

    model_config = ConfigDict(
        from_attributes=True
    )


# =========================================================
# PAIEMENT D'UNE RESERVATION
# =========================================================

class ReservationPaiementCreate(BaseModel):

    montant: float = Field(
        gt=0
    )

    mode_paiement: ModePaiement

    id_utilisateur: int | None = None