from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
from models import Base
import models

# Crear las tablas en la base de datos
# (En producción usaríamos Alembic, para este primer entorno lo generamos directo)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Gaytometro API")

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Cambiar a http://localhost:3000 en el futuro
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Gaytometro API is running"}

# TODO: Añadir routers para usuarios, fotos y votos
