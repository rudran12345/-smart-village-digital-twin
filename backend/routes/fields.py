from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Dict, Any, Optional
import uuid
from models.schemas import FieldCreate, FieldResponse
from services.firestore_service import FirestoreService
from ml.crop_health import predict_crop_health
from services.auth_service import (
    AuthenticatedUser,
    get_current_user,
    require_farm_access,
    require_field_access,
)

router = APIRouter(prefix="/api/fields", tags=["Fields"])

@router.get("", response_model=List[Dict[str, Any]])
def get_fields(
    farm_id: Optional[str] = Query(None),
    user: AuthenticatedUser = Depends(get_current_user),
):
    fields = FirestoreService.get_all("fields")
    if user.role != "admin":
        owned_farm_ids = {
            farm.get("farmId")
            for farm in FirestoreService.get_all("farms")
            if farm.get("ownerId") == user.uid
        }
        fields = [field for field in fields if field.get("farmId") in owned_farm_ids]
    if farm_id:
        require_farm_access(user, farm_id)
        fields = [f for f in fields if f.get("farmId") == farm_id]
    return fields

@router.get("/{field_id}")
def get_field(field_id: str, user: AuthenticatedUser = Depends(get_current_user)):
    field = FirestoreService.get_by_id("fields", field_id)
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
    require_farm_access(user, field.get("farmId", ""))
    return field

@router.post("", response_model=Dict[str, Any])
def create_field(field: FieldCreate, user: AuthenticatedUser = Depends(get_current_user)):
    require_farm_access(user, field.farmId)
    fid = f"FL{uuid.uuid4().hex[:4].upper()}"
    data = field.dict()
    data["fieldId"] = fid
    
    # Auto-evaluate crop health using ML
    health_res = predict_crop_health(
        crop=data.get("crop", "Rice"),
        soil_type=data.get("soilType", "Clay"),
        moisture=data.get("moisture", 60.0),
        temperature=data.get("temperature", 29.0),
        rainfall=data.get("rainfall", 100.0)
    )
    data["cropHealth"] = health_res["cropHealth"]
    data["riskLevel"] = health_res["riskLevel"]
    data["riskScore"] = round((100.0 - health_res["cropHealth"]) * 1.2, 1)
    
    return FirestoreService.create("fields", fid, data)

@router.put("/{field_id}")
def update_field(
    field_id: str,
    field: FieldCreate,
    user: AuthenticatedUser = Depends(get_current_user),
):
    require_field_access(user, field_id)
    require_farm_access(user, field.farmId)
    data = field.dict()
    data["fieldId"] = field_id
    
    # Re-evaluate crop health
    health_res = predict_crop_health(
        crop=data.get("crop", "Rice"),
        soil_type=data.get("soilType", "Clay"),
        moisture=data.get("moisture", 60.0),
        temperature=data.get("temperature", 29.0),
        rainfall=data.get("rainfall", 100.0)
    )
    data["cropHealth"] = health_res["cropHealth"]
    data["riskLevel"] = health_res["riskLevel"]
    data["riskScore"] = round((100.0 - health_res["cropHealth"]) * 1.2, 1)
    
    return FirestoreService.update("fields", field_id, data)

@router.delete("/{field_id}")
def delete_field(field_id: str, user: AuthenticatedUser = Depends(get_current_user)):
    require_field_access(user, field_id)
    success = FirestoreService.delete("fields", field_id)
    if not success:
        raise HTTPException(status_code=404, detail="Field not found")
    return {"message": f"Field {field_id} deleted successfully"}
