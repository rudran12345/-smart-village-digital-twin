from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
import uuid
from models.schemas import VillageBase, VillageCreate, VillageResponse
from services.firestore_service import FirestoreService
from services.risk_service import RiskService
from services.auth_service import AuthenticatedUser, require_admin

router = APIRouter(prefix="/api/villages", tags=["Villages"])

@router.get("", response_model=List[Dict[str, Any]])
def get_villages():
    villages = FirestoreService.get_all("villages")
    # Enhance with live calculated digital twin risk & farm counts
    for v in villages:
        vid = v.get("villageId", "V001")
        farms = [f for f in FirestoreService.get_all("farms") if f.get("villageId") == vid]
        v["totalFarms"] = len(farms)
        risk_info = RiskService.evaluate_village_risk(vid)
        v["overallRiskScore"] = risk_info["overallRiskScore"]
        v["overallRiskLevel"] = risk_info["overallRiskLevel"]
    return villages

@router.get("/{village_id}")
def get_village(village_id: str):
    village = FirestoreService.get_by_id("villages", village_id)
    if not village:
        raise HTTPException(status_code=404, detail="Village not found")
    farms = [f for f in FirestoreService.get_all("farms") if f.get("villageId") == village_id]
    village["totalFarms"] = len(farms)
    risk_info = RiskService.evaluate_village_risk(village_id)
    village["overallRiskScore"] = risk_info["overallRiskScore"]
    village["overallRiskLevel"] = risk_info["overallRiskLevel"]
    return village

@router.post("", response_model=Dict[str, Any])
def create_village(village: VillageCreate, user: AuthenticatedUser = Depends(require_admin)):
    vid = f"V{uuid.uuid4().hex[:4].upper()}"
    data = village.dict()
    data["villageId"] = vid
    return FirestoreService.create("villages", vid, data)
