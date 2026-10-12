from typing import Optional, List, Dict, Any, Union
from pydantic import BaseModel, Field
from datetime import datetime

# --- User & Auth ---
class UserBase(BaseModel):
    name: str
    email: str
    role: str = "farmer"  # "admin" or "farmer"
    villageId: str = "V001"

class UserCreate(UserBase):
    password: Optional[str] = None

class UserResponse(UserBase):
    userId: str
    createdAt: str

# --- Village ---
class VillageBase(BaseModel):
    name: str = "Green Valley Village"
    district: str = "Example District"
    state: str = "Tamil Nadu"
    population: int = 5200
    area: float = 18.5
    latitude: float = 10.7905
    longitude: float = 78.7047

class VillageCreate(VillageBase):
    pass

class VillageResponse(VillageBase):
    villageId: str
    totalFarms: Optional[int] = 0
    totalWaterCapacity: Optional[float] = 0.0
    currentWaterAvailable: Optional[float] = 0.0
    electricityAvgUsage: Optional[float] = 0.0
    overallRiskScore: Optional[float] = 25.0
    overallRiskLevel: Optional[str] = "Low"

# --- Farm ---
class FarmBase(BaseModel):
    farmName: str
    ownerId: str = "USER001"
    villageId: str = "V001"
    area: float = 5.5
    soilType: str = "Clay"
    location: str = "North Zone"
    farmerName: Optional[str] = "Arun Kumar"
    image: Optional[str] = "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&auto=format&fit=crop&q=80"
    latitude: Optional[float] = 10.7920
    longitude: Optional[float] = 78.7030

class FarmCreate(FarmBase):
    pass

class FarmResponse(FarmBase):
    farmId: str
    createdAt: str
    fieldsCount: Optional[int] = 0

# --- Field ---
class FieldBase(BaseModel):
    farmId: str = "F001"
    fieldName: str = "Field A"
    crop: str = "Rice"
    area: float = 2.5
    soilType: str = "Clay"
    moisture: float = 65.0
    temperature: float = 29.0
    rainfall: float = 120.0
    cropHealth: float = 84.0
    riskScore: float = 25.0
    riskLevel: str = "Low"
    coordinates: Optional[List[List[float]]] = None

class FieldCreate(FieldBase):
    pass

class FieldResponse(FieldBase):
    fieldId: str

# --- Crop ---
class CropBase(BaseModel):
    cropName: str = "Rice"
    fieldId: str = "FL001"
    farmId: str = "F001"
    plantingDate: str = "2026-06-15"
    expectedHarvestDate: str = "2026-10-30"
    area: float = 2.5
    cropHealth: float = 84.0
    growthStage: str = "Flowering"
    riskLevel: str = "Low"
    expectedYieldTons: Optional[float] = 4.8
    image: Optional[str] = "https://images.unsplash.com/photo-1536657464919-892534f60d6e?w=600&auto=format&fit=crop&q=80"

class CropCreate(CropBase):
    pass

class CropResponse(CropBase):
    cropId: str

# --- Water Resource ---
class WaterResourceBase(BaseModel):
    name: str = "Village Tank 1"
    type: str = "Water Tank"
    capacity: float = 100000.0
    currentLevel: float = 72000.0
    dailyUsage: float = 8500.0
    predictedDemand: float = 9200.0
    riskLevel: str = "Medium"
    location: str = "East Canal Zone"
    latitude: Optional[float] = 10.7950
    longitude: Optional[float] = 78.7080

class WaterResourceCreate(WaterResourceBase):
    pass

class WaterResourceResponse(WaterResourceBase):
    resourceId: str

# --- Electricity ---
class ElectricityRecordBase(BaseModel):
    date: str = "2026-10-12"
    consumption: float = 4200.0
    peakDemand: float = 580.0
    averageDemand: Optional[float] = 175.0
    predictedDemand: float = 4500.0
    riskLevel: str = "Medium"
    nodeName: Optional[str] = "Village Central Transformer"
    irrigationUsage: Optional[float] = 2100.0
    domesticUsage: Optional[float] = 1650.0

class ElectricityRecordCreate(ElectricityRecordBase):
    pass

class ElectricityRecordResponse(ElectricityRecordBase):
    recordId: str

