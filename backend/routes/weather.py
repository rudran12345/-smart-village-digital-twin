from fastapi import APIRouter
from typing import List, Dict, Any
import uuid
from models.schemas import WeatherRecordCreate, WeatherRecordResponse
from services.firestore_service import FirestoreService

router = APIRouter(prefix="/api/weather", tags=["Weather"])

@router.get("", response_model=List[Dict[str, Any]])
def get_weather_records():
    records = FirestoreService.get_all("weather")
    # sort descending by date
    return sorted(records, key=lambda x: x.get("date", ""), reverse=True)

@router.get("/current")
def get_current_weather():
    records = FirestoreService.get_all("weather")
    if records:
        sorted_records = sorted(records, key=lambda x: x.get("date", ""), reverse=True)
        return sorted_records[0]
    return {
        "recordId": "WEATH_DEF",
        "date": "2026-10-12",
        "temperature": 29.5,
        "humidity": 72.0,
        "rainfall": 8.0,
        "condition": "Cloudy",
        "windSpeed": 12.0
    }

@router.post("", response_model=Dict[str, Any])
def create_weather_record(record: WeatherRecordCreate):
    wid = f"WEATH_{uuid.uuid4().hex[:4].upper()}"
    data = record.dict()
    data["recordId"] = wid
    return FirestoreService.create("weather", wid, data)
