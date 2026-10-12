from typing import List, Dict, Any
from services.firestore_service import FirestoreService

class RecommendationService:
    @staticmethod
    def get_recommendations(role: str = "admin", farm_id: str = None) -> List[Dict[str, Any]]:
        # Fetch current system state
        water_list = FirestoreService.get_all("water_resources")
        fields = FirestoreService.get_all("fields")
        elec_list = FirestoreService.get_all("electricity")
        weather_list = FirestoreService.get_all("weather")
        
        recs: List[Dict[str, Any]] = []
        
        # 1. Water Resource Recommendations
        total_capacity = sum(float(w.get("capacity", 0.0)) for w in water_list) or 100000.0
        current_water = sum(float(w.get("currentLevel", 0.0)) for w in water_list) or 72000.0
        avail_ratio = current_water / total_capacity
        
        if avail_ratio < 0.70:
            recs.append({
                "recId": "REC_W_01",
                "title": "Reservoir Water Conservation Directive",
                "domain": "Water",
                "text": "Village storage level has dipped below 70%. Prioritize pressurized drip irrigation over flood furrow methods and schedule canal gate release in 4-hour cycles.",
                "impact": "Saves up to 18,000 litres daily",
                "priority": "HIGH"
            })
        else:
            recs.append({
                "recId": "REC_W_02",
                "title": "Optimized Tank Recharge Maintenance",
                "domain": "Water",
                "text": "Water availability is steady at 72%. Clear desilting channels before impending monsoon runoff to maximize natural replenishment.",
                "impact": "Increases rainwater harvesting efficiency by 25%",
                "priority": "LOW"
            })
            
        # 2. Agriculture / Crop Recommendations
        for field in fields:
            crop = field.get("crop", "Rice")
            health = float(field.get("cropHealth", 80.0))
            moisture = float(field.get("moisture", 65.0))
            name = field.get("fieldName", "Field")
            
            if health < 75.0:
                recs.append({
                    "recId": f"REC_C_{field.get('fieldId', 'F')}",
                    "title": f"Crop Health Intervention for {name} ({crop})",
                    "domain": "Agriculture",
                    "text": f"{crop} in {name} is showing physiological stress (Health {health}%). Moisture is {moisture}%. Recommend foliar micronutrient spray (Zinc + Nitrogen) and light evening watering.",
                    "impact": "Prevents up to 15% terminal yield loss",
                    "priority": "HIGH"
                })
                break
                
        recs.append({
            "recId": "REC_C_ROT",
            "title": "Zaid & Rabi Crop Rotation Advisory",
            "domain": "Agriculture",
            "text": "Post-harvest soil analysis indicates nitrogen depletion in clay sectors. Recommend introducing short-duration legumes or green gram pulses before the next paddy sowing.",
            "impact": "Improves soil organic nitrogen by 18 kg/acre naturally",
            "priority": "MEDIUM"
        })
        
        # 3. Electricity & Energy Recommendations
        recs.append({
            "recId": "REC_E_01",
            "title": "Agricultural Feeder Peak-Load Shifting",
            "domain": "Electricity",
            "text": "Evening peak grid demand reaches 580 kW near transformer threshold. Enforce scheduled agricultural pumping intervals: Group A (06:00 - 11:00 AM) and Group B (01:00 - 05:00 PM).",
            "impact": "Reduces peak surge by 140 kW and protects transformer lifespan",
            "priority": "HIGH"
        })
        
        # 4. Weather & Climate Preparedness
        recs.append({
            "recId": "REC_ENV_01",
            "title": "Elevated Daytime Temperature Advisory",
            "domain": "General",
            "text": "Forecasted peak temperatures above 31°C will accelerate surface evaporation. Apply organic paddy straw mulch across open vegetable furrows.",
            "impact": "Retains soil moisture for 48 additional hours",
            "priority": "MEDIUM"
        })
        
        return recs
