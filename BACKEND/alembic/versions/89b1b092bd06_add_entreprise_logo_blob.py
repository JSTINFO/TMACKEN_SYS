"""add entreprise logo blob

Revision ID: 89b1b092bd06
Revises: 5b179e5c3a52
Create Date: 2026-10-16 01:17:04.989124

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision: str = '89b1b092bd06'
down_revision: Union[str, Sequence[str], None] = '5b179e5c3a52'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.add_column(
        "entreprise",
        sa.Column(
            "logo_data",
            mysql.MEDIUMBLOB(),
            nullable=True
        )
    )

    op.add_column(
        "entreprise",
        sa.Column(
            "logo_mime_type",
            sa.String(length=50),
            nullable=True
        )
    )

    op.add_column(
        "entreprise",
        sa.Column(
            "logo_filename",
            sa.String(length=255),
            nullable=True
        )
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_column("entreprise", "logo_filename")
    op.drop_column("entreprise", "logo_mime_type")
    op.drop_column("entreprise", "logo_data")