from typing import Dict, Any, List
from ml.risk_model import calculate_composite_risk
from services.firestore_service import FirestoreService

class RiskService:
    @staticmethod
    def evaluate_village_risk(village_id: str = "V001") -> Dict[str, Any]:
        # 1. Fetch current water status
        waters = FirestoreService.get_all("water_resources")
        total_capacity = sum(float(w.get("capacity", 0.0)) for w in waters) or 100000.0
        current_water = sum(float(w.get("currentLevel", 0.0)) for w in waters) or 72000.0
        water_avail_ratio = current_water / total_capacity
        
        # 2. Fetch current fields crop health
        fields = FirestoreService.get_all("fields")
        if fields:
            avg_health = sum(float(f.get("cropHealth", 80.0)) for f in fields) / len(fields)
        else:
            avg_health = 84.0
            
        # 3. Fetch latest weather
        weather_list = FirestoreService.get_all("weather")
        if weather_list:
            latest_weather = sorted(weather_list, key=lambda x: x.get("date", ""), reverse=True)[0]
            temp = float(latest_weather.get("temperature", 29.5))
            rain = float(latest_weather.get("rainfall", 8.0))
        else:
            temp = 29.5
            rain = 8.0
            
        rain_deficit = max(0.0, (15.0 - rain) / 15.0 * 100.0)
        
        # 4. Fetch latest electricity
        elec_list = FirestoreService.get_all("electricity")
        if elec_list:
            latest_elec = sorted(elec_list, key=lambda x: x.get("date", ""), reverse=True)[0]
            elec_consumption = float(latest_elec.get("consumption", 4200.0))
        else:
            elec_consumption = 4200.0
        elec_ratio = elec_consumption / 4000.0
        
        # Calculate composite risk
        risk_res = calculate_composite_risk(
            water_availability_ratio=water_avail_ratio,
            water_demand_ratio=1.12,
            average_crop_health=avg_health,
            temperature=temp,
            rainfall_deficit=rain_deficit,
            electricity_demand_ratio=elec_ratio
        )
        
        return {
            "villageId": village_id,
            "overallRiskScore": risk_res["riskScore"],
            "overallRiskLevel": risk_res["riskLevel"],
            "factors": risk_res["factors"],
            "summary": risk_res["summary"],
            "waterAvailabilityRatio": round(water_avail_ratio * 100, 1),
            "averageCropHealth": round(avg_health, 1),
            "temperature": temp,
            "rainfall": rain
        }
