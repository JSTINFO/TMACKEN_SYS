from pydantic import BaseModel, ConfigDict, Field


class DetailVenteCreate(BaseModel):
    id_vente: int
    id_produit: int
    quantite: int = Field(gt=0)


class DetailVenteUpdate(BaseModel):
    quantite: int = Field(gt=0)


class DetailVenteResponse(BaseModel):
    id_detail_vente: int
    id_vente: int
    id_produit: int
    prix_unitaire: float
    quantite: int

    model_config = ConfigDict(
        from_attributes=True
    )