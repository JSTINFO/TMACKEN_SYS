from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import (
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    Numeric,
    func
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


if TYPE_CHECKING:
    from app.models.vente import Vente
    from app.models.reservation import Reservation
    from app.models.utilisateur import Utilisateur


class Paiement(Base):
    __tablename__ = "paiement"

    # =========================================================
    # IDENTIFIANT
    # =========================================================

    id_paiement: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    # =========================================================
    # DATE
    # =========================================================

    date_paiement: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.current_timestamp()
    )

    # =========================================================
    # MONTANT
    # =========================================================

    montant: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False
    )

    # =========================================================
    # MODE DE PAIEMENT
    # =========================================================

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

    # =========================================================
    # VENTE
    # =========================================================

    id_vente: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("vente.id_vente"),
        nullable=True
    )

    # =========================================================
    # RESERVATION
    # =========================================================

    id_reservation: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("reservation.id_reservation"),
        nullable=True
    )

    # =========================================================
    # UTILISATEUR
    # =========================================================

    id_utilisateur: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("utilisateur.id_utilisateur"),
        nullable=False
    )

    # =========================================================
    # RELATION VENTE
    # =========================================================

    vente: Mapped["Vente | None"] = relationship(
        back_populates="paiements"
    )

    # =========================================================
    # RELATION RESERVATION
    # =========================================================

    reservation: Mapped["Reservation | None"] = relationship(
        back_populates="paiements"
    )

    # =========================================================
    # RELATION UTILISATEUR
    # =========================================================

    utilisateur: Mapped["Utilisateur"] = relationship(
        back_populates="paiements"
    )