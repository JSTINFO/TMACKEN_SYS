from datetime import datetime

from sqlalchemy import DateTime, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base

from typing import TYPE_CHECKING

if TYPE_CHECKING:
 from app.models.utilisateur import Utilisateur


class Entreprise(Base):

    __tablename__ = "entreprise"
    __table_args__ = {
    "mysql_engine": "InnoDB"
}

    id_entreprise: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    nom: Mapped[str] = mapped_column(
        String(150),
        nullable=False
    )

    adresse: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )

    telephone: Mapped[str | None] = mapped_column(
        String(30),
        nullable=True
    )

    email: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True
    )

    site_web: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )

    logo: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )

    date_creation: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.current_timestamp()
    )

    utilisateurs: Mapped[list["Utilisateur"]] = relationship(
        "Utilisateur",
        back_populates="entreprise"
    )