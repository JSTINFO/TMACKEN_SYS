from datetime import datetime, date
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


StatutProforma = Literal[
    "BROUILLON",
    "ENVOYEE",
    "ACCEPTEE",
    "REFUSEE",
    "EXPIREE",
    "ANNULEE",
    "CONVERTIE"
]


TypeRabais = Literal[
    "MONTANT",
    "POURCENTAGE"
]


class ProformaDetailCreate(BaseModel):
    id_produit: int
    quantite: int = Field(gt=0)


class ProformaCreate(BaseModel):
    id_client: int
    id_utilisateur: int

    date_validite: date | None = None

    details: list[ProformaDetailCreate]

    statut: StatutProforma = "BROUILLON"

    rabais: float = Field(
        default=0,
        ge=0
    )

    type_rabais: TypeRabais = "MONTANT"


class ProformaUpdate(BaseModel):
    statut: StatutProforma


class ProformaResponse(BaseModel):
    id_proforma: int
    numero_proforma: str

    date_creation: datetime
    date_validite: date | None

    total: float

    rabais: float
    type_rabais: str

    statut: str

    id_client: int
    id_utilisateur: int

    model_config = ConfigDict(
        from_attributes=True
    )


class ProformaDetailProduitResponse(BaseModel):
    id_detail_proforma: int

    id_produit: int
    nom_produit: str

    prix_unitaire: float
    quantite: int
    sous_total: float


class ProformaCompleteResponse(BaseModel):
    id_proforma: int
    numero_proforma: str

    date_creation: datetime
    date_validite: date | None

    total: float

    rabais: float
    type_rabais: str

    statut: str

    id_client: int
    id_utilisateur: int

    details: list[ProformaDetailProduitResponse]

    total_calcul: float