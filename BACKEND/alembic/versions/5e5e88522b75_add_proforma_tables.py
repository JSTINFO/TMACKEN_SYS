"""add proforma tables

Revision ID: 5e5e88522b75
Revises: 441d1acbbbda
Create Date: 2026-09-26 11:27:16.325641

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5e5e88522b75'
down_revision: Union[str, Sequence[str], None] = '441d1acbbbda'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.create_table(
        'proforma',

        sa.Column(
            'id_proforma',
            sa.Integer(),
            nullable=False
        ),

        sa.Column(
            'numero_proforma',
            sa.String(length=50),
            nullable=False
        ),

        sa.Column(
            'date_creation',
            sa.DateTime(),
            nullable=False
        ),

        sa.Column(
            'date_validite',
            sa.Date(),
            nullable=True
        ),

        sa.Column(
            'id_client',
            sa.Integer(),
            nullable=False
        ),

        sa.Column(
            'id_utilisateur',
            sa.Integer(),
            nullable=False
        ),

        sa.Column(
            'statut',
            sa.String(length=30),
            nullable=False
        ),

        sa.Column(
            'rabais',
            sa.Numeric(precision=10, scale=2),
            nullable=False
        ),

        sa.Column(
            'type_rabais',
            sa.String(length=20),
            nullable=False
        ),

        sa.Column(
            'total',
            sa.Numeric(precision=10, scale=2),
            nullable=False
        ),

        sa.ForeignKeyConstraint(
            ['id_client'],
            ['client.id_client']
        ),

        sa.ForeignKeyConstraint(
            ['id_utilisateur'],
            ['utilisateur.id_utilisateur']
        ),

        sa.PrimaryKeyConstraint(
            'id_proforma'
        )
    )

    op.create_index(
        op.f('ix_proforma_id_proforma'),
        'proforma',
        ['id_proforma'],
        unique=False
    )

    op.create_index(
        op.f('ix_proforma_numero_proforma'),
        'proforma',
        ['numero_proforma'],
        unique=True
    )


    op.create_table(
        'detail_proforma',

        sa.Column(
            'id_detail_proforma',
            sa.Integer(),
            nullable=False
        ),

        sa.Column(
            'id_proforma',
            sa.Integer(),
            nullable=False
        ),

        sa.Column(
            'id_produit',
            sa.Integer(),
            nullable=False
        ),

        sa.Column(
            'prix_unitaire',
            sa.Numeric(precision=10, scale=2),
            nullable=False
        ),

        sa.Column(
            'quantite',
            sa.Integer(),
            nullable=False
        ),

        sa.Column(
            'sous_total',
            sa.Numeric(precision=10, scale=2),
            nullable=False
        ),

        sa.ForeignKeyConstraint(
            ['id_produit'],
            ['produit.id_produit']
        ),

        sa.ForeignKeyConstraint(
            ['id_proforma'],
            ['proforma.id_proforma']
        ),

        sa.PrimaryKeyConstraint(
            'id_detail_proforma'
        )
    )

    op.create_index(
        op.f('ix_detail_proforma_id_detail_proforma'),
        'detail_proforma',
        ['id_detail_proforma'],
        unique=False
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_index(
        op.f('ix_detail_proforma_id_detail_proforma'),
        table_name='detail_proforma'
    )

    op.drop_table(
        'detail_proforma'
    )

    op.drop_index(
        op.f('ix_proforma_numero_proforma'),
        table_name='proforma'
    )

    op.drop_index(
        op.f('ix_proforma_id_proforma'),
        table_name='proforma'
    )

    op.drop_table(
        'proforma'
    )