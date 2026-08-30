from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base

from typing import TYPE_CHECKING

from sqlalchemy.orm import relationship

if TYPE_CHECKING:
    from app.models.produit import Produit


class Stock(Base):
    __tablename__ = "stock"

    id_stock: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    quantite: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0
    )

    date_mise_a_jour: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.current_timestamp()
    )

    id_produit: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("produit.id_produit"),
        nullable=False,
        unique=True
    )

    produit: Mapped["Produit"] = relationship(
        back_populates="stock"
    )