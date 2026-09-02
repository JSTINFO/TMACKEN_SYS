"""baseline_schema

Revision ID: dddf8b67b392
Revises:
Create Date: 2026-09-02

Cette migration sert uniquement de point de départ
pour une base de données existante.

La base actuelle est considérée comme déjà synchronisée
avec cette révision.
"""

from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "dddf8b67b392"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Migration de référence.

    La base existante est déjà créée.
    Aucun changement de structure n'est effectué ici.
    """
    pass


def downgrade() -> None:
    """
    Aucun changement lors du downgrade de la baseline.
    """
    pass