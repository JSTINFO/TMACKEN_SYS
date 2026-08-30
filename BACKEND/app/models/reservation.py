from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


if TYPE_CHECKING:
    from app.models.client import Client
    from app.models.utilisateur import Utilisateur
    from app.models.detail_reservation import DetailReservation


class Reservation(Base):
    __tablename__ = "reservation"

    id_reservation: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    date_reservation: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.current_timestamp()
    )

    statut: Mapped[str] = mapped_column(
        Enum(
            "EN_ATTENTE",
            "CONFIRMEE",
            "ANNULEE",
            "TERMINEE"
        ),
        nullable=False,
        default="EN_ATTENTE"
    )

    id_client: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("client.id_client"),
        nullable=False
    )

    id_utilisateur: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("utilisateur.id_utilisateur"),
        nullable=False
    )

    client: Mapped["Client"] = relationship(
        back_populates="reservations"
    )

    utilisateur: Mapped["Utilisateur"] = relationship(
        back_populates="reservations"
    )

    details: Mapped[list["DetailReservation"]] = relationship(
        back_populates="reservation"
    )