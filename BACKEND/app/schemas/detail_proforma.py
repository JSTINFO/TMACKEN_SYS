from pydantic import BaseModel, ConfigDict, Field


class DetailProformaCreate(BaseModel):
    id_proforma: int
    id_produit: int
    quantite: int = Field(gt=0)


class DetailProformaUpdate(BaseModel):
    quantite: int = Field(gt=0)


class DetailProformaResponse(BaseModel):
    id_detail_proforma: int
    id_proforma: int
    id_produit: int
    prix_unitaire: float
    quantite: int
    sous_total: float

    model_config = ConfigDict(
        from_attributes=True
    )