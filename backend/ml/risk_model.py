from typing import Dict, Any

def calculate_composite_risk(
    water_availability_ratio: float = 0.72,   # current water / capacity
    water_demand_ratio: float = 1.15,         # predicted demand / daily normal
    average_crop_health: float = 84.0,        # 0-100
    temperature: float = 29.5,                # °C
    rainfall_deficit: float = 15.0,           # % deficit from seasonal norm
    electricity_demand_ratio: float = 1.08    # predicted kWh / rated baseline
) -> Dict[str, Any]:
    """
    Multi-factor risk model synthesizing environmental, agricultural,
    and municipal resource parameters into a unified 0-100 index.
    
    Risk Thresholds:
      0  - 30  : LOW
      31 - 60  : MEDIUM
      61 - 100 : HIGH
    """
    # 1. Water Resource Risk (0 - 100)
    # Strained when availability is low and demand is high
    water_stress = ((1.0 - min(1.0, max(0.0, water_availability_ratio))) * 55.0) + \
                   (max(0.0, (water_demand_ratio - 1.0)) * 70.0)
    water_risk = min(100.0, max(0.0, water_stress))
    
    # 2. Crop & Agriculture Risk (0 - 100)
    # Inverted crop health
    crop_risk = max(0.0, min(100.0, (100.0 - average_crop_health) * 1.35))
    
    # 3. Electricity Grid Stress (0 - 100)
    elec_stress = max(0.0, (electricity_demand_ratio - 0.85)) * 140.0
    electricity_risk = min(100.0, max(0.0, elec_stress))
    
    # 4. Weather / Environmental Stress (0 - 100)
    temp_stress = max(0.0, (temperature - 30.0) * 8.0)
    rain_stress = max(0.0, (rainfall_deficit / 100.0) * 50.0)
    weather_risk = min(100.0, temp_stress + rain_stress)
    
    # 5. Composite Weighted Score
    # Weights: Water 35%, Crops 30%, Electricity 20%, Weather 15%
    composite_score = round(
        (0.35 * water_risk) +
        (0.30 * crop_risk) +
        (0.20 * electricity_risk) +
        (0.15 * weather_risk),
        1
    )
    
    # Clamping 0-100
    composite_score = min(100.0, max(0.0, composite_score))
    
    if composite_score <= 30.0:
        risk_level = "LOW"
    elif composite_score <= 60.0:
        risk_level = "MEDIUM"
    else:
        risk_level = "HIGH"
        
    factors = {
        "water_risk": round(water_risk, 1),
        "crop_risk": round(crop_risk, 1),
        "electricity_risk": round(electricity_risk, 1),
        "weather_risk": round(weather_risk, 1)
    }
    
    summary = (
        f"Composite Risk Score: {composite_score}/100 ({risk_level}). "
        f"Primary risk drivers: "
        f"{'Water storage depletion, ' if water_risk > 50 else ''}"
        f"{'Agricultural crop stress, ' if crop_risk > 50 else ''}"
        f"{'Electrical grid load strain, ' if electricity_risk > 50 else ''}"
        f"{'High ambient temperature/drought, ' if weather_risk > 50 else ''}"
    ).rstrip(", ") + "."
    if "Primary risk drivers: ." in summary:
        summary = f"Composite Risk Score: {composite_score}/100 ({risk_level}). All primary village resource subsystems operating within stable parameters."
        
    return {
        "riskScore": composite_score,
        "riskLevel": risk_level,
        "factors": factors,
        "summary": summary
    }
