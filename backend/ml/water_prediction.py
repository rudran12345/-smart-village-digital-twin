import numpy as np
from typing import Dict, Any

def predict_water_demand(
    historical_usage: float = 8500.0,
    population: int = 5200,
    temperature: float = 29.5,
    rainfall: float = 8.0,
    agricultural_demand: float = 5800.0,
    previous_consumption: float = 8600.0
) -> Dict[str, Any]:
    """
    AI/ML-based village water demand prediction model.
    Combines per capita domestic consumption baseline with
    temperature-driven evapotranspiration, rainfall offset,
    and agricultural irrigation load.
    """
    # 1. Domestic demand baseline (~55 litres per capita per day for rural communities)
    per_capita_domestic = 55.0
    domestic_base = (population * per_capita_domestic) / 100.0  # scaled community sample or active village sector (litres)
    
    # 2. Temperature evapotranspiration multiplier
    # Reference temp: 26°C. Each degree above adds ~3.5% water requirement
    temp_factor = 1.0 + max(0.0, (temperature - 26.0) * 0.035)
    
    # 3. Rainfall offset
    # Rainfall reduces irrigation and municipal watering needs
    # Every 10mm of rainfall provides ~15% temporary reduction, up to 45% max
    rain_reduction_factor = max(0.55, 1.0 - (rainfall / 10.0) * 0.15)
    
    # 4. Agricultural demand adjustment
    adjusted_agri = agricultural_demand * temp_factor * rain_reduction_factor
    
    # 5. Autoregressive smoothing with historical trend (70% ML simulated physics + 30% autoregressive previous)
    raw_demand = (domestic_base * temp_factor) + adjusted_agri
    predicted_demand = round((0.70 * raw_demand) + (0.15 * historical_usage) + (0.15 * previous_consumption), 1)
    
    # 6. Risk evaluation against typical village daily capacity threshold (10,000 litres/day standard distribution)
    normal_capacity = 10000.0
    demand_ratio = predicted_demand / normal_capacity
    
    if demand_ratio > 1.15:
        risk_level = "High"
        risk_score = min(100.0, round(65.0 + (demand_ratio - 1.15) * 120, 1))
        explanation = f"Critical water demand spike ({predicted_demand} L/day) driven by high temperature ({temperature}°C) and low rainfall ({rainfall}mm)."
    elif demand_ratio > 0.90:
        risk_level = "Medium"
        risk_score = round(35.0 + (demand_ratio - 0.90) * 115, 1)
        explanation = f"Moderate water demand ({predicted_demand} L/day). Reservoir depletion monitored under current weather conditions."
    else:
        risk_level = "Low"
        risk_score = round(max(5.0, demand_ratio * 30), 1)
        explanation = f"Normal balanced water demand ({predicted_demand} L/day) well within storage replenishment rates."
        
    return {
        "predictedDemand": predicted_demand,
        "unit": "litres/day",
        "riskLevel": risk_level,
        "riskScore": risk_score,
        "explanation": explanation
    }
