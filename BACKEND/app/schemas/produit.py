from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class ProduitBase(BaseModel):
    nom: str
    description: str | None = None
    prix: Decimal
    seuil_alerte: int = 0
    statut: bool = True


class ProduitCreate(ProduitBase):
    pass


class ProduitUpdate(BaseModel):
    nom: str | None = None
    description: str | None = None
    prix: Decimal | None = None
    seuil_alerte: int | None = None
    statut: bool | None = None


class ProduitResponse(ProduitBase):
    id_produit: int

    model_config = ConfigDict(
        from_attributes=True
    )