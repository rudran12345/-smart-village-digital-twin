from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
import uuid
from models.schemas import ElectricityRecordCreate, ElectricityRecordResponse
from services.firestore_service import FirestoreService
from ml.electricity_prediction import predict_electricity_demand
from services.auth_service import AuthenticatedUser, require_admin

router = APIRouter(prefix="/api/electricity", tags=["Electricity"])

@router.get("", response_model=List[Dict[str, Any]])
def get_electricity_records():
    return FirestoreService.get_all("electricity")

@router.get("/summary")
def get_electricity_summary():
    records = FirestoreService.get_all("electricity")
    if not records:
        return {
            "currentUsage": 4200.0,
            "averageUsage": 4100.0,
            "peakDemand": 580.0,
            "predictedDemand": 4500.0,
            "riskLevel": "Medium"
        }
    latest = records[0]
    total_consumption = sum(float(r.get("consumption", 0.0)) for r in records)
    avg_consumption = round(total_consumption / len(records), 1)
    max_peak = max(float(r.get("peakDemand", 0.0)) for r in records)
    latest_predicted = float(latest.get("predictedDemand", avg_consumption * 1.05))
    
    return {
        "currentUsage": float(latest.get("consumption", 4200.0)),
        "averageUsage": avg_consumption,
        "peakDemand": max_peak,
        "predictedDemand": latest_predicted,
        "riskLevel": latest.get("riskLevel", "Medium"),
        "totalRecords": len(records)
    }

@router.post("", response_model=Dict[str, Any])
def create_electricity_record(
    record: ElectricityRecordCreate,
    user: AuthenticatedUser = Depends(require_admin),
):
    rid = f"E{uuid.uuid4().hex[:4].upper()}"
    data = record.dict()
    data["recordId"] = rid
    
    # Auto forecast using ML
    pred = predict_electricity_demand(
        previous_consumption=data.get("consumption", 4200.0),
        historical_peak_demand=data.get("peakDemand", 580.0)
    )
    data["predictedDemand"] = pred["predictedDemand"]
    data["riskLevel"] = pred["riskLevel"]
    
    return FirestoreService.create("electricity", rid, data)
