from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

from app.core.config import settings
from app.database.base import Base

# Import de tous les modèles
# afin qu'ils soient enregistrés dans Base.metadata
from app.models.utilisateur import Utilisateur
from app.models.client import Client
from app.models.produit import Produit
from app.models.stock import Stock
from app.models.mouvement_stock import MouvementStock
from app.models.reservation import Reservation
from app.models.detail_reservation import DetailReservation
from app.models.vente import Vente
from app.models.detail_vente import DetailVente
from app.models.paiement import Paiement
from app.models.parametre import Parametre
from app.models.proforma import Proforma
from app.models.detail_proforma import DetailProforma
from app.models.entreprise import Entreprise


# Configuration Alembic
config = context.config


# Configuration des logs depuis alembic.ini
if config.config_file_name is not None:
    fileConfig(config.config_file_name)


# ============================================================
# CONNEXION À LA BASE DE DONNÉES
# ============================================================

DATABASE_URL = (
    f"mysql+pymysql://"
    f"{settings.db_user}:{settings.db_password}"
    f"@{settings.db_host}:{settings.db_port}/"
    f"{settings.db_name}"
)

# On donne à Alembic la vraie URL de notre application
config.set_main_option(
    "sqlalchemy.url",
    DATABASE_URL.replace("%", "%%")
)


# ============================================================
# MÉTADONNÉES DES MODÈLES
# ============================================================

target_metadata = Base.metadata


# ============================================================
# MIGRATION OFFLINE
# ============================================================

def run_migrations_offline() -> None:
    """
    Exécute les migrations sans connexion directe à la base.
    """

    url = config.get_main_option("sqlalchemy.url")

    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={
            "paramstyle": "named"
        },
    )

    with context.begin_transaction():
        context.run_migrations()


# ============================================================
# MIGRATION ONLINE
# ============================================================

def run_migrations_online() -> None:
    """
    Exécute les migrations avec une connexion à MySQL.
    """

    connectable = engine_from_config(
        config.get_section(
            config.config_ini_section,
            {}
        ),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:

        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            compare_server_default=True,
        )

        with context.begin_transaction():
            context.run_migrations()


# ============================================================
# POINT D'ENTRÉE
# ============================================================

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()