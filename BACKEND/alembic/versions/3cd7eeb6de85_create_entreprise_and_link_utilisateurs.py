"""create entreprise and link utilisateurs

Revision ID: 3cd7eeb6de85
Revises: 5e5e88522b75
Create Date: 2026-10-02 09:16:06.445668

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "3cd7eeb6de85"

down_revision: Union[str, Sequence[str], None] = "5e5e88522b75"

branch_labels: Union[str, Sequence[str], None] = None

depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    # ==========================================
    # CRÉER L'ENTREPRISE
    # ==========================================

    op.create_table(
        "entreprise",

        sa.Column(
            "id_entreprise",
            sa.Integer(),
            autoincrement=True,
            nullable=False
        ),

        sa.Column(
            "nom",
            sa.String(length=150),
            nullable=False
        ),

        sa.Column(
            "adresse",
            sa.String(length=255),
            nullable=True
        ),

        sa.Column(
            "telephone",
            sa.String(length=30),
            nullable=True
        ),

        sa.Column(
            "email",
            sa.String(length=150),
            nullable=True
        ),

        sa.Column(
            "site_web",
            sa.String(length=255),
            nullable=True
        ),

        sa.Column(
            "logo",
            sa.String(length=255),
            nullable=True
        ),

        sa.Column(
            "date_creation",
            sa.DateTime(),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False
        ),

        sa.PrimaryKeyConstraint(
            "id_entreprise"
        )
    )


    # ==========================================
    # AJOUTER L'ENTREPRISE À UTILISATEUR
    # ==========================================

    op.add_column(
        "utilisateur",

        sa.Column(
            "id_entreprise",
            sa.Integer(),
            nullable=True
        )
    )


    # ==========================================
    # RELATION UTILISATEUR → ENTREPRISE
    # ==========================================

    op.create_foreign_key(
        "fk_utilisateur_entreprise",
        "utilisateur",
        "entreprise",
        ["id_entreprise"],
        ["id_entreprise"]
    )


def downgrade() -> None:
    """Downgrade schema."""

    # ==========================================
    # SUPPRIMER LA RELATION
    # ==========================================

    op.drop_constraint(
        "fk_utilisateur_entreprise",
        "utilisateur",
        type_="foreignkey"
    )


    # ==========================================
    # SUPPRIMER LA COLONNE
    # ==========================================

    op.drop_column(
        "utilisateur",
        "id_entreprise"
    )


    # ==========================================
    # SUPPRIMER L'ENTREPRISE
    # ==========================================

    op.drop_table(
        "entreprise"
    )