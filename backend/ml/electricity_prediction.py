from typing import Dict, Any

def predict_electricity_demand(
    previous_consumption: float = 4200.0,
    population: int = 5200,
    temperature: float = 29.5,
    season: str = "Summer",
    historical_peak_demand: float = 580.0
) -> Dict[str, Any]:
    """
    ML Village Electricity Demand & Peak Load Forecaster.
    Accounts for domestic baseload, temperature cooling loads,
    seasonal irrigation pumping schedules, and peak transformer capacity.
    """
    # 1. Domestic baseline (~0.35 kWh per capita daily rural average)
    domestic_kwh = (population * 0.35)  # ~1820 kWh for 5200 pop
    
    # 2. Temperature cooling & fan multiplier (base 25°C)
    cooling_factor = 1.0 + max(0.0, (temperature - 25.0) * 0.045)
    domestic_adjusted = domestic_kwh * cooling_factor
    
    # 3. Agricultural irrigation pump load
    # Higher in summer / hot dry days when pumps run extra hours
    season_pump_multipliers = {
        "Summer": 1.35,
        "Monsoon": 0.65,
        "Winter": 0.85,
        "Post-Monsoon": 1.05
    }
    pump_base_kwh = 2000.0
    season_mult = season_pump_multipliers.get(season, 1.0)
    temp_pump_mult = 1.0 + max(0.0, (temperature - 28.0) * 0.05)
    agricultural_adjusted = pump_base_kwh * season_mult * temp_pump_mult
    
    # 4. Commercial & street lighting baseline (~450 kWh)
    commercial_kwh = 450.0
    
    # 5. Raw predicted total
    raw_total_kwh = domestic_adjusted + agricultural_adjusted + commercial_kwh
    
    # Autoregressive blending with previous consumption (75% physics ML + 25% autoregression)
    predicted_demand = round((0.75 * raw_total_kwh) + (0.25 * previous_consumption), 1)
    
    # 6. Peak load estimation (kW)
    # Average load = total / 24 hrs. Peak load typically 2.8x - 3.4x average load due to synchronized evening & morning pump starts
    avg_load_kw = predicted_demand / 24.0
    peak_factor = 3.2 if season == "Summer" else 2.85
    peak_demand = round(max(historical_peak_demand * 0.9, avg_load_kw * peak_factor), 1)
    
    # 7. Grid transformer risk assessment (rated threshold 600 kW peak capacity)
    transformer_rated_kw = 600.0
    load_ratio = peak_demand / transformer_rated_kw
    
    if load_ratio > 1.05:
        risk_level = "High"
        explanation = f"Critical transformer overload risk! Peak demand ({peak_demand} kW) exceeds safe capacity ({transformer_rated_kw} kW)."
    elif load_ratio > 0.88:
        risk_level = "Medium"
        explanation = f"Elevated grid demand ({predicted_demand} kWh, {peak_demand} kW peak). Irrigation pump staggering recommended."
    else:
        risk_level = "Low"
        explanation = f"Normal grid load ({predicted_demand} kWh). Transformer operating within optimal safety margins."
        
    return {
        "predictedDemand": predicted_demand,
        "unit": "kWh",
        "peakDemand": peak_demand,
        "riskLevel": risk_level,
        "explanation": explanation
    }
