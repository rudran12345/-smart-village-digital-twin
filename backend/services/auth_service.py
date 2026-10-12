import logging
import os
from dataclasses import dataclass
from typing import Optional

from fastapi import Depends, Header, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from config.firebase import is_firebase_live
from services.firestore_service import FirestoreService

logger = logging.getLogger("smart_village.auth_service")
_bearer_scheme = HTTPBearer(auto_error=False)


@dataclass(frozen=True)
class AuthenticatedUser:
    uid: str
    email: str
    role: str
    name: str = ""


def _decode_firebase_token(
    credentials: Optional[HTTPAuthorizationCredentials],
) -> dict:
    if not is_firebase_live():
        raise HTTPException(status_code=503, detail="Firebase Authentication is not configured.")
    if credentials is None:
        raise HTTPException(status_code=401, detail="A Firebase ID token is required.")

    try:
        from firebase_admin import auth, exceptions

        return auth.verify_id_token(credentials.credentials, check_revoked=True)
    except (ValueError, exceptions.FirebaseError) as exc:
        logger.info("Rejected invalid Firebase ID token: %s", exc)
        raise HTTPException(status_code=401, detail="Invalid or expired authentication token.") from exc


def get_firebase_identity(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer_scheme),
) -> dict:
    return _decode_firebase_token(credentials)


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer_scheme),
    x_demo_role: Optional[str] = Header(default=None),
) -> AuthenticatedUser:
    if os.getenv("APP_ENV", "development").lower() != "production" and not is_firebase_live():
        role = (x_demo_role or "farmer").lower()
        if role not in {"admin", "farmer"}:
            raise HTTPException(status_code=401, detail="Invalid demo role.")
        return AuthenticatedUser(
            uid="ADMIN001" if role == "admin" else "USER001",
            email="demo@example.com",
            role=role,
            name="Local Demo User",
        )

    identity = _decode_firebase_token(credentials)
    user_id = identity.get("uid")
    profile = FirestoreService.get_by_id("users", user_id)
    if not profile or not profile.get("isActive", True):
        raise HTTPException(status_code=403, detail="User profile is not registered or is disabled.")

    role = str(profile.get("role", "farmer")).lower()
    if role not in {"admin", "farmer"}:
        raise HTTPException(status_code=403, detail="User role is not authorized.")

    return AuthenticatedUser(
        uid=user_id,
        email=identity.get("email", ""),
        role=role,
        name=profile.get("name", ""),
    )


def require_admin(user: AuthenticatedUser = Depends(get_current_user)) -> AuthenticatedUser:
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Administrator access is required.")
    return user


def require_farm_access(user: AuthenticatedUser, farm_id: str) -> None:
    farm = FirestoreService.get_by_id("farms", farm_id)
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    if user.role == "admin":
        return
    if farm.get("ownerId") != user.uid:
        raise HTTPException(status_code=403, detail="You do not have access to this farm.")


def require_field_access(user: AuthenticatedUser, field_id: str) -> dict:
    field = FirestoreService.get_by_id("fields", field_id)
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
    require_farm_access(user, field.get("farmId", ""))
    return field


def require_crop_access(user: AuthenticatedUser, crop_id: str) -> dict:
    crop = FirestoreService.get_by_id("crops", crop_id)
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
    require_farm_access(user, crop.get("farmId", ""))
    return crop
