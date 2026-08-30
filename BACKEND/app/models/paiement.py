from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, Numeric, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


if TYPE_CHECKING:
    from app.models.vente import Vente
    from app.models.utilisateur import Utilisateur


class Paiement(Base):
    __tablename__ = "paiement"

    id_paiement: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    date_paiement: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.current_timestamp()
    )

    montant: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False
    )

    mode_paiement: Mapped[str] = mapped_column(
        Enum(
            "ESPECES",
            "CARTE",
            "VIREMENT",
            "CHEQUE",
            "AUTRE"
        ),
        nullable=False
    )

    id_vente: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("vente.id_vente"),
        nullable=False
    )

    id_utilisateur: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("utilisateur.id_utilisateur"),
        nullable=False
    )

    vente: Mapped["Vente"] = relationship(
        back_populates="paiements"
    )

    utilisateur: Mapped["Utilisateur"] = relationship(
        back_populates="paiements"
    )