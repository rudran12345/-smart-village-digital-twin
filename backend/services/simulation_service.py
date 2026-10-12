from typing import Dict, Any, List
from datetime import datetime
import uuid
from ml.water_prediction import predict_water_demand
from ml.crop_health import predict_crop_health
from ml.yield_prediction import predict_crop_yield
from ml.electricity_prediction import predict_electricity_demand
from ml.risk_model import calculate_composite_risk
from services.firestore_service import FirestoreService

class SimulationService:
    @staticmethod
    def run_simulation(params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes a Digital Twin What-If scenario against current baseline data.
        Calculates projected delta across water, agriculture, electricity, and composite risk.
        """
        water_reduction_pct = float(params.get("waterReductionPct", 20.0))
        temp_delta_c = float(params.get("temperatureDeltaC", 2.0))
        rainfall_delta_pct = float(params.get("rainfallDeltaPct", -25.0))
        irrigation_change_pct = float(params.get("irrigationChangePct", -15.0))
        elec_change_pct = float(params.get("electricityDemandChangePct", 15.0))
        
        # --- Current State Baselines ---
        curr_water_avail = 72000.0   # litres
        curr_water_demand = 8500.0   # litres/day
        curr_crop_health = 84.0      # %
        curr_crop_yield = 4.8        # tons
        curr_elec_demand = 4200.0    # kWh
        curr_elec_peak = 580.0       # kW
        
        # Current baseline composite risk
        curr_risk = calculate_composite_risk(
            water_availability_ratio=0.72,
            water_demand_ratio=0.85,
            average_crop_health=84.0,
            temperature=29.0,
            rainfall_deficit=0.0,
            electricity_demand_ratio=0.85
        )
        
        current_state = {
            "waterAvailability": curr_water_avail,
            "waterDemand": curr_water_demand,
            "waterShortageRisk": "Low",
            "cropHealth": curr_crop_health,
            "cropYieldTons": curr_crop_yield,
            "cropRisk": "Low",
            "electricityDemand": curr_elec_demand,
            "electricityPeak": curr_elec_peak,
            "electricityRisk": "Low",
            "overallRiskScore": curr_risk["riskScore"],
            "overallRiskLevel": curr_risk["riskLevel"]
        }
        
        # --- Simulated State Computation ---
        # 1. Simulated Water
        sim_water_avail = max(5000.0, round(curr_water_avail * (1.0 - (water_reduction_pct / 100.0)), 1))
        sim_temp = 29.0 + temp_delta_c
        sim_rain = max(0.0, 120.0 * (1.0 + (rainfall_delta_pct / 100.0)))
        
        # Water demand ML
        water_sim_res = predict_water_demand(
            historical_usage=curr_water_demand,
            population=5200,
            temperature=sim_temp,
            rainfall=sim_rain / 10.0,
            agricultural_demand=5800.0 * (1.0 + (irrigation_change_pct / 100.0)),
            previous_consumption=curr_water_demand
        )
        sim_water_demand = water_sim_res["predictedDemand"]
        
        # Shortage check: days of water remaining
        days_remaining = sim_water_avail / max(1.0, sim_water_demand)
        if days_remaining < 5.0 or sim_water_demand > sim_water_avail * 0.18:
            sim_water_risk = "High"
        elif days_remaining < 8.0:
            sim_water_risk = "Medium"
        else:
            sim_water_risk = "Low"
            
        # 2. Simulated Crops
        sim_moisture = max(20.0, min(95.0, 65.0 + (irrigation_change_pct * 0.4) + (rainfall_delta_pct * 0.2)))
        crop_health_res = predict_crop_health(
            crop="Rice",
            soil_type="Clay",
            moisture=sim_moisture,
            temperature=sim_temp,
            rainfall=sim_rain,
            growth_stage="Flowering",
            historical_crop_health=curr_crop_health
        )
        sim_crop_health = crop_health_res["cropHealth"]
        sim_crop_risk = crop_health_res["riskLevel"]
        
        # Yield ML
        yield_res = predict_crop_yield(
            crop="Rice",
            area=2.5,
            soil_type="Clay",
            rainfall=sim_rain,
            temperature=sim_temp,
            crop_health=sim_crop_health,
            historical_yield=curr_crop_yield
        )
        sim_crop_yield = yield_res["predictedYield"]
        
        # 3. Simulated Electricity
        elec_res = predict_electricity_demand(
            previous_consumption=curr_elec_demand * (1.0 + (elec_change_pct / 100.0)),
            population=5200,
            temperature=sim_temp,
            season="Summer" if temp_delta_c > 1.0 else "Monsoon",
            historical_peak_demand=curr_elec_peak * (1.0 + (elec_change_pct / 100.0))
        )
        sim_elec_demand = elec_res["predictedDemand"]
        sim_elec_peak = elec_res["peakDemand"]
        sim_elec_risk = elec_res["riskLevel"]
        
        # 4. Simulated Composite Risk
        sim_avail_ratio = sim_water_avail / 100000.0
        sim_demand_ratio = sim_water_demand / 8500.0
        sim_elec_ratio = sim_elec_demand / 4000.0
        rain_deficit = max(0.0, -rainfall_delta_pct)
        
        sim_risk_res = calculate_composite_risk(
            water_availability_ratio=sim_avail_ratio,
            water_demand_ratio=sim_demand_ratio,
            average_crop_health=sim_crop_health,
            temperature=sim_temp,
            rainfall_deficit=rain_deficit,
            electricity_demand_ratio=sim_elec_ratio
        )
        
        simulated_state = {
            "waterAvailability": sim_water_avail,
            "waterDemand": sim_water_demand,
            "waterShortageRisk": sim_water_risk,
            "cropHealth": sim_crop_health,
            "cropYieldTons": sim_crop_yield,
            "cropRisk": sim_crop_risk,
            "electricityDemand": sim_elec_demand,
            "electricityPeak": sim_elec_peak,
            "electricityRisk": sim_elec_risk,
            "overallRiskScore": sim_risk_res["riskScore"],
            "overallRiskLevel": sim_risk_res["riskLevel"]
        }
        
        # 5. Dynamic Recommendations & Alerts
        recommendations = []
        alerts = []
        
        if water_reduction_pct >= 20.0 or sim_water_risk in ["Medium", "High"]:
            recommendations.append("Implement rotational irrigation schedules across northern canals to conserve reservoir depth.")
            recommendations.append("Enforce non-essential municipal water restrictions until replenishment rainfall occurs.")
            alerts.append(f"Water storage projected to drop to {sim_water_avail:,.0f} L ({water_reduction_pct:.0f}% reduction).")
            
        if sim_crop_health < 75.0 or temp_delta_c >= 2.0:
            recommendations.append(f"Crop health predicted to decline to {sim_crop_health}%. Apply foliar mulching and nocturnal micro-irrigation to mitigate heat stress.")
            alerts.append(f"Crop health stress warning: projected yield dropping from {curr_crop_yield}t to {sim_crop_yield}t.")
            
        if elec_change_pct >= 15.0 or sim_elec_risk == "High":
            recommendations.append("Stagger high-power agricultural tube wells into off-peak night hours (11:00 PM - 05:00 AM) to protect the central transformer.")
            alerts.append(f"Transformer peak surge projected at {sim_elec_peak:.0f} kW (capacity rating 600 kW).")
            
        if not recommendations:
            recommendations.append("All village resources maintain resilient buffer margins under this simulation scenario.")
            
        # Store scenario in history
        scenario_id = f"SIM_{uuid.uuid4().hex[:8]}"
        scenario_record = {
            "scenarioId": scenario_id,
            "scenarioName": f"What-If: Water {water_reduction_pct:+.0f}%, Temp {temp_delta_c:+.1f}°C, Rain {rainfall_delta_pct:+.0f}%",
            "parameters": params,
            "currentState": current_state,
            "simulatedState": simulated_state,
            "recommendations": recommendations,
            "alerts": alerts,
            "timestamp": datetime.utcnow().isoformat()
        }
        FirestoreService.create("simulations", scenario_id, scenario_record)
        
        return {
            "scenarioId": scenario_id,
            "scenarioName": scenario_record["scenarioName"],
            "currentState": current_state,
            "simulatedState": simulated_state,
            "changes": {
                "waterAvailabilityDeltaPct": -water_reduction_pct,
                "cropHealthDelta": round(sim_crop_health - curr_crop_health, 1),
                "cropYieldDeltaTons": round(sim_crop_yield - curr_crop_yield, 2),
                "riskScoreDelta": round(sim_risk_res["riskScore"] - curr_risk["riskScore"], 1),
                "electricityDemandDeltaPct": elec_change_pct
            },
            "recommendations": recommendations,
            "alerts": alerts
        }
