from datetime import datetime

from pydantic import BaseModel, ConfigDict


class StockResponse(BaseModel):
    id_stock: int
    quantite: int
    date_mise_a_jour: datetime
    id_produit: int

    model_config = ConfigDict(
        from_attributes=True
    )