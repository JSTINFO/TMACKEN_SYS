from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


if TYPE_CHECKING:
    from app.models.produit import Produit
    from app.models.utilisateur import Utilisateur


class MouvementStock(Base):
    __tablename__ = "mouvement_stock"

    id_mouvement: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    type_mouvement: Mapped[str] = mapped_column(
        Enum("ENTREE", "SORTIE"),
        nullable=False
    )

    quantite: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    date_mouvement: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.current_timestamp()
    )

    motif: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )

    id_produit: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("produit.id_produit"),
        nullable=False
    )

    id_utilisateur: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("utilisateur.id_utilisateur"),
        nullable=False
    )

    produit: Mapped["Produit"] = relationship(
        back_populates="mouvements_stock"
    )

    utilisateur: Mapped["Utilisateur"] = relationship(
        back_populates="mouvements_stock"
    )