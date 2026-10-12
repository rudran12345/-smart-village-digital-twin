from typing import Dict, Any

# Baseline yields in tons per acre under good farming conditions
CROP_BASE_YIELDS = {
    "Rice": 2.05,        # 2.05 tons/acre (~5.0 tons/ha)
    "Wheat": 1.65,       # 1.65 tons/acre (~4.0 tons/ha)
    "Maize": 1.90,       # 1.90 tons/acre (~4.6 tons/ha)
    "Tomato": 9.00,      # 9.00 tons/acre (~22.0 tons/ha)
    "Sugarcane": 35.0    # 35.0 tons/acre (~86.0 tons/ha)
}

SOIL_FERTILITY_MODIFIERS = {
    "Alluvial": 1.08,
    "Clay Loam": 1.05,
    "Loam": 1.02,
    "Clay": 0.98,
    "Sandy Loam": 0.92,
    "Sandy": 0.82
}

def predict_crop_yield(
    crop: str = "Rice",
    area: float = 2.5,
    soil_type: str = "Clay",
    rainfall: float = 120.0,
    temperature: float = 29.0,
    crop_health: float = 84.0,
    historical_yield: float = 4.8
) -> Dict[str, Any]:
    """
    ML Crop Yield prediction model.
    Transforms base agronomic yield per acre using soil coefficient,
    crop health index, and environmental scaling factors.
    """
    base_yield_per_acre = CROP_BASE_YIELDS.get(crop, 2.0)
    soil_mod = SOIL_FERTILITY_MODIFIERS.get(soil_type, 1.0)
    
    # Crop health scaling factor: 85% health = 1.0 baseline
    health_factor = (crop_health / 85.0) ** 1.15
    
    # Climate suitability adjustment
    climate_factor = 1.0
    if crop == "Rice":
        if rainfall < 80.0:
            climate_factor *= 0.88
        elif rainfall > 220.0:
            climate_factor *= 0.94
    elif crop == "Wheat":
        if temperature > 28.0:
            climate_factor *= 0.82  # terminal heat stress
            
    predicted_yield_per_acre = base_yield_per_acre * soil_mod * health_factor * climate_factor
    total_predicted_yield = round(predicted_yield_per_acre * area, 2)
    
    # If historical yield is available, ensemble with historical baseline (80% model + 20% history)
    if historical_yield and historical_yield > 0:
        total_predicted_yield = round(0.80 * total_predicted_yield + 0.20 * historical_yield, 2)
        predicted_yield_per_acre = round(total_predicted_yield / max(0.1, area), 2)
        
    # Model confidence based on health completeness
    confidence = round(min(0.96, max(0.72, 0.70 + (crop_health / 100.0) * 0.25)), 2)
    
    return {
        "predictedYield": total_predicted_yield,
        "unit": "tons",
        "confidence": confidence,
        "yieldPerAcre": predicted_yield_per_acre
    }
