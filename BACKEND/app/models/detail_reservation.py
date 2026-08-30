from __future__ import annotations

from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer, Numeric, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


if TYPE_CHECKING:
    from app.models.reservation import Reservation
    from app.models.produit import Produit


class DetailReservation(Base):
    __tablename__ = "detail_reservation"

    id_reservation: Mapped[int] = mapped_column(
        ForeignKey("reservation.id_reservation"),
        primary_key=True
    )

    id_produit: Mapped[int] = mapped_column(
        ForeignKey("produit.id_produit"),
        primary_key=True
    )

    quantite: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    prix_unitaire: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False
    )

    reservation: Mapped["Reservation"] = relationship(
        back_populates="details"
    )

    produit: Mapped["Produit"] = relationship(
        back_populates="details_reservation"
    )