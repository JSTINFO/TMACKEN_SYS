from sqlalchemy import (
    Column,
    Integer,
    Numeric,
    ForeignKey
)

from app.database.base import Base


class DetailProforma(Base):

    __tablename__ = "detail_proforma"

    id_detail_proforma = Column(
        Integer,
        primary_key=True,
        index=True
    )

    id_proforma = Column(
        Integer,
        ForeignKey("proforma.id_proforma"),
        nullable=False
    )

    id_produit = Column(
        Integer,
        ForeignKey("produit.id_produit"),
        nullable=False
    )

    prix_unitaire = Column(
        Numeric(10, 2),
        nullable=False
    )

    quantite = Column(
        Integer,
        nullable=False
    )

    sous_total = Column(
        Numeric(10, 2),
        nullable=False
    )