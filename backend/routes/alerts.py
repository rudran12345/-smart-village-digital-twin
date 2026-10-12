from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
import uuid
from services.firestore_service import FirestoreService

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])

@router.get("", response_model=List[Dict[str, Any]])
def get_alerts(severity: Optional[str] = Query(None), category: Optional[str] = Query(None)):
    alerts = FirestoreService.get_all("alerts")
    if severity:
        alerts = [a for a in alerts if a.get("severity", "").upper() == severity.upper()]
    if category:
        alerts = [a for a in alerts if a.get("category", "").lower() == category.lower()]
    return sorted(alerts, key=lambda x: x.get("timestamp", ""), reverse=True)

@router.post("/{alert_id}/acknowledge")
def acknowledge_alert(alert_id: str):
    existing = FirestoreService.get_by_id("alerts", alert_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Alert not found")
    updated = FirestoreService.update("alerts", alert_id, {"status": "ACKNOWLEDGED"})
    return updated
