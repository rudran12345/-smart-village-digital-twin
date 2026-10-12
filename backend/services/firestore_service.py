import os
import json
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from config.firebase import get_firestore_client, is_firebase_live

logger = logging.getLogger("smart_village.firestore_service")

STORE_FILE_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "local_store.json")

# In-memory storage cache
_local_store: Dict[str, Dict[str, Dict[str, Any]]] = {
    "users": {},
    "villages": {},
    "farms": {},
    "fields": {},
    "crops": {},
    "water_resources": {},
    "electricity": {},
    "weather": {},
    "simulations": {},
    "predictions": {},
    "alerts": {},
    "recommendations": {}
}

def load_local_store():
    global _local_store
    if os.path.exists(STORE_FILE_PATH):
        try:
            with open(STORE_FILE_PATH, "r", encoding="utf-8") as f:
                loaded = json.load(f)
                for coll, docs in loaded.items():
                    if coll in _local_store:
                        _local_store[coll].update(docs)
            logger.info("Local storage cache loaded from file.")
        except Exception as e:
            logger.error(f"Error loading local store: {e}")

def save_local_store():
    try:
        os.makedirs(os.path.dirname(STORE_FILE_PATH), exist_ok=True)
        with open(STORE_FILE_PATH, "w", encoding="utf-8") as f:
            json.dump(_local_store, f, indent=2)
    except Exception as e:
        logger.error(f"Error saving local store: {e}")

# Load store initially
load_local_store()

class FirestoreService:
    @staticmethod
    def get_all(collection_name: str) -> List[Dict[str, Any]]:
        db = get_firestore_client()
        if is_firebase_live() and db:
            try:
                docs = db.collection(collection_name).stream()
                results = []
                for doc in docs:
                    d = doc.to_dict()
                    d["_id"] = doc.id
                    results.append(d)
                return results
            except Exception as e:
                logger.error(f"Firestore get_all error on {collection_name}: {e}")
                if is_firebase_live():
                    raise
                
        # Fallback to local store
        coll = _local_store.get(collection_name, {})
        return list(coll.values())

    @staticmethod
    def get_by_id(collection_name: str, doc_id: str) -> Optional[Dict[str, Any]]:
        db = get_firestore_client()
        if is_firebase_live() and db:
            try:
                doc = db.collection(collection_name).document(doc_id).get()
                if doc.exists:
                    d = doc.to_dict()
                    d["_id"] = doc.id
                    return d
                return None
            except Exception as e:
                logger.error(f"Firestore get_by_id error on {collection_name}/{doc_id}: {e}")
                if is_firebase_live():
                    raise

        # Local store
        coll = _local_store.get(collection_name, {})
        return coll.get(doc_id)

    @staticmethod
    def create(collection_name: str, doc_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        data_to_store = dict(data)
        if "createdAt" not in data_to_store:
            data_to_store["createdAt"] = datetime.utcnow().isoformat()
            
        db = get_firestore_client()
        if is_firebase_live() and db:
            try:
                db.collection(collection_name).document(doc_id).set(data_to_store)
            except Exception as e:
                logger.error(f"Firestore create error on {collection_name}/{doc_id}: {e}")
                if is_firebase_live():
                    raise

        # Always update local store
        if collection_name not in _local_store:
            _local_store[collection_name] = {}
        _local_store[collection_name][doc_id] = data_to_store
        save_local_store()
        return data_to_store

    @staticmethod
    def update(collection_name: str, doc_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        db = get_firestore_client()
        if is_firebase_live() and db:
            try:
                document = db.collection(collection_name).document(doc_id)
                snapshot = document.get()
                if not snapshot.exists:
                    return None
                document.update(data)
                updated = snapshot.to_dict()
                updated.update(data)
                updated["createdAt"] = updated.get("createdAt", datetime.now(timezone.utc).isoformat())
                local_collection = _local_store.get(collection_name, {})
                if doc_id in local_collection:
                    local_collection[doc_id].update(data)
                    save_local_store()
                return updated
            except Exception as e:
                logger.error(f"Firestore update error on {collection_name}/{doc_id}: {e}")
                if is_firebase_live():
                    raise

        coll = _local_store.get(collection_name, {})
        if doc_id in coll:
            coll[doc_id].update(data)
            save_local_store()
            return coll[doc_id]
        else:
            coll[doc_id] = data
            save_local_store()
            return coll[doc_id]

    @staticmethod
    def delete(collection_name: str, doc_id: str) -> bool:
        db = get_firestore_client()
        if is_firebase_live() and db:
            try:
                document = db.collection(collection_name).document(doc_id)
                existed = document.get().exists
                document.delete()
            except Exception as e:
                logger.error(f"Firestore delete error on {collection_name}/{doc_id}: {e}")
                if is_firebase_live():
                    raise

        coll = _local_store.get(collection_name, {})
        if doc_id in coll:
            del coll[doc_id]
            save_local_store()
            return existed if is_firebase_live() and db else True
        if is_firebase_live() and db:
            return existed
        return False
