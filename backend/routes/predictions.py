from fastapi import APIRouter
from typing import Dict, Any, List
from models.schemas import (
    WaterPredictionRequest, WaterPredictionResponse,
    CropHealthPredictionRequest, CropHealthPredictionResponse,
    YieldPredictionRequest, YieldPredictionResponse,
    ElectricityPredictionRequest, ElectricityPredictionResponse,
    RiskPredictionRequest, RiskPredictionResponse
)
from services.prediction_service import PredictionService
from services.firestore_service import FirestoreService

router = APIRouter(prefix="/api", tags=["AI Predictions"])

@router.post("/predict-water", response_model=WaterPredictionResponse)
def predict_water(req: WaterPredictionRequest):
    return PredictionService.run_water_prediction(req.dict())

@router.post("/predict-crop-health", response_model=CropHealthPredictionResponse)
def predict_crop_health_endpoint(req: CropHealthPredictionRequest):
    return PredictionService.run_crop_health_prediction(req.dict())

@router.post("/predict-yield", response_model=YieldPredictionResponse)
def predict_crop_yield_endpoint(req: YieldPredictionRequest):
    return PredictionService.run_yield_prediction(req.dict())

@router.post("/predict-electricity", response_model=ElectricityPredictionResponse)
def predict_electricity_endpoint(req: ElectricityPredictionRequest):
    return PredictionService.run_electricity_prediction(req.dict())

@router.post("/predict-risk", response_model=RiskPredictionResponse)
def predict_risk_endpoint(req: RiskPredictionRequest):
    return PredictionService.run_risk_prediction(req.dict())

@router.get("/predictions/history", response_model=List[Dict[str, Any]])
def get_prediction_history():
    preds = FirestoreService.get_all("predictions")
    return sorted(preds, key=lambda x: x.get("timestamp", ""), reverse=True)