# --- Weather ---
class WeatherRecordBase(BaseModel):
    date: str = "2026-10-12"
    temperature: float = 29.0
    humidity: float = 72.0
    rainfall: float = 8.0
    condition: str = "Cloudy"
    windSpeed: Optional[float] = 12.0

class WeatherRecordCreate(WeatherRecordBase):
    pass

class WeatherRecordResponse(WeatherRecordBase):
    recordId: str

# --- Prediction Requests & Responses ---
class WaterPredictionRequest(BaseModel):
    historicalUsage: Optional[float] = 8500.0
    population: Optional[int] = 5200
    temperature: Optional[float] = 29.5
    rainfall: Optional[float] = 8.0
    agriculturalDemand: Optional[float] = 5800.0
    previousConsumption: Optional[float] = 8600.0

class WaterPredictionResponse(BaseModel):
    predictedDemand: float
    unit: str = "litres/day"
    riskLevel: str
    riskScore: float
    explanation: str

class CropHealthPredictionRequest(BaseModel):
    crop: str = "Rice"
    soilType: str = "Clay"
    moisture: float = 65.0
    temperature: float = 29.0
    rainfall: float = 120.0
    growthStage: str = "Flowering"
    historicalCropHealth: Optional[float] = 84.0

class CropHealthPredictionResponse(BaseModel):
    cropHealth: float
    status: str
    riskLevel: str
    stressFactors: List[str]

class YieldPredictionRequest(BaseModel):
    crop: str = "Rice"
    area: float = 2.5
    soilType: str = "Clay"
    rainfall: float = 120.0
    temperature: float = 29.0
    cropHealth: float = 84.0
    historicalYield: Optional[float] = 4.8

class YieldPredictionResponse(BaseModel):
    predictedYield: float
    unit: str = "tons"
    confidence: float
    yieldPerAcre: float

class ElectricityPredictionRequest(BaseModel):
    previousConsumption: Optional[float] = 4200.0
    population: Optional[int] = 5200
    temperature: Optional[float] = 29.5
    season: Optional[str] = "Summer"
    historicalPeakDemand: Optional[float] = 580.0

class ElectricityPredictionResponse(BaseModel):
    predictedDemand: float
    unit: str = "kWh"
    peakDemand: float
    riskLevel: str
    explanation: str

class RiskPredictionRequest(BaseModel):
    waterAvailabilityRatio: Optional[float] = 0.72
    waterDemandRatio: Optional[float] = 1.15
    averageCropHealth: Optional[float] = 84.0
    temperature: Optional[float] = 29.5
    rainfallDeficit: Optional[float] = 15.0
    electricityDemandRatio: Optional[float] = 1.08

class RiskPredictionResponse(BaseModel):
    riskScore: float
    riskLevel: str
    factors: Dict[str, float]
    summary: str

# --- What-If Simulation ---
class SimulationRequest(BaseModel):
    waterReductionPct: float = 20.0       # e.g. reduce water by 20%
    temperatureDeltaC: float = 2.0        # e.g. +2°C
    rainfallDeltaPct: float = -25.0       # e.g. -25% rainfall
    irrigationChangePct: float = -15.0    # e.g. -15% irrigation
    electricityDemandChangePct: float = 15.0 # e.g. +15% electricity

class SimulationStateData(BaseModel):
    waterAvailability: float
    waterDemand: float
    waterShortageRisk: str
    cropHealth: float
    cropYieldTons: float
    cropRisk: str
    electricityDemand: float
    electricityPeak: float
    electricityRisk: str
    overallRiskScore: float
    overallRiskLevel: str

class SimulationResponse(BaseModel):
    scenarioName: str
    currentState: SimulationStateData
    simulatedState: SimulationStateData
    changes: Dict[str, Any]
    recommendations: List[str]
    alerts: List[str]

# --- Alerts & Recommendations ---
class AlertResponse(BaseModel):
    alertId: str
    title: str
    message: str
    severity: str  # INFO, WARNING, HIGH, CRITICAL
    category: str  # Water, Agriculture, Electricity, Weather, System
    timestamp: str
    status: str = "ACTIVE"

class RecommendationResponse(BaseModel):
    recId: str
    title: str
    domain: str   # Water, Agriculture, Electricity, General
    text: str
    impact: str
    priority: str # LOW, MEDIUM, HIGH
