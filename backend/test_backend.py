import sys
from main import app
from ml.water_prediction import predict_water_demand
from ml.crop_health import predict_crop_health
from ml.yield_prediction import predict_crop_yield
from ml.electricity_prediction import predict_electricity_demand
from ml.risk_model import calculate_composite_risk
from services.simulation_service import SimulationService

print("Testing ML modules...")
water = predict_water_demand()
print("Water Demand:", water["predictedDemand"], water["riskLevel"])

crop_h = predict_crop_health()
print("Crop Health:", crop_h["cropHealth"], crop_h["status"])

c_yield = predict_crop_yield()
print("Yield Prediction:", c_yield["predictedYield"], c_yield["unit"])

elec = predict_electricity_demand()
print("Electricity Demand:", elec["predictedDemand"], elec["riskLevel"])

risk = calculate_composite_risk()
print("Risk Score:", risk["riskScore"], risk["riskLevel"])

print("\nTesting Simulation...")
sim = SimulationService.run_simulation({
    "waterReductionPct": 20,
    "temperatureDeltaC": 2.5,
    "rainfallDeltaPct": -30,
    "irrigationChangePct": -20,
    "electricityDemandChangePct": 15
})
print("Simulation output:", sim["scenarioName"])
print("Current vs Simulated Risk:", sim["currentState"]["overallRiskScore"], "->", sim["simulatedState"]["overallRiskScore"])
print("\nALL BACKEND & ML CHECKS PASSED!")
