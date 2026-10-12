import logging
from services.firestore_service import FirestoreService

logger = logging.getLogger("smart_village.seed")

def seed_initial_data(force: bool = False):
    """
    Populates Firestore (or the local backing cache) with realistic demo data
    for Green Valley Village, farms, fields, crops, water tanks, electricity nodes,
    weather history, alerts, and recommendations.
    """
    existing_villages = FirestoreService.get_all("villages")
    if existing_villages and not force:
        logger.info("Demo data already seeded.")
        return

    logger.info("Seeding realistic Smart Village Digital Twin data...")

    # 1. Users
    users_data = [
        {
            "userId": "ADMIN001",
            "name": "Ramanathan M (Village Officer)",
            "email": "admin@example.com",
            "role": "admin",
            "villageId": "V001",
            "createdAt": "2026-01-01T08:00:00Z"
        },
        {
            "userId": "USER001",
            "name": "Arun Kumar",
            "email": "arun@example.com",
            "role": "farmer",
            "villageId": "V001",
            "createdAt": "2026-01-15T09:30:00Z"
        },
        {
            "userId": "USER002",
            "name": "Kavitha Sundaram",
            "email": "kavitha@example.com",
            "role": "farmer",
            "villageId": "V001",
            "createdAt": "2026-02-10T11:00:00Z"
        }
    ]
    for u in users_data:
        FirestoreService.create("users", u["userId"], u)

    # 2. Village
    village_data = {
        "villageId": "V001",
        "name": "Green Valley Village",
        "district": "Example District",
        "state": "Tamil Nadu",
        "population": 5200,
        "area": 18.5,
        "latitude": 10.7905,
        "longitude": 78.7047,
        "totalFarms": 48,
        "totalWaterCapacity": 500000.0,
        "currentWaterAvailable": 374000.0,
        "electricityAvgUsage": 4200.0,
        "overallRiskScore": 28.0,
        "overallRiskLevel": "LOW"
    }
    FirestoreService.create("villages", "V001", village_data)

    # 3. Farms
    farms_data = [
        {
            "farmId": "F001",
            "farmName": "Green Valley Farm",
            "ownerId": "USER001",
            "villageId": "V001",
            "farmerName": "Arun Kumar",
            "area": 5.5,
            "soilType": "Clay",
            "location": "North Zone",
            "latitude": 10.7935,
            "longitude": 78.7025,
            "image": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&auto=format&fit=crop&q=80",
            "createdAt": "2026-02-01T10:00:00Z",
            "fieldsCount": 2
        },
        {
            "farmId": "F002",
            "farmName": "Sunrise Farm",
            "ownerId": "USER002",
            "villageId": "V001",
            "farmerName": "Kavitha Sundaram",
            "area": 4.2,
            "soilType": "Loam",
            "location": "East Zone",
            "latitude": 10.7890,
            "longitude": 78.7095,
            "image": "https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?w=600&auto=format&fit=crop&q=80",
            "createdAt": "2026-02-15T12:00:00Z",
            "fieldsCount": 2
        },
        {
            "farmId": "F003",
            "farmName": "Riverbank Farm",
            "ownerId": "USER001",
            "villageId": "V001",
            "farmerName": "Arun Kumar",
            "area": 7.0,
            "soilType": "Clay Loam",
            "location": "South Riverbank Zone",
            "latitude": 10.7860,
            "longitude": 78.7020,
            "image": "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=600&auto=format&fit=crop&q=80",
            "createdAt": "2026-03-01T09:00:00Z",
            "fieldsCount": 2
        }
    ]
    for f in farms_data:
        FirestoreService.create("farms", f["farmId"], f)

    # 4. Fields (with geo-coordinates for Leaflet polygon display)
    fields_data = [
        {
            "fieldId": "FL001",
            "farmId": "F001",
            "fieldName": "Field A (North Paddy)",
            "crop": "Rice",
            "area": 2.5,
            "soilType": "Clay",
            "moisture": 65.0,
            "temperature": 29.0,
            "rainfall": 120.0,
            "cropHealth": 84.0,
            "riskScore": 22.0,
            "riskLevel": "Low",
            "coordinates": [
                [10.7940, 78.7015],
                [10.7955, 78.7025],
                [10.7948, 78.7040],
                [10.7932, 78.7030]
            ]
        },
        {
            "fieldId": "FL002",
            "farmId": "F001",
            "fieldName": "Field B (Vegetable Patch)",
            "crop": "Tomato",
            "area": 1.0,
            "soilType": "Loam",
            "moisture": 52.0,
            "temperature": 31.0,
            "rainfall": 45.0,
            "cropHealth": 74.0,
            "riskScore": 45.0,
            "riskLevel": "Medium",
            "coordinates": [
                [10.7925, 78.7020],
                [10.7935, 78.7032],
                [10.7928, 78.7042],
                [10.7918, 78.7030]
            ]
        },
        {
            "fieldId": "FL003",
            "farmId": "F002",
            "fieldName": "Field C (East Grain)",
            "crop": "Wheat",
            "area": 2.2,
            "soilType": "Loam",
            "moisture": 48.0,
            "temperature": 27.5,
            "rainfall": 70.0,
            "cropHealth": 82.0,
            "riskScore": 25.0,
            "riskLevel": "Low",
            "coordinates": [
                [10.7895, 78.7080],
                [10.7910, 78.7095],
                [10.7900, 78.7110],
                [10.7885, 78.7095]
            ]
        },
        {
            "fieldId": "FL004",
            "farmId": "F002",
            "fieldName": "Field D (Dryland Maize)",
            "crop": "Maize",
            "area": 2.0,
            "soilType": "Sandy Loam",
            "moisture": 38.0,
            "temperature": 32.5,
            "rainfall": 40.0,
            "cropHealth": 68.0,
            "riskScore": 55.0,
            "riskLevel": "Medium",
            "coordinates": [
                [10.7878, 78.7085],
                [10.7890, 78.7100],
                [10.7880, 78.7115],
                [10.7868, 78.7100]
            ]
        },
        {
            "fieldId": "FL005",
            "farmId": "F003",
            "fieldName": "Field E (Cane Basin)",
            "crop": "Sugarcane",
            "area": 4.0,
            "soilType": "Clay Loam",
            "moisture": 72.0,
            "temperature": 29.5,
            "rainfall": 140.0,
            "cropHealth": 88.0,
            "riskScore": 18.0,
            "riskLevel": "Low",
            "coordinates": [
                [10.7865, 78.7010],
                [10.7878, 78.7030],
                [10.7860, 78.7045],
                [10.7845, 78.7025]
            ]
        },
        {
            "fieldId": "FL006",
            "farmId": "F003",
            "fieldName": "Field F (South Lowland Paddy)",
            "crop": "Rice",
            "area": 3.0,
            "soilType": "Alluvial",
            "moisture": 26.0,
            "temperature": 34.0,
            "rainfall": 15.0,
            "cropHealth": 48.0,
            "riskScore": 78.0,
            "riskLevel": "High",
            "coordinates": [
                [10.7840, 78.7005],
                [10.7855, 78.7020],
                [10.7845, 78.7035],
                [10.7830, 78.7020]
            ]
        }
    ]
    for fld in fields_data:
        FirestoreService.create("fields", fld["fieldId"], fld)

    # 5. Crops
    crops_data = [
        {
            "cropId": "CR001",
            "cropName": "Rice (ADT-37)",
            "fieldId": "FL001",
            "farmId": "F001",
            "plantingDate": "2026-06-15",
            "expectedHarvestDate": "2026-10-30",
            "area": 2.5,
            "cropHealth": 84.0,
            "growthStage": "Flowering",
            "riskLevel": "Low",
            "expectedYieldTons": 4.8,
            "image": "https://images.unsplash.com/photo-1536657464919-892534f60d6e?w=600&auto=format&fit=crop&q=80"
        },
        {
            "cropId": "CR002",
            "cropName": "Tomato (Hybrid Red)",
            "fieldId": "FL002",
            "farmId": "F001",
            "plantingDate": "2026-07-10",
            "expectedHarvestDate": "2026-11-15",
            "area": 1.0,
            "cropHealth": 74.0,
            "growthStage": "Fruiting",
            "riskLevel": "Medium",
            "expectedYieldTons": 8.5,
            "image": "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80"
        },
        {
            "cropId": "CR003",
            "cropName": "Wheat (Sharbati)",
            "fieldId": "FL003",
            "farmId": "F002",
            "plantingDate": "2026-08-01",
            "expectedHarvestDate": "2026-12-20",
            "area": 2.2,
            "cropHealth": 82.0,
            "growthStage": "Vegetative",
            "riskLevel": "Low",
            "expectedYieldTons": 3.4,
            "image": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&auto=format&fit=crop&q=80"
        },
        {
            "cropId": "CR004",
            "cropName": "Maize (African Tall)",
            "fieldId": "FL004",
            "farmId": "F002",
            "plantingDate": "2026-07-20",
            "expectedHarvestDate": "2026-11-05",
            "area": 2.0,
            "cropHealth": 68.0,
            "growthStage": "Tasseling",
            "riskLevel": "Medium",
            "expectedYieldTons": 3.2,
            "image": "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600&auto=format&fit=crop&q=80"
        },
        {
            "cropId": "CR005",
            "cropName": "Sugarcane (Co 86032)",
            "fieldId": "FL005",
            "farmId": "F003",
            "plantingDate": "2026-02-10",
            "expectedHarvestDate": "2027-02-15",
            "area": 4.0,
            "cropHealth": 88.0,
            "growthStage": "Tillering",
            "riskLevel": "Low",
            "expectedYieldTons": 136.0,
            "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80"
        }
    ]
    for c in crops_data:
        FirestoreService.create("crops", c["cropId"], c)

    # 6. Water Resources
    water_data = [
        {
            "resourceId": "W001",
            "name": "Village Tank 1",
            "type": "Water Tank",
            "capacity": 100000.0,
            "currentLevel": 72000.0,
            "dailyUsage": 8500.0,
            "predictedDemand": 9200.0,
            "riskLevel": "Medium",
            "location": "East Canal Zone",
            "latitude": 10.7938,
            "longitude": 78.7065
        },
        {
            "resourceId": "W002",
            "name": "Agricultural Reservoir",
            "type": "Reservoir",
            "capacity": 350000.0,
            "currentLevel": 280000.0,
            "dailyUsage": 16000.0,
            "predictedDemand": 17200.0,
            "riskLevel": "Low",
            "location": "North Hill Runoff",
            "latitude": 10.7970,
            "longitude": 78.7010
        },
        {
            "resourceId": "W003",
            "name": "Community Water Storage",
            "type": "Overhead Tank",
            "capacity": 50000.0,
            "currentLevel": 22000.0,
            "dailyUsage": 5200.0,
            "predictedDemand": 6800.0,
            "riskLevel": "High",
            "location": "South Settlement Gate",
            "latitude": 10.7850,
            "longitude": 78.7050
        }
    ]
    for w in water_data:
        FirestoreService.create("water_resources", w["resourceId"], w)

    # 7. Electricity Infrastructure & Records
    electricity_data = [
        {
            "recordId": "E001",
            "nodeName": "Village Central Transformer",
            "date": "2026-10-12",
            "consumption": 4200.0,
            "peakDemand": 580.0,
            "averageDemand": 175.0,
            "predictedDemand": 4500.0,
            "riskLevel": "Medium",
            "irrigationUsage": 2100.0,
            "domesticUsage": 1650.0,
            "latitude": 10.7915,
            "longitude": 78.7042
        },
        {
            "recordId": "E002",
            "nodeName": "Agricultural Pump Substation",
            "date": "2026-10-12",
            "consumption": 2450.0,
            "peakDemand": 380.0,
            "averageDemand": 102.0,
            "predictedDemand": 2800.0,
            "riskLevel": "High",
            "irrigationUsage": 2200.0,
            "domesticUsage": 150.0,
            "latitude": 10.7945,
            "longitude": 78.7018
        },
        {
            "recordId": "E003",
            "nodeName": "Community Building Micro-grid",
            "date": "2026-10-12",
            "consumption": 750.0,
            "peakDemand": 95.0,
            "averageDemand": 31.0,
            "predictedDemand": 780.0,
            "riskLevel": "Low",
            "irrigationUsage": 0.0,
            "domesticUsage": 650.0,
            "latitude": 10.7880,
            "longitude": 78.7060
        }
    ]
    for e in electricity_data:
        FirestoreService.create("electricity", e["recordId"], e)

    # 8. Weather Current & History
    weather_data = [
        {"recordId": "WEATH_01", "date": "2026-10-12", "temperature": 29.5, "humidity": 72.0, "rainfall": 8.0, "condition": "Cloudy", "windSpeed": 12.0},
        {"recordId": "WEATH_02", "date": "2026-10-11", "temperature": 30.2, "humidity": 69.0, "rainfall": 0.0, "condition": "Sunny", "windSpeed": 10.5},
        {"recordId": "WEATH_03", "date": "2026-10-10", "temperature": 31.0, "humidity": 65.0, "rainfall": 0.0, "condition": "Sunny", "windSpeed": 11.2},
        {"recordId": "WEATH_04", "date": "2026-10-09", "temperature": 28.5, "humidity": 78.0, "rainfall": 22.0, "condition": "Rainy", "windSpeed": 16.0},
        {"recordId": "WEATH_05", "date": "2026-10-08", "temperature": 29.0, "humidity": 75.0, "rainfall": 14.5, "condition": "Rainy", "windSpeed": 14.0}
    ]
    for wt in weather_data:
        FirestoreService.create("weather", wt["recordId"], wt)

    # 9. Alerts
    alerts_data = [
        {
            "alertId": "ALT001",
            "title": "High Water Deficit in South Storage",
            "message": "Community Water Storage level has dropped to 44% capacity with predicted daily deficit of 1,600 litres.",
            "severity": "HIGH",
            "category": "Water",
            "timestamp": "2026-10-12T10:15:00Z",
            "status": "ACTIVE"
        },
        {
            "alertId": "ALT002",
            "title": "Severe Soil Moisture Stress in Field F",
            "message": "Field F (South Lowland Paddy) moisture dropped to 26% (threshold 60%). Crop health decline to 48% detected.",
            "severity": "CRITICAL",
            "category": "Agriculture",
            "timestamp": "2026-10-12T09:30:00Z",
            "status": "ACTIVE"
        },
        {
            "alertId": "ALT003",
            "title": "Evening Transformer Peak Load Warning",
            "message": "Central Village Transformer surge reached 580 kW (rated 600 kW). Stagger agricultural tube wells.",
            "severity": "WARNING",
            "category": "Electricity",
            "timestamp": "2026-10-12T18:45:00Z",
            "status": "ACTIVE"
        },
        {
            "alertId": "ALT004",
            "title": "Elevated Ambient Temperature Advisory",
            "message": "Peak midday temperatures reached 32.5°C with high evapotranspiration demand.",
            "severity": "INFO",
            "category": "Weather",
            "timestamp": "2026-10-12T12:00:00Z",
            "status": "ACTIVE"
        },
        {
            "alertId": "ALT005",
            "title": "Dryland Maize Moisture Watch",
            "message": "Field D (Sunrise Farm) moisture at 38%. Flowering stage sensitivity requires prompt irrigation.",
            "severity": "WARNING",
            "category": "Agriculture",
            "timestamp": "2026-10-12T08:00:00Z",
            "status": "ACTIVE"
        },
        {
            "alertId": "ALT006",
            "title": "Agricultural Pump Substation High Demand",
            "message": "Pumping feeder demand at 2,450 kWh, exceeding 7-day rolling average by 18%.",
            "severity": "HIGH",
            "category": "Electricity",
            "timestamp": "2026-10-12T15:30:00Z",
            "status": "ACTIVE"
        },
        {
            "alertId": "ALT007",
            "title": "Village Reservoir Storage Stable",
            "message": "Agricultural Reservoir maintains healthy 80% capacity with 280,000 litres available.",
            "severity": "INFO",
            "category": "Water",
            "timestamp": "2026-10-12T07:00:00Z",
            "status": "ACTIVE"
        }
    ]
    for a in alerts_data:
        FirestoreService.create("alerts", a["alertId"], a)

    # 10. Recommendations
    recs_data = [
        {
            "recId": "REC001",
            "title": "Emergency Irrigation Shift for Field F",
            "domain": "Agriculture",
            "text": "Direct 12,000 litres of supplemental irrigation to South Lowland Paddy within 24 hours to halt vegetative wilt.",
            "impact": "Saves an estimated 2.2 tons of paddy yield",
            "priority": "HIGH"
        },
        {
            "recId": "REC002",
            "title": "Two-Phase Agricultural Feeder Scheduling",
            "domain": "Electricity",
            "text": "Shift Sunrise Farm irrigation pumps to 05:00-09:00 AM window and Green Valley Farm to 01:00-05:00 PM to shave 130 kW off evening peak.",
            "impact": "Maintains grid headroom and prevents transformer trip",
            "priority": "HIGH"
        },
        {
            "recId": "REC003",
            "title": "Canal Desilting & Tank Recharge Preparation",
            "domain": "Water",
            "text": "Execute desilting on eastern feeding canals before the northeast monsoon rains to capture 45,000 litres additional runoff.",
            "impact": "Increases rainwater harvesting efficiency by 30%",
            "priority": "MEDIUM"
        },
        {
            "recId": "REC004",
            "title": "Mulching for Vegetable Plots",
            "domain": "Agriculture",
            "text": "Apply straw mulching to Field B (Tomato) to lower root zone temperature by 3°C and retain 35% more moisture.",
            "impact": "Conserves 2,500 litres water weekly",
            "priority": "MEDIUM"
        }
    ]
    for r in recs_data:
        FirestoreService.create("recommendations", r["recId"], r)

    logger.info("Smart Village Demo Data seeded successfully!")
