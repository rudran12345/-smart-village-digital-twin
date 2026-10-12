from fastapi import APIRouter, Query
from typing import List, Dict, Any, Optional
from services.recommendation_service import RecommendationService

router = APIRouter(prefix="/api/recommendations", tags=["Recommendations"])

@router.get("", response_model=List[Dict[str, Any]])
def get_recommendations(role: Optional[str] = Query("admin"), farm_id: Optional[str] = Query(None)):
    return RecommendationService.get_recommendations(role=role or "admin", farm_id=farm_id)
