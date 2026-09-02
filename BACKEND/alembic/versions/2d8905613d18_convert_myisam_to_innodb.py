"""convert_myisam_to_innodb

Revision ID: 2d8905613d18
Revises: dddf8b67b392
Create Date: 2026-09-02

Convertit les tables MyISAM en InnoDB et remplace les anciens
index de clés étrangères par de véritables contraintes FOREIGN KEY.
"""

from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "2d8905613d18"
down_revision: Union[str, Sequence[str], None] = "dddf8b67b392"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ============================================================
    # 1. Conversion MyISAM -> InnoDB
    # ============================================================

    op.execute(
        "ALTER TABLE detail_vente ENGINE=InnoDB"
    )

    op.execute(
        "ALTER TABLE paiement ENGINE=InnoDB"
    )

    op.execute(
        "ALTER TABLE parametre ENGINE=InnoDB"
    )

    # ============================================================
    # 2. Suppression des anciens index utilisés comme pseudo-FK
    # ============================================================

    op.drop_index(
        "fk_detail_vente_produit",
        table_name="detail_vente",
    )

    op.drop_index(
        "fk_paiement_vente",
        table_name="paiement",
    )

    op.drop_index(
        "fk_paiement_utilisateur",
        table_name="paiement",
    )

    # ============================================================
    # 3. Création des vraies FOREIGN KEY
    # ============================================================

    op.create_foreign_key(
        "fk_detail_vente_vente",
        "detail_vente",
        "vente",
        ["id_vente"],
        ["id_vente"],
    )

    op.create_foreign_key(
        "fk_detail_vente_produit",
        "detail_vente",
        "produit",
        ["id_produit"],
        ["id_produit"],
    )

    op.create_foreign_key(
        "fk_paiement_vente",
        "paiement",
        "vente",
        ["id_vente"],
        ["id_vente"],
    )

    op.create_foreign_key(
        "fk_paiement_utilisateur",
        "paiement",
        "utilisateur",
        ["id_utilisateur"],
        ["id_utilisateur"],
    )


def downgrade() -> None:
    # ============================================================
    # 1. Suppression des FOREIGN KEY
    # ============================================================

    op.drop_constraint(
        "fk_paiement_utilisateur",
        "paiement",
        type_="foreignkey",
    )

    op.drop_constraint(
        "fk_paiement_vente",
        "paiement",
        type_="foreignkey",
    )

    op.drop_constraint(
        "fk_detail_vente_produit",
        "detail_vente",
        type_="foreignkey",
    )

    op.drop_constraint(
        "fk_detail_vente_vente",
        "detail_vente",
        type_="foreignkey",
    )

    # ============================================================
    # 2. Retour à MyISAM
    # ============================================================

    op.execute(
        "ALTER TABLE detail_vente ENGINE=MyISAM"
    )

    op.execute(
        "ALTER TABLE paiement ENGINE=MyISAM"
    )

    op.execute(
        "ALTER TABLE parametre ENGINE=MyISAM"
    )