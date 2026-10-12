from datetime import datetime, timezone
from typing import Dict, Any, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from services.auth_service import (
    AuthenticatedUser,
    get_current_user,
    get_firebase_identity,
    require_admin,
)
from services.firestore_service import FirestoreService

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


class ProfileCreate(BaseModel):
    name: str
    villageName: Optional[str] = "Green Valley Village"
    villageId: Optional[str] = "V001"
    phone: Optional[str] = None
    farmName: Optional[str] = None


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    villageName: Optional[str] = None
    phone: Optional[str] = None
    farmName: Optional[str] = None


def _safe_profile(profile: Dict[str, Any]) -> Dict[str, Any]:
    return {key: value for key, value in profile.items() if key not in {"password", "passwordHash"}}


@router.post("/profile")
def create_profile(
    request: ProfileCreate,
    identity: dict = Depends(get_firebase_identity),
):
    uid = identity["uid"]
    name = request.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="A non-empty name is required.")
    existing = FirestoreService.get_by_id("users", uid)
    if existing:
        updates = {
            "name": name,
            "villageId": request.villageId or existing.get("villageId", "V001"),
            "villageName": request.villageName or existing.get("villageName", "Green Valley Village"),
        }
        return _safe_profile(FirestoreService.update("users", uid, updates))

    profile = {
        "userId": uid,
        "name": name,
        "email": identity.get("email", ""),
        "role": "farmer",
        "villageId": request.villageId or "V001",
        "villageName": request.villageName or "Green Valley Village",
        "farmName": request.farmName or "",
        "phone": request.phone or "",
        "isActive": True,
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }
    return _safe_profile(FirestoreService.create("users", uid, profile))


@router.get("/profile")
def get_profile(identity: dict = Depends(get_firebase_identity)):
    uid = identity["uid"]
    profile = FirestoreService.get_by_id("users", uid)
    if not profile:
        profile = FirestoreService.create(
            "users",
            uid,
            {
                "userId": uid,
                "name": identity.get("name") or identity.get("email", "").split("@")[0],
                "email": identity.get("email", ""),
                "role": "farmer",
                "villageId": "V001",
                "villageName": "Green Valley Village",
                "farmName": "",
                "phone": "",
                "isActive": True,
                "createdAt": datetime.now(timezone.utc).isoformat(),
            },
        )
    if not profile.get("isActive", True):
        raise HTTPException(status_code=403, detail="Account is disabled.")
    return _safe_profile(profile)


@router.patch("/profile")
def update_profile(
    request: ProfileUpdate,
    user: AuthenticatedUser = Depends(get_current_user),
):
    updates = request.model_dump(exclude_unset=True, exclude_none=True)
    if "name" in updates:
        updates["name"] = updates["name"].strip()
        if not updates["name"]:
            raise HTTPException(status_code=400, detail="Name cannot be empty.")
    if not updates:
        raise HTTPException(status_code=400, detail="At least one profile field is required.")
    profile = FirestoreService.update("users", user.uid, updates)
    if not profile:
        raise HTTPException(status_code=404, detail="User profile not found.")
    return _safe_profile(profile)


@router.get("/users")
def list_users(user: AuthenticatedUser = Depends(require_admin)):
    return [_safe_profile(profile) for profile in FirestoreService.get_all("users")]


@router.get("/users/{user_id}")
def get_user(
    user_id: str,
    user: AuthenticatedUser = Depends(get_current_user),
):
    if user.role != "admin" and user.uid != user_id:
        raise HTTPException(status_code=403, detail="You cannot access this user profile.")
    profile = FirestoreService.get_by_id("users", user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="User not found.")
    return _safe_profile(profile)
