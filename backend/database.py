import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

# We expect SUPABASE_DB_URL in the .env file.
# Supabase Postgres connection string format: postgresql://[user]:[password]@[host]:[port]/[db]
SQLALCHEMY_DATABASE_URL = os.getenv("SUPABASE_DB_URL", "sqlite:///./gaytometro.db")

# Si se usa SQLite por defecto para desarrollo local si no hay DB de Supabase
connect_args = {}
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args=connect_args
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
