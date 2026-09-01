from datetime import datetime

from pydantic import BaseModel, ConfigDict

from typing import Literal


class MouvementStockBase(BaseModel):
    type_mouvement: Literal["ENTREE", "SORTIE"]
    quantite: int
    motif: str | None = None


class MouvementStockCreate(MouvementStockBase):
    id_produit: int


class MouvementStockResponse(MouvementStockBase):
    id_mouvement: int
    date_mouvement: datetime
    id_produit: int
    id_utilisateur: int

    model_config = ConfigDict(
        from_attributes=True
    )