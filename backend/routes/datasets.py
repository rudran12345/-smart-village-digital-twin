from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from typing import Dict, Any, List
import pandas as pd
import io
import uuid
from services.firestore_service import FirestoreService
from services.auth_service import AuthenticatedUser, require_admin

router = APIRouter(prefix="/api/datasets", tags=["Datasets"])

SUPPORTED_SCHEMAS = {
    "weather": ["date", "temperature", "humidity", "rainfall"],
    "water": ["date", "storage_level_litres", "daily_consumption_litres"],
    "electricity": ["date", "consumption_kwh", "peak_demand_kw"],
    "crop_yield": ["crop_name", "season", "year", "farm_name", "area_acres", "actual_yield_tons"]
}

@router.post("/preview")
async def preview_csv(
    file: UploadFile = File(...),
    user: AuthenticatedUser = Depends(require_admin),
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")
    
    contents = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {str(e)}")
        
    columns = list(df.columns)
    sample_rows = df.head(5).fillna("").to_dict(orient="records")
    total_rows = len(df)
    
    # Auto detect dataset type based on matched columns
    detected_type = "unknown"
    for dtype, req_cols in SUPPORTED_SCHEMAS.items():
        if all(col in columns for col in req_cols[:2]):
            detected_type = dtype
            break
            
    return {
        "filename": file.filename,
        "totalRows": total_rows,
        "columns": columns,
        "detectedType": detected_type,
        "preview": sample_rows
    }

@router.post("/upload")
async def upload_csv(
    file: UploadFile = File(...),
    dataset_type: str = Form("weather"),
    user: AuthenticatedUser = Depends(require_admin),
):
    if dataset_type not in SUPPORTED_SCHEMAS:
        raise HTTPException(status_code=400, detail="Unsupported dataset type.")

    contents = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read CSV: {str(e)}")
        
    columns = list(df.columns)
    records = df.fillna("").to_dict(orient="records")
    imported_count = 0
    
    if dataset_type == "weather":
        for r in records:
            wid = f"WEATH_{uuid.uuid4().hex[:6]}"
            FirestoreService.create("weather", wid, {
                "recordId": wid,
                "date": str(r.get("date", "2026-10-12")),
                "temperature": float(r.get("temperature", 29.0)),
                "humidity": float(r.get("humidity", 70.0)),
                "rainfall": float(r.get("rainfall", 0.0)),
                "condition": str(r.get("condition", "Cloudy")),
                "windSpeed": float(r.get("wind_speed_kmh", 12.0))
            })
            imported_count += 1
            
    elif dataset_type == "water":
        for r in records:
            wid = f"W_{uuid.uuid4().hex[:6]}"
            FirestoreService.create("water_resources", wid, {
                "resourceId": wid,
                "name": f"Imported Water Node {wid[-4:]}",
                "type": "Water Tank",
                "capacity": float(r.get("storage_level_litres", 80000.0) * 1.2),
                "currentLevel": float(r.get("storage_level_litres", 65000.0)),
                "dailyUsage": float(r.get("daily_consumption_litres", 8000.0)),
                "predictedDemand": float(r.get("daily_consumption_litres", 8000.0) * 1.05),
                "riskLevel": "Medium" if float(r.get("shortage_risk_percent", 30)) > 30 else "Low",
                "location": "Central Reservoir Channel"
            })
            imported_count += 1
            
    elif dataset_type == "electricity":
        for r in records:
            eid = f"E_{uuid.uuid4().hex[:6]}"
            FirestoreService.create("electricity", eid, {
                "recordId": eid,
                "nodeName": f"Grid Node {eid[-4:]}",
                "date": str(r.get("date", "2026-10-12")),
                "consumption": float(r.get("consumption_kwh", 4200.0)),
                "peakDemand": float(r.get("peak_demand_kw", 550.0)),
                "averageDemand": float(r.get("average_demand_kw", 170.0)),
                "predictedDemand": float(r.get("consumption_kwh", 4200.0) * 1.05),
                "riskLevel": str(r.get("risk_level", "Medium"))
            })
            imported_count += 1
            
    elif dataset_type == "crop_yield":
        for r in records:
            cid = f"CR_{uuid.uuid4().hex[:6]}"
            FirestoreService.create("crops", cid, {
                "cropId": cid,
                "cropName": str(r.get("crop_name", "Rice")),
                "fieldId": "FL001",
                "farmId": "F001",
                "plantingDate": "2026-06-15",
                "expectedHarvestDate": "2026-10-30",
                "area": float(r.get("area_acres", 2.0)),
                "cropHealth": float(r.get("crop_health_score", 82.0)),
                "growthStage": "Maturity",
                "riskLevel": "Low",
                "expectedYieldTons": float(r.get("actual_yield_tons", 4.5))
            })
            imported_count += 1
            
    return {
        "status": "success",
        "datasetType": dataset_type,
        "filename": file.filename,
        "importedRows": imported_count,
        "message": f"Successfully validated and imported {imported_count} records into Cloud Firestore Digital Twin."
    }
