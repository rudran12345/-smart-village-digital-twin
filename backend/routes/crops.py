from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Dict, Any, Optional
import uuid
from models.schemas import CropCreate, CropResponse
from services.firestore_service import FirestoreService
from ml.yield_prediction import predict_crop_yield
from services.auth_service import (
    AuthenticatedUser,
    get_current_user,
    require_crop_access,
    require_farm_access,
)

router = APIRouter(prefix="/api/crops", tags=["Crops"])

@router.get("", response_model=List[Dict[str, Any]])
def get_crops(
    farm_id: Optional[str] = Query(None),
    field_id: Optional[str] = Query(None),
    user: AuthenticatedUser = Depends(get_current_user),
):
    crops = FirestoreService.get_all("crops")
    if user.role != "admin":
        owned_farm_ids = {
            farm.get("farmId")
            for farm in FirestoreService.get_all("farms")
            if farm.get("ownerId") == user.uid
        }
        crops = [crop for crop in crops if crop.get("farmId") in owned_farm_ids]
    if farm_id:
        require_farm_access(user, farm_id)
        crops = [c for c in crops if c.get("farmId") == farm_id]
    if field_id:
        crops = [c for c in crops if c.get("fieldId") == field_id]
    return crops

@router.get("/{crop_id}")
def get_crop(crop_id: str, user: AuthenticatedUser = Depends(get_current_user)):
    crop = FirestoreService.get_by_id("crops", crop_id)
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
    require_farm_access(user, crop.get("farmId", ""))
    return crop

@router.post("", response_model=Dict[str, Any])
def create_crop(crop: CropCreate, user: AuthenticatedUser = Depends(get_current_user)):
    require_farm_access(user, crop.farmId)
    field = FirestoreService.get_by_id("fields", crop.fieldId)
    if not field or field.get("farmId") != crop.farmId:
        raise HTTPException(status_code=400, detail="The selected field does not belong to the selected farm.")
    cid = f"CR{uuid.uuid4().hex[:4].upper()}"
    data = crop.dict()
    data["cropId"] = cid
    
    # Calculate yield prediction if not supplied
    if not data.get("expectedYieldTons"):
        yield_res = predict_crop_yield(
            crop=data.get("cropName", "Rice").split()[0],
            area=data.get("area", 2.0),
            crop_health=data.get("cropHealth", 80.0)
        )
        data["expectedYieldTons"] = yield_res["predictedYield"]
        
    return FirestoreService.create("crops", cid, data)

@router.put("/{crop_id}")
def update_crop(
    crop_id: str,
    crop: CropCreate,
    user: AuthenticatedUser = Depends(get_current_user),
):
    require_crop_access(user, crop_id)
    require_farm_access(user, crop.farmId)
    field = FirestoreService.get_by_id("fields", crop.fieldId)
    if not field or field.get("farmId") != crop.farmId:
        raise HTTPException(status_code=400, detail="The selected field does not belong to the selected farm.")
    data = crop.dict()
    data["cropId"] = crop_id
    return FirestoreService.update("crops", crop_id, data)

@router.delete("/{crop_id}")
def delete_crop(crop_id: str, user: AuthenticatedUser = Depends(get_current_user)):
    require_crop_access(user, crop_id)
    success = FirestoreService.delete("crops", crop_id)
    if not success:
        raise HTTPException(status_code=404, detail="Crop not found")
    return {"message": f"Crop {crop_id} deleted successfully"}
