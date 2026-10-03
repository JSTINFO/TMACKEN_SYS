from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    String,
    func
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from typing import TYPE_CHECKING

from app.models.paiement import Paiement
from app.models.entreprise import Entreprise

if TYPE_CHECKING:
    from app.models.client import Client
    from app.models.mouvement_stock import MouvementStock
    from app.models.reservation import Reservation
    from app.models.vente import Vente
  


class Utilisateur(Base):
    __tablename__ = "utilisateur"

    id_utilisateur: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True
    )


    id_entreprise: Mapped[int | None] = mapped_column(
    ForeignKey("entreprise.id_entreprise"),
    nullable=True
    )

    nom: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    prenom: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    username: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False
    )

    password: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    statut: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True
    )

    date_creation: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.current_timestamp()
    )


    role: Mapped[str] = mapped_column(
    String(20),
    nullable=False,
    default="LECTEUR"
   )



    entreprise: Mapped["Entreprise | None"] = relationship(
    "Entreprise",
    back_populates="utilisateurs"
    )
     
    clients: Mapped[list["Client"]] = relationship(
        back_populates="utilisateur"
    )

    mouvements_stock: Mapped[list["MouvementStock"]] = relationship(
        back_populates="utilisateur"
    )

    reservations: Mapped[list["Reservation"]] = relationship(
        back_populates="utilisateur"
    )

    ventes: Mapped[list["Vente"]] = relationship(
        back_populates="utilisateur"
    )

    paiements: Mapped[list["Paiement"]] = relationship(
    back_populates="utilisateur"
    
    )