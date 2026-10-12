from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
import uuid
from models.schemas import WaterResourceCreate, WaterResourceResponse
from services.firestore_service import FirestoreService
from ml.water_prediction import predict_water_demand
from services.auth_service import AuthenticatedUser, require_admin

router = APIRouter(prefix="/api/water", tags=["Water"])

@router.get("", response_model=List[Dict[str, Any]])
def get_water_resources():
    return FirestoreService.get_all("water_resources")

@router.get("/summary")
def get_water_summary():
    resources = FirestoreService.get_all("water_resources")
    total_capacity = sum(float(w.get("capacity", 0.0)) for w in resources)
    total_current = sum(float(w.get("currentLevel", 0.0)) for w in resources)
    total_daily_usage = sum(float(w.get("dailyUsage", 0.0)) for w in resources)
    total_predicted_demand = sum(float(w.get("predictedDemand", 0.0)) for w in resources)
    
    avail_pct = round((total_current / total_capacity * 100), 1) if total_capacity > 0 else 0.0
    shortage_prob = round(max(5.0, min(95.0, (100.0 - avail_pct) * 1.25)), 1)
    
    risk_level = "High" if avail_pct < 50.0 else ("Medium" if avail_pct < 75.0 else "Low")
    
    return {
        "totalCapacity": total_capacity,
        "currentAvailable": total_current,
        "availabilityPercentage": avail_pct,
        "totalDailyUsage": total_daily_usage,
        "totalPredictedDemand": total_predicted_demand,
        "shortageProbability": shortage_prob,
        "overallWaterRisk": risk_level,
        "resourceCount": len(resources)
    }

@router.post("", response_model=Dict[str, Any])
def create_water_resource(resource: WaterResourceCreate, user: AuthenticatedUser = Depends(require_admin)):
    wid = f"W{uuid.uuid4().hex[:4].upper()}"
    data = resource.dict()
    data["resourceId"] = wid
    
    # Run ML prediction on demand
    pred = predict_water_demand(
        historical_usage=data.get("dailyUsage", 8000.0),
        temperature=29.5
    )
    data["predictedDemand"] = pred["predictedDemand"]
    data["riskLevel"] = pred["riskLevel"]
    
    return FirestoreService.create("water_resources", wid, data)

@router.put("/{resource_id}")
def update_water_resource(
    resource_id: str,
    resource: WaterResourceCreate,
    user: AuthenticatedUser = Depends(require_admin),
):
    existing = FirestoreService.get_by_id("water_resources", resource_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Water resource not found")
    data = resource.dict()
    data["resourceId"] = resource_id
    return FirestoreService.update("water_resources", resource_id, data)

@router.delete("/{resource_id}")
def delete_water_resource(resource_id: str, user: AuthenticatedUser = Depends(require_admin)):
    success = FirestoreService.delete("water_resources", resource_id)
    if not success:
        raise HTTPException(status_code=404, detail="Water resource not found")
    return {"message": f"Resource {resource_id} deleted successfully"}
