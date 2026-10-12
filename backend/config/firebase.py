import os
import json
import logging
from typing import Optional, Dict, Any
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("smart_village.firebase")

# Cloud Firestore & Firebase Admin SDK initialization with graceful demo/fallback
_db = None
_is_firebase_live = False

def init_firebase():
    global _db, _is_firebase_live
    project_id = os.getenv("FIREBASE_PROJECT_ID")
    client_email = os.getenv("FIREBASE_CLIENT_EMAIL")
    private_key = os.getenv("FIREBASE_PRIVATE_KEY")
    service_account_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH")

    # If explicit service account JSON path exists
    if service_account_path and os.path.exists(service_account_path):
        try:
            import firebase_admin
            from firebase_admin import credentials, firestore
            cred = credentials.Certificate(service_account_path)
            if not firebase_admin._apps:
                firebase_admin.initialize_app(cred)
            _db = firestore.client()
            _is_firebase_live = True
            logger.info("Firebase Admin initialized via service account file.")
            return _db
        except Exception as e:
            logger.warning(f"Failed to initialize Firebase from file: {e}. Falling back to cloud store emulation.")

    # If env variables are provided
    if project_id and client_email and private_key and "example" not in client_email:
        try:
            import firebase_admin
            from firebase_admin import credentials, firestore
            cred_dict = {
                "project_id": project_id,
                "client_email": client_email,
                "private_key": private_key.replace("\\n", "\n")
            }
            cred = credentials.Certificate(cred_dict)
            if not firebase_admin._apps:
                firebase_admin.initialize_app(cred)
            _db = firestore.client()
            _is_firebase_live = True
            logger.info("Firebase Admin initialized via environment variables.")
            return _db
        except Exception as e:
            logger.warning(f"Failed to initialize Firebase from env: {e}. Falling back to cloud store emulation.")

    if os.getenv("APP_ENV", "development").lower() == "production":
        raise RuntimeError("Firebase Admin credentials are required in production.")

    logger.info("Running in Smart Village Local/Demo Store mode (Cloud Firestore compatible schema).")
    return None

def is_firebase_live() -> bool:
    return _is_firebase_live

def get_firestore_client():
    global _db
    if _db is None and not _is_firebase_live:
        init_firebase()
    return _db
