from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


StatutVente = Literal[
    "EN_COURS",
    "PAYEE",
    "ANNULEE"
]


class VenteDetailCreate(BaseModel):
    id_produit: int
    quantite: int = Field(gt=0)


class VenteCreate(BaseModel):
    id_client: int
    id_utilisateur: int
    details: list[VenteDetailCreate]
    statut: StatutVente = "EN_COURS"


class VenteUpdate(BaseModel):
    statut: StatutVente


class VenteResponse(BaseModel):
    id_vente: int
    date_vente: datetime
    total: float
    statut: str
    id_client: int
    id_utilisateur: int

    model_config = ConfigDict(
        from_attributes=True
    )


class VenteDetailProduitResponse(BaseModel):
    id_detail_vente: int
    id_produit: int
    nom_produit: str
    prix_unitaire: float
    quantite: int
    sous_total: float


class VenteCompleteResponse(BaseModel):
    id_vente: int
    date_vente: datetime
    total: float
    statut: str
    id_client: int
    id_utilisateur: int

    details: list[VenteDetailProduitResponse]

    total_calcul: float