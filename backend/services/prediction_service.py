from typing import Dict, Any
from datetime import datetime
import uuid
from ml.water_prediction import predict_water_demand
from ml.crop_health import predict_crop_health
from ml.yield_prediction import predict_crop_yield
from ml.electricity_prediction import predict_electricity_demand
from ml.risk_model import calculate_composite_risk
from services.firestore_service import FirestoreService

class PredictionService:
    @staticmethod
    def run_water_prediction(params: Dict[str, Any]) -> Dict[str, Any]:
        result = predict_water_demand(
            historical_usage=params.get("historicalUsage", 8500.0),
            population=params.get("population", 5200),
            temperature=params.get("temperature", 29.5),
            rainfall=params.get("rainfall", 8.0),
            agricultural_demand=params.get("agriculturalDemand", 5800.0),
            previous_consumption=params.get("previousConsumption", 8600.0)
        )
        pred_id = f"PRED_W_{uuid.uuid4().hex[:8]}"
        FirestoreService.create("predictions", pred_id, {
            "predictionId": pred_id,
            "type": "water",
            "input": params,
            "output": result,
            "timestamp": datetime.utcnow().isoformat()
        })
        return result

    @staticmethod
    def run_crop_health_prediction(params: Dict[str, Any]) -> Dict[str, Any]:
        result = predict_crop_health(
            crop=params.get("crop", "Rice"),
            soil_type=params.get("soilType", "Clay"),
            moisture=params.get("moisture", 65.0),
            temperature=params.get("temperature", 29.0),
            rainfall=params.get("rainfall", 120.0),
            growth_stage=params.get("growthStage", "Flowering"),
            historical_crop_health=params.get("historicalCropHealth", 84.0)
        )
        pred_id = f"PRED_C_{uuid.uuid4().hex[:8]}"
        FirestoreService.create("predictions", pred_id, {
            "predictionId": pred_id,
            "type": "crop_health",
            "input": params,
            "output": result,
            "timestamp": datetime.utcnow().isoformat()
        })
        return result

    @staticmethod
    def run_yield_prediction(params: Dict[str, Any]) -> Dict[str, Any]:
        result = predict_crop_yield(
            crop=params.get("crop", "Rice"),
            area=params.get("area", 2.5),
            soil_type=params.get("soilType", "Clay"),
            rainfall=params.get("rainfall", 120.0),
            temperature=params.get("temperature", 29.0),
            crop_health=params.get("cropHealth", 84.0),
            historical_yield=params.get("historicalYield", 4.8)
        )
        pred_id = f"PRED_Y_{uuid.uuid4().hex[:8]}"
        FirestoreService.create("predictions", pred_id, {
            "predictionId": pred_id,
            "type": "yield",
            "input": params,
            "output": result,
            "timestamp": datetime.utcnow().isoformat()
        })
        return result

    @staticmethod
    def run_electricity_prediction(params: Dict[str, Any]) -> Dict[str, Any]:
        result = predict_electricity_demand(
            previous_consumption=params.get("previousConsumption", 4200.0),
            population=params.get("population", 5200),
            temperature=params.get("temperature", 29.5),
            season=params.get("season", "Summer"),
            historical_peak_demand=params.get("historicalPeakDemand", 580.0)
        )
        pred_id = f"PRED_E_{uuid.uuid4().hex[:8]}"
        FirestoreService.create("predictions", pred_id, {
            "predictionId": pred_id,
            "type": "electricity",
            "input": params,
            "output": result,
            "timestamp": datetime.utcnow().isoformat()
        })
        return result

    @staticmethod
    def run_risk_prediction(params: Dict[str, Any]) -> Dict[str, Any]:
        result = calculate_composite_risk(
            water_availability_ratio=params.get("waterAvailabilityRatio", 0.72),
            water_demand_ratio=params.get("waterDemandRatio", 1.15),
            average_crop_health=params.get("averageCropHealth", 84.0),
            temperature=params.get("temperature", 29.5),
            rainfall_deficit=params.get("rainfallDeficit", 15.0),
            electricity_demand_ratio=params.get("electricityDemandRatio", 1.08)
        )
        pred_id = f"PRED_R_{uuid.uuid4().hex[:8]}"
        FirestoreService.create("predictions", pred_id, {
            "predictionId": pred_id,
            "type": "risk",
            "input": params,
            "output": result,
            "timestamp": datetime.utcnow().isoformat()
        })
        return result
