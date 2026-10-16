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

    id_detail_reservation: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    id_reservation: Mapped[int] = mapped_column(
        ForeignKey("reservation.id_reservation"),
        nullable=False
    )

    id_produit: Mapped[int] = mapped_column(
        ForeignKey("produit.id_produit"),
        nullable=False
    )

    quantite: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    prix_unitaire: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False
    )

    __table_args__ = (
        UniqueConstraint(
            "id_reservation",
            "id_produit",
            name="uq_detail_reservation_produit"
        ),
    )

    reservation: Mapped["Reservation"] = relationship(
        back_populates="details"
    )

    produit: Mapped["Produit"] = relationship(
        back_populates="details_reservation"
    )