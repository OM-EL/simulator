from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Création du chemin pour le fichier SQLite
DB_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "db")
if not os.path.exists(DB_DIR):
    os.makedirs(DB_DIR)

SQLALCHEMY_DATABASE_URL = f"sqlite:///{os.path.join(DB_DIR, 'loan_simulator.sqlite')}"

# Création du moteur SQLAlchemy avec check_same_thread=False pour SQLite
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# Création d'une session locale
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base importée par les modèles
Base = declarative_base()

# Fonction pour obtenir une instance de la base de données
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()