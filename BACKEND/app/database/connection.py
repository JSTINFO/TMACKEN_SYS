from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from app.core.config import settings


DATABASE_URL = (
    f"mysql+pymysql://"
    f"{settings.db_user}:{settings.db_password}"
    f"@{settings.db_host}:{settings.db_port}/"
    f"{settings.db_name}"
)


engine = create_engine(
    DATABASE_URL,
    echo=True
)


SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False
)

def test_connection():
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT DATABASE()"))
            database_name = result.scalar()

            print(f"Connexion MySQL réussie !")
            print(f"Base utilisée : {database_name}")

    except Exception as e:
        print("Erreur de connexion MySQL :")
        print(e)

def test_utilisateur():
    try:
        with engine.connect() as connection:
            result = connection.execute(
                text("SELECT * FROM utilisateur")
            )

            utilisateurs = result.fetchall()

            print(f"Nombre d'utilisateurs : {len(utilisateurs)}")

            for utilisateur in utilisateurs:
                print(utilisateur)

    except Exception as e:
        print("Erreur lors de la lecture de utilisateur :")
        print(e)       