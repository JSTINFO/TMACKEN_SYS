from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class Parametre(Base):
    __tablename__ = "parametre"

    id_parametre: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    nom_entreprise: Mapped[str] = mapped_column(
        String(150),
        nullable=False
    )

    adresse: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )

    telephone: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True
    )

    email: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True
    )

    devise: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="HTG"
    )

    seuil_alerte_global: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=5
    )

    # =========================================================
    # PARAMÈTRES DES REÇUS ET DOCUMENTS
    # =========================================================

    afficher_logo: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True
    )

    afficher_adresse: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True
    )

    afficher_telephone: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True
    )

    afficher_email: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True
    )

    message_recu: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
        default="Merci pour votre confiance !"
    )

    format_ticket: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="80mm"
    )

    # =========================================================
    # DATE DE MISE À JOUR
    # =========================================================

    date_mise_a_jour: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.current_timestamp(),
        onupdate=func.current_timestamp()
    )