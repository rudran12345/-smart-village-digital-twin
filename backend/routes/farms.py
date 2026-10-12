from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Dict, Any, Optional
import uuid
from models.schemas import FarmCreate, FarmResponse
from services.firestore_service import FirestoreService
from services.auth_service import AuthenticatedUser, get_current_user, require_farm_access

router = APIRouter(prefix="/api/farms", tags=["Farms"])

@router.get("", response_model=List[Dict[str, Any]])
def get_farms(
    owner_id: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    user: AuthenticatedUser = Depends(get_current_user),
):
    farms = FirestoreService.get_all("farms")
    fields = FirestoreService.get_all("fields")
    
    if user.role != "admin":
        farms = [f for f in farms if f.get("ownerId") == user.uid]
    elif owner_id:
        farms = [f for f in farms if f.get("ownerId") == owner_id]
        
    if search:
        s = search.lower()
        farms = [
            f for f in farms
            if s in f.get("farmName", "").lower()
            or s in f.get("farmerName", "").lower()
            or s in f.get("location", "").lower()
            or s in f.get("soilType", "").lower()
        ]
        
    for f in farms:
        fid = f.get("farmId")
        farm_fields = [fld for fld in fields if fld.get("farmId") == fid]
        f["fieldsCount"] = len(farm_fields)
        
    return farms

@router.get("/{farm_id}")
def get_farm(farm_id: str, user: AuthenticatedUser = Depends(get_current_user)):
    farm = FirestoreService.get_by_id("farms", farm_id)
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    require_farm_access(user, farm_id)
    fields = [fld for fld in FirestoreService.get_all("fields") if fld.get("farmId") == farm_id]
    farm["fields"] = fields
    farm["fieldsCount"] = len(fields)
    return farm

@router.post("", response_model=Dict[str, Any])
def create_farm(farm: FarmCreate, user: AuthenticatedUser = Depends(get_current_user)):
    fid = f"F{uuid.uuid4().hex[:4].upper()}"
    data = farm.dict()
    data["farmId"] = fid
    if user.role != "admin":
        data["ownerId"] = user.uid
        data["farmerName"] = user.name
    return FirestoreService.create("farms", fid, data)

@router.put("/{farm_id}")
def update_farm(
    farm_id: str,
    farm: FarmCreate,
    user: AuthenticatedUser = Depends(get_current_user),
):
    existing = FirestoreService.get_by_id("farms", farm_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Farm not found")
    require_farm_access(user, farm_id)
    data = farm.dict()
    data["farmId"] = farm_id
    if user.role != "admin":
        data["ownerId"] = user.uid
        data["farmerName"] = user.name
    return FirestoreService.update("farms", farm_id, data)

@router.delete("/{farm_id}")
def delete_farm(
    farm_id: str,
    user: AuthenticatedUser = Depends(get_current_user),
):
    require_farm_access(user, farm_id)
    success = FirestoreService.delete("farms", farm_id)
    if not success:
        raise HTTPException(status_code=404, detail="Farm not found")
    return {"message": f"Farm {farm_id} deleted successfully"}
