from fastapi import FastAPI

from app.core.config import settings
from app.database.connection import test_connection
from app.routers.clients import router as clients_router
from app.routers.produits import router as produits_router
from app.routers.stock import router as stock_router
from app.routers.mouvements_stock import router as mouvements_stock_router
from app.routers.reservations import router as reservations_router
from app.routers.details_reservation import (
    router as details_reservation_router
)
from app.routers.ventes import router as ventes_router
from app.routers.details_vente import router as details_vente_router
from app.routers.paiements import router as paiements_router
from app.routers.rapports import router as rapports_router
from app.routers.auth import router as auth_router
from app.routers.parametres import router as parametres_router
from fastapi.middleware.cors import CORSMiddleware
from app.routers.dashboard import router as dashboard_router

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="API du système de gestion Tmacken"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://192.168.1.226:5173",

    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    test_connection()

app.include_router(clients_router)
app.include_router(produits_router)
app.include_router(stock_router)
app.include_router(mouvements_stock_router)
app.include_router(reservations_router)
app.include_router(details_reservation_router)
app.include_router(ventes_router)
app.include_router(details_vente_router)
app.include_router(paiements_router)
app.include_router(rapports_router)
app.include_router(auth_router)
app.include_router(parametres_router)
app.include_router(dashboard_router)

@app.get("/")
def accueil():
    return {
        "message": "Tmacken System API fonctionne",
        "version": settings.app_version
    }


