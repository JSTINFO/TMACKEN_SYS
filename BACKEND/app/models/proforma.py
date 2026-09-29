from datetime import datetime, date

from sqlalchemy import (
    Column,
    Integer,
    String,
    Numeric,
    Date,
    DateTime,
    ForeignKey
)

from app.database.base import Base


class Proforma(Base):

    __tablename__ = "proforma"

    id_proforma = Column(
        Integer,
        primary_key=True,
        index=True
    )

    numero_proforma = Column(
        String(50),
        unique=True,
        nullable=False,
        index=True
    )

    date_creation = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    date_validite = Column(
        Date,
        nullable=True
    )

    id_client = Column(
        Integer,
        ForeignKey("client.id_client"),
        nullable=False
    )

    id_utilisateur = Column(
        Integer,
        ForeignKey("utilisateur.id_utilisateur"),
        nullable=False
    )

    statut = Column(
        String(30),
        default="BROUILLON",
        nullable=False
    )

    rabais = Column(
        Numeric(10, 2),
        default=0,
        nullable=False
    )

    type_rabais = Column(
        String(20),
        default="MONTANT",
        nullable=False
    )

    total = Column(
        Numeric(10, 2),
        default=0,
        nullable=False
    )