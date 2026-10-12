from fastapi import APIRouter
from typing import Dict, Any, List
from models.schemas import SimulationRequest, SimulationResponse
from services.simulation_service import SimulationService
from services.firestore_service import FirestoreService

router = APIRouter(prefix="/api/simulation", tags=["Digital Twin Simulation"])

@router.post("", response_model=SimulationResponse)
def run_simulation(req: SimulationRequest):
    return SimulationService.run_simulation(req.dict())

@router.get("/history", response_model=List[Dict[str, Any]])
def get_simulation_history():
    sims = FirestoreService.get_all("simulations")
    return sorted(sims, key=lambda x: x.get("timestamp", ""), reverse=True)
