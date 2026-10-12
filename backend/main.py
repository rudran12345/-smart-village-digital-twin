import logging
import os
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from config.firebase import init_firebase, is_firebase_live
from data.seed_data import seed_initial_data

from routes.auth import router as auth_router
from routes.villages import router as villages_router
from routes.farms import router as farms_router
from routes.fields import router as fields_router
from routes.crops import router as crops_router
from routes.water import router as water_router
from routes.electricity import router as electricity_router
from routes.weather import router as weather_router
from routes.predictions import router as predictions_router
from routes.simulation import router as simulation_router
from routes.alerts import router as alerts_router
from routes.recommendations import router as recommendations_router
from routes.datasets import router as datasets_router
from services.auth_service import AuthenticatedUser, get_current_user, require_admin

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("smart_village.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize Firebase/Cloud Store and seed data
    logger.info("Initializing Cloud-Based AI Digital Twin API...")
    init_firebase()
    if os.getenv("APP_ENV", "development").lower() != "production":
        seed_initial_data(force=False)
    yield
    logger.info("Shutting down Smart Village API.")

app = FastAPI(
    title="Cloud-Based AI Digital Twin for Smart Village Resource Monitoring and Predictive Analytics",
    description="Full-stack AI Digital Twin without IoT sensors, powered by Cloud Firestore, Scikit-learn, and FastAPI.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS configuration
frontend_origins = []
for configured_origin in os.getenv("FRONTEND_URL", "http://localhost:5173").split(","):
    origin = configured_origin.strip().rstrip("/")
    if origin:
        if not origin.startswith(("http://", "https://")):
            origin = f"https://{origin}"
        frontend_origins.append(origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register All Subsystem Routers
app.include_router(auth_router)
for protected_router in (
    villages_router,
    farms_router,
    fields_router,
    crops_router,
    water_router,
    electricity_router,
    weather_router,
    predictions_router,
    simulation_router,
    alerts_router,
    recommendations_router,
    datasets_router,
):
    app.include_router(protected_router, dependencies=[Depends(get_current_user)])

@app.get("/health", tags=["System"])
def health_check():
    return {
        "status": "ok",
        "service": "Agriculture Smart Village API",
        "cloudStore": "Cloud Firestore" if is_firebase_live() else "Local Firestore Emulation Mode",
        "iotStatus": "DISABLED (Software/Dataset Driven Virtual Twin)"
    }

@app.post("/api/reset-demo", tags=["System"])
def reset_demo_data(user: AuthenticatedUser = Depends(require_admin)):
    if os.getenv("APP_ENV", "development").lower() == "production":
        raise HTTPException(status_code=404, detail="Demo reset is disabled in production.")
    seed_initial_data(force=True)
    return {"status": "success", "message": "Demo data refreshed to default Green Valley Village state."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
