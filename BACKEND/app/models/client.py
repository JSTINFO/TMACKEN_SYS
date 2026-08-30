from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.models.utilisateur import Utilisateur

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.reservation import Reservation
    from app.models.vente import Vente

class Client(Base):
    __tablename__ = "client"

    id_client: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    nom: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    prenom: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    telephone: Mapped[str | None] = mapped_column(
        String(30),
        nullable=True
    )

    email: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True
    )

    adresse: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )

    date_creation: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.current_timestamp()
    )

    id_utilisateur: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("utilisateur.id_utilisateur"),
        nullable=False
    )

    utilisateur: Mapped["Utilisateur"] = relationship(
        back_populates="clients"
    )


    reservations: Mapped[list["Reservation"]] = relationship(
    back_populates="client"
    )

    ventes: Mapped[list["Vente"]] = relationship(
    back_populates="client"
    )