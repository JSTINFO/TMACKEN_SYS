"""Ajout des parametres de recus

Revision ID: 5b179e5c3a52
Revises: 3cd7eeb6de85
Create Date: 2026-10-04 10:11:21.422776

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision: str = '5b179e5c3a52'
down_revision: Union[str, Sequence[str], None] = '3cd7eeb6de85'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.add_column(
        "parametre",
        sa.Column(
            "afficher_logo",
            sa.Boolean(),
            nullable=False,
            server_default=sa.true()
        )
    )

    op.add_column(
        "parametre",
        sa.Column(
            "afficher_adresse",
            sa.Boolean(),
            nullable=False,
            server_default=sa.true()
        )
    )

    op.add_column(
        "parametre",
        sa.Column(
            "afficher_telephone",
            sa.Boolean(),
            nullable=False,
            server_default=sa.true()
        )
    )

    op.add_column(
        "parametre",
        sa.Column(
            "afficher_email",
            sa.Boolean(),
            nullable=False,
            server_default=sa.true()
        )
    )

    op.add_column(
        "parametre",
        sa.Column(
            "message_recu",
            sa.String(length=500),
            nullable=True,
            server_default="Merci pour votre confiance !"
        )
    )

    op.add_column(
        "parametre",
        sa.Column(
            "format_ticket",
            sa.String(length=20),
            nullable=False,
            server_default="80mm"
        )
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_column("parametre", "format_ticket")
    op.drop_column("parametre", "message_recu")
    op.drop_column("parametre", "afficher_email")
    op.drop_column("parametre", "afficher_telephone")
    op.drop_column("parametre", "afficher_adresse")
    op.drop_column("parametre", "afficher_logo")