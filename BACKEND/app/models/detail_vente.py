from __future__ import annotations

from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer, Numeric, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


if TYPE_CHECKING:
    from app.models.vente import Vente
    from app.models.produit import Produit


class DetailVente(Base):
    __tablename__ = "detail_vente"

    __table_args__ = (
        UniqueConstraint(
            "id_vente",
            "id_produit",
            name="uq_vente_produit"
        ),
    )

    id_detail_vente: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    id_vente: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("vente.id_vente"),
        nullable=False
    )

    id_produit: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("produit.id_produit"),
        nullable=False
    )

    prix_unitaire: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False
    )

    quantite: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    vente: Mapped["Vente"] = relationship(
        back_populates="details"
    )

    produit: Mapped["Produit"] = relationship(
        back_populates="details_vente"
    )