from datetime import datetime

from sqlalchemy import DateTime, Integer, String, func
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

    date_mise_a_jour: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.current_timestamp(),
        onupdate=func.current_timestamp()
    )