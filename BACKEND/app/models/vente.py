from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, Numeric, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.models.paiement import Paiement

if TYPE_CHECKING:
    from app.models.client import Client
    from app.models.utilisateur import Utilisateur
    from app.models.detail_vente import DetailVente


class Vente(Base):
    __tablename__ = "vente"

    id_vente: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    date_vente: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.current_timestamp()
    )

    total: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
        default=0
    )

    rabais: Mapped[Decimal] = mapped_column(
    Numeric(10, 2),
    nullable=False,
    default=0
    )

    type_rabais: Mapped[str] = mapped_column(
        Enum(
            "MONTANT",
            "POURCENTAGE"
        ),
        nullable=False,
        default="MONTANT"
    )


    statut: Mapped[str] = mapped_column(
        Enum(
            "EN_COURS",
            "PAYEE",
            "ANNULEE"
        ),
        nullable=False,
        default="EN_COURS"
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
        back_populates="ventes"
    )

    utilisateur: Mapped["Utilisateur"] = relationship(
        back_populates="ventes"
    )

    details: Mapped[list["DetailVente"]] = relationship(
        back_populates="vente"
    )

    paiements: Mapped[list["Paiement"]] = relationship(
    back_populates="vente"
    )