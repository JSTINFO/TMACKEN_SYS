from __future__ import annotations

from decimal import Decimal

from sqlalchemy import Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base

from typing import TYPE_CHECKING

from sqlalchemy.orm import relationship

if TYPE_CHECKING:
    from app.models.stock import Stock
    from app.models.mouvement_stock import MouvementStock
    from app.models.detail_reservation import DetailReservation
    from app.models.detail_vente import DetailVente


class Produit(Base):
    __tablename__ = "produit"

    id_produit: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    nom: Mapped[str] = mapped_column(
        String(150),
        nullable=False
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    prix: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False
    )

    seuil_alerte: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0
    )

    statut: Mapped[bool] = mapped_column(
        nullable=False,
        default=True
    )

    stock: Mapped["Stock"] = relationship(
         back_populates="produit",
         uselist=False
    )   

    mouvements_stock: Mapped[list["MouvementStock"]] = relationship(
        back_populates="produit"
    )

    details_reservation: Mapped[list["DetailReservation"]] = relationship(
        back_populates="produit"
    )

    details_vente: Mapped[list["DetailVente"]] = relationship(
        back_populates="produit"
    )