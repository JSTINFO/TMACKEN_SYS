"""add_rabais_to_vente

Revision ID: 441d1acbbbda
Revises: 2d8905613d18
Create Date: 2026-09-02

Ajoute les informations de rabais aux ventes.
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "441d1acbbbda"
down_revision: Union[str, Sequence[str], None] = "2d8905613d18"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Ajoute les colonnes de rabais à la table vente."""

    op.add_column(
        "vente",
        sa.Column(
            "rabais",
            sa.Numeric(10, 2),
            nullable=False,
            server_default=sa.text("0.00"),
        ),
    )

    op.add_column(
        "vente",
        sa.Column(
            "type_rabais",
            sa.Enum(
                "MONTANT",
                "POURCENTAGE",
                name="type_rabais_enum",
            ),
            nullable=False,
            server_default=sa.text("'MONTANT'"),
        ),
    )


def downgrade() -> None:
    """Supprime les colonnes de rabais."""

    op.drop_column(
        "vente",
        "type_rabais",
    )

    op.drop_column(
        "vente",
        "rabais",
    )