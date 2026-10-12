from typing import Dict, Any, List

CROP_PROFILES = {
    "Rice": {
        "opt_moisture": (60.0, 85.0),
        "opt_temp": (24.0, 33.0),
        "ideal_soil": ["Clay", "Alluvial", "Clay Loam"],
        "water_sensitivity": 0.85
    },
    "Wheat": {
        "opt_moisture": (38.0, 58.0),
        "opt_temp": (16.0, 26.0),
        "ideal_soil": ["Loam", "Clay Loam", "Alluvial"],
        "water_sensitivity": 0.65
    },
    "Maize": {
        "opt_moisture": (48.0, 68.0),
        "opt_temp": (20.0, 30.0),
        "ideal_soil": ["Loam", "Sandy Loam", "Alluvial"],
        "water_sensitivity": 0.70
    },
    "Tomato": {
        "opt_moisture": (50.0, 72.0),
        "opt_temp": (19.0, 29.0),
        "ideal_soil": ["Loam", "Sandy Loam"],
        "water_sensitivity": 0.75
    },
    "Sugarcane": {
        "opt_moisture": (55.0, 80.0),
        "opt_temp": (24.0, 35.0),
        "ideal_soil": ["Clay Loam", "Alluvial", "Clay"],
        "water_sensitivity": 0.80
    }
}

GROWTH_STAGE_SENSITIVITY = {
    "Germination": 0.9,
    "Vegetative": 0.7,
    "Flowering": 1.2,        # Most critical stage for water/temp stress
    "Grain Formation": 1.1,
    "Maturity": 0.5,
    "Harvesting": 0.3
}

def predict_crop_health(
    crop: str = "Rice",
    soil_type: str = "Clay",
    moisture: float = 65.0,
    temperature: float = 29.0,
    rainfall: float = 120.0,
    growth_stage: str = "Flowering",
    historical_crop_health: float = 84.0
) -> Dict[str, Any]:
    """
    ML Crop Health assessment engine.
    Calculates physiological stress penalty scores against crop agronomic bounds.
    """
    profile = CROP_PROFILES.get(crop, CROP_PROFILES["Rice"])
    stage_multiplier = GROWTH_STAGE_SENSITIVITY.get(growth_stage, 1.0)
    
    stress_factors: List[str] = []
    penalty = 0.0
    
    # 1. Soil moisture stress
    min_m, max_m = profile["opt_moisture"]
    if moisture < min_m:
        deficit = min_m - moisture
        p = (deficit / min_m) * 35.0 * stage_multiplier * profile["water_sensitivity"]
        penalty += p
        stress_factors.append(f"Soil moisture deficit ({moisture}% vs optimal {min_m}-{max_m}%)")
    elif moisture > max_m:
        excess = moisture - max_m
        p = (excess / (100.0 - max_m + 1e-5)) * 25.0 * stage_multiplier
        penalty += p
        stress_factors.append(f"Waterlogging risk: excessive moisture ({moisture}%)")
        
    # 2. Temperature stress
    min_t, max_t = profile["opt_temp"]
    if temperature < min_t:
        t_deficit = min_t - temperature
        p = (t_deficit / 10.0) * 20.0 * stage_multiplier
        penalty += p
        stress_factors.append(f"Low temperature chill stress ({temperature}°C vs ideal {min_t}-{max_t}°C)")
    elif temperature > max_t:
        t_excess = temperature - max_t
        p = (t_excess / 10.0) * 30.0 * stage_multiplier
        penalty += p
        stress_factors.append(f"Heat stress detected ({temperature}°C vs ideal max {max_t}°C)")
        
    # 3. Soil suitability check
    if soil_type not in profile["ideal_soil"]:
        penalty += 6.0
        stress_factors.append(f"{soil_type} soil is sub-optimal for {crop} (prefers {', '.join(profile['ideal_soil'])})")
        
    # 4. Synthesize health score (0 - 100)
    baseline_score = 96.0
    raw_health = max(10.0, baseline_score - penalty)
    
    # Weighted ensemble with historical crop condition (80% model + 20% prior state)
    if historical_crop_health:
        final_health = round(0.80 * raw_health + 0.20 * historical_crop_health, 1)
    else:
        final_health = round(raw_health, 1)
        
    if final_health >= 80.0:
        status = "Healthy"
        risk_level = "Low"
    elif final_health >= 60.0:
        status = "Moderate Stress"
        risk_level = "Medium"
    else:
        status = "Severe Stress"
        risk_level = "High"
        
    if not stress_factors:
        stress_factors.append("Agronomic conditions within optimal thresholds.")
        
    return {
        "cropHealth": final_health,
        "status": status,
        "riskLevel": risk_level,
        "stressFactors": stress_factors
    }
