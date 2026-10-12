# Cloud-Based AI Digital Twin for Smart Village Resource Monitoring and Predictive Analytics

A full-stack, cloud-based AI digital twin web application for rural resource monitoring (water resources, agricultural fields, crops, electricity grid, weather, and infrastructure) and predictive decision support **without IoT hardware, sensors, MQTT, or live physical telemetry**.

---

## 🌟 Key Features

1. **100% Zero-IoT Architecture**: Strictly operates using manual data entry, historical CSV datasets, user inputs, Cloud Firestore, and AI/ML simulation. No Arduino, ESP32, Raspberry Pi, MQTT brokers, or hardware sensor gateways.
2. **Geospatial Village Digital Twin**: Interactive Leaflet.js map with color-coded risk indicators (Green: Normal, Yellow: Medium risk, Red: High risk), farm bounds, agricultural field polygons, water reservoirs, and electrical grid nodes with click-to-inspect popups.
3. **AI / Machine Learning Prediction Engine**:
   - **Water Demand Predictor**: Combines rural per-capita domestic baselines with temperature evapotranspiration and rainfall offsets.
   - **Crop Health Model**: Evaluates crop agronomic bounds against moisture, temperature, and soil type to compute a 0–100 vigor index and identify stress factors.
   - **Harvest Yield Predictor**: Estimates crop yield (tons/acre and total tonnage) based on soil fertility, weather suitability, and health metrics.
   - **Electricity Demand & Peak Load Forecaster**: Predicts daily kWh and peak kW surges to safeguard distribution transformers.
   - **Multi-Factor Composite Risk Index**: Evaluates resource strain across water (35%), agriculture (30%), electricity (20%), and weather (15%) into a 0–100 index (LOW: 0–30, MEDIUM: 31–60, HIGH: 61–100).
   - **Anomaly Detector**: Z-score statistical detector flagging consumption spikes, power surges, and drought conditions.
4. **Digital Twin What-If Laboratory**: Interactive parameter sliders allowing users to simulate climate shifts, water cuts, and irrigation adjustments with side-by-side **Current State vs. Simulated State** analytics and dynamic advisories.
5. **CSV Dataset Management**: Admin interface to preview, validate columns, and batch-ingest historical datasets into Cloud Firestore.
6. **Role-Based Authentication**: Separate role experiences for **Village Administrator** (complete village oversight) and **Farmer** (farm and field management).
7. **Development Demo Mode**: When running locally without Firebase configuration, use the demo personas and pre-seeded Green Valley Village data. Demo shortcuts are disabled in production.

---

## 🏗️ Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide React, Recharts, Leaflet.js (`react-leaflet`), Axios.
- **Backend**: Python 3.13, FastAPI, Uvicorn, Pydantic, Pandas, NumPy, Scikit-learn.
- **Cloud & Database**: Google Firebase (Authentication, Cloud Firestore, Storage, Hosting).

---

## 📁 Project Structure

```
smart-village-digital-twin/
├── backend/
│   ├── main.py                     # FastAPI application entrypoint & health checks
│   ├── requirements.txt            # Python dependencies
│   ├── .env.example                # Backend environment configuration
│   ├── config/
│   │   └── firebase.py             # Firebase Admin SDK & fallback local store
│   ├── models/
│   │   └── schemas.py              # Pydantic request/response schemas
│   ├── ml/
│   │   ├── water_prediction.py     # Water demand ML model
│   │   ├── crop_health.py          # Crop health evaluation model
│   │   ├── yield_prediction.py     # Crop yield predictor
│   │   ├── electricity_prediction.py # Grid demand & peak load model
│   │   ├── risk_model.py           # Multi-factor composite risk model (0-100)
│   │   └── anomaly_detection.py    # Statistical anomaly detection
│   ├── services/
│   │   ├── auth_service.py         # Firebase token verification & API authorization
│   │   ├── firestore_service.py    # Cloud Firestore CRUD & local cache
│   │   ├── prediction_service.py   # Prediction runner & audit log
│   │   ├── risk_service.py         # Subsystem risk evaluator
│   │   ├── simulation_service.py   # What-If scenario engine
│   │   └── recommendation_service.py # Actionable advisory engine
│   ├── routes/
│   │   ├── auth.py                # Firebase-backed user profile endpoints
│   │   ├── villages.py             # Village REST endpoints
│   │   ├── farms.py                # Farm CRUD endpoints
│   │   ├── fields.py               # Field management endpoints
│   │   ├── crops.py                # Crop tracking endpoints
│   │   ├── water.py                # Water resource endpoints
│   │   ├── electricity.py          # Electricity endpoints
│   │   ├── weather.py              # Meteorological endpoints
│   │   ├── predictions.py          # AI prediction endpoints (/api/predict-*)
│   │   ├── simulation.py           # What-if simulation endpoint (/api/simulation)
│   │   ├── alerts.py               # Active alerts endpoints (/api/alerts)
│   │   ├── recommendations.py      # Recommendation endpoints (/api/recommendations)
│   │   └── datasets.py             # CSV upload & preview endpoints
│   └── data/
│       └── seed_data.py            # Pre-seeded Green Valley Village demo dataset
├── frontend/
│   ├── index.html                  # HTML5 entry with fonts & Leaflet styles
│   ├── package.json                # Dependencies & scripts
│   ├── vite.config.js              # Vite configuration with Tailwind & proxy
│   ├── .env.example                # Frontend environment configuration
│   └── src/
│       ├── context/
│       │   └── AuthContext.jsx      # Firebase Authentication & local demo personas
│       ├── services/
│       │   ├── api.js              # Axios backend client
│       │   └── firebase.js         # Firebase client SDK
│       ├── components/
│       │   ├── Navbar.jsx          # Header with role indicator & notifications
│       │   ├── Sidebar.jsx         # Navigation sidebar
│       │   ├── StatCard.jsx        # Metric KPI cards
│       │   ├── RiskBadge.jsx       # Color-coded risk status badges
│       │   ├── AlertCard.jsx       # Event alert cards
│       │   ├── DigitalTwinMap.jsx  # Interactive Leaflet map
│       │   ├── SimulationPanel.jsx # Sliders for What-If scenarios
│       │   ├── ChartCard.jsx       # Recharts container
│       │   └── Modal.jsx           # Form modal dialogs
│       └── pages/
│           ├── Login.jsx           # Firebase sign-in & development-only demo buttons
│           ├── Register.jsx        # Account registration
│           ├── Dashboard.jsx       # Role-aware unified dashboard
│           ├── VillageTwin.jsx     # Full-screen geospatial digital twin cockpit
│           ├── Farms.jsx           # Farm estate CRUD
│           ├── Fields.jsx          # Field parcels & health monitoring
│           ├── Crops.jsx           # Crop growth phenology & yield
│           ├── Water.jsx           # Water capacity, usage & manual entry
│           ├── Electricity.jsx     # Power load, peak surge & manual entry
│           ├── Weather.jsx         # Weather historical logs & manual input
│           ├── Analytics.jsx       # Recharts visual analytics dashboard
│           ├── Predictions.jsx     # Interactive ML prediction center
│           ├── Simulation.jsx      # Digital Twin What-If laboratory
│           ├── Alerts.jsx          # Real-time alerts with filters
│           ├── Recommendations.jsx # AI advisories & decision support
│           ├── Datasets.jsx        # CSV upload, preview & validation
│           ├── AdminDashboard.jsx  # Administrative system console
│           └── Profile.jsx         # User profile & persona switch
├── sample_data/
│   ├── village_weather_history.csv
│   ├── village_water_consumption.csv
│   ├── village_electricity_usage.csv
│   └── village_crop_yield_history.csv
├── firestore.rules                 # Role-based Cloud Firestore security rules
├── firebase.json                   # Firebase hosting configuration
├── render.yaml                     # Render frontend/API deployment blueprint
└── README.md
```

---

## 🚀 Step-by-Step Local Setup & Execution

### 1. Prerequisites
- **Node.js**: v18+ (tested on v22.19.0) & npm
- **Python**: 3.10+ (tested on Python 3.13)

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create and activate Python virtual environment
python -m venv venv

# Windows:
.\venv\Scripts\activate
# Linux/macOS:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
- **Backend API**: `http://localhost:8000`
- **Swagger Documentation**: `http://localhost:8000/docs`
- **ReDoc Documentation**: `http://localhost:8000/redoc`
- **Health Check**: `http://localhost:8000/health`

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
- **Frontend App**: `http://localhost:5173`

---

## ☁️ Production Deployment on Render

The root `render.yaml` defines a Render Blueprint with a React static site and a FastAPI web service. The API requires Firebase Authentication ID tokens and Cloud Firestore credentials in production; it will fail to start rather than silently use temporary local storage. The API uses Render's Free plan, which may spin down when idle; expect a delay on its first request after inactivity. Review Render's current plan terms before applying the Blueprint.

1. Create a Firebase project. Enable **Authentication > Email/Password**, create a Cloud Firestore database, and publish this repository's `firestore.rules`.
2. Add this project to a GitHub repository and push the source. Do not commit `.env` files or service-account JSON files; the root `.gitignore` excludes them.
3. In Render, create a new **Blueprint** and connect the GitHub repository. Render will read `render.yaml` and prompt for the Firebase environment values.
4. Set the backend `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` from a Firebase Admin SDK service account. Keep the private key in Render's secret environment variable; never add it to the repository.
5. Set the frontend `VITE_FIREBASE_*` values from the Firebase web-app configuration. Render wires the frontend API URL and backend CORS origin to the two service hostnames.
6. After the first deploy, add the frontend's `onrender.com` hostname under Firebase Authentication's **Authorized domains**.
7. Register an account through the site. New accounts are farmers by default. To assign the first administrator, find that Firebase user's UID under **Authentication**, then change `users/{UID}.role` to `admin` in the Firestore console. The user must sign out and back in before the new role appears. Admins can then add village data or upload datasets.

Production startup does not seed the demo dataset. Use the administrator account to enter real data or import reviewed CSVs. The application is scoped to a single village; review the Firestore rules and your operational security requirements before storing sensitive personal or agricultural data.

---

## ☁️ Complete Firebase Setup Guide (20 Steps)

1. Navigate to the [Firebase Console](https://console.firebase.google.com/) and click **Add project**.
2. Name your project (e.g., `smart-village-digital-twin`) and click **Continue**.
3. In the left navigation, click **Build > Authentication** and select **Get started**.
4. Under **Sign-in method**, enable **Email/Password** and click **Save**.
5. Under **Build > Firestore Database**, click **Create database** in Production mode.
6. Select your preferred Cloud Firestore server location.
7. Under **Build > Storage**, click **Get started** to enable Cloud Storage for farm/crop images.
8. In Project Overview, click the **Web icon (`</>`)** to register a new Web App.
9. Name your web application (e.g., `SmartVillageWeb`).
10. Copy the generated `firebaseConfig` keys.
11. Open `frontend/.env` and paste the credentials:
    ```env
    VITE_FIREBASE_API_KEY=AIzaSy...
    VITE_FIREBASE_AUTH_DOMAIN=smart-village.firebaseapp.com
    VITE_FIREBASE_PROJECT_ID=smart-village
    VITE_FIREBASE_STORAGE_BUCKET=smart-village.appspot.com
    VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
    VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
    VITE_API_BASE_URL=http://localhost:8000
    ```
12. Go to **Project Settings > Service accounts > Firebase Admin SDK**.
13. Click **Generate new private key** and download the service account JSON.
14. Configure `backend/.env` with your Firebase project credentials or place the JSON file in `backend/` and set `FIREBASE_SERVICE_ACCOUNT_PATH`.
15. In Firebase Console > Firestore > Rules, copy the contents of `firestore.rules` and click **Publish**.
16. Start the FastAPI backend (`uvicorn main:app --reload`).
17. Start the React frontend (`npm run dev`).
18. For local development without Firebase, open `http://localhost:5173/login` and use a demo persona. With Firebase configured, register a farmer account or sign in; admin roles must be assigned by an administrator.
19. Navigate to **Predictions** and run machine learning models for Water, Yield, Crop Health, Electricity, or Risk.
20. Navigate to **What-If Simulation** to test climate variations (-30% rain, +2.5°C temp, -20% water cut) and observe side-by-side digital twin responses.

---

## 📊 REST API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/health` | `GET` | Health check endpoint returning status and service name |
| `/api/villages` | `GET`, `POST` | List villages or create new village metadata |
| `/api/villages/{id}` | `GET` | Get detailed village digital twin status |
| `/api/farms` | `GET`, `POST` | Farm management CRUD and search |
| `/api/farms/{id}` | `GET`, `PUT`, `DELETE` | View, update, or remove farm record |
| `/api/fields` | `GET`, `POST` | Field management with automatic ML health scoring |
| `/api/crops` | `GET`, `POST` | Crop growth phenology and yield estimation |
| `/api/water` | `GET`, `POST` | Water capacity, consumption, and manual entries |
| `/api/water/summary` | `GET` | Village water availability percentage and shortage risk |
| `/api/electricity` | `GET`, `POST` | Electricity usage, transformer nodes, and peak kW |
| `/api/weather` | `GET`, `POST` | Meteorological logs and manual observations |
| `/api/predict-water` | `POST` | AI water demand prediction |
| `/api/predict-crop-health` | `POST` | ML crop health and stress factors prediction |
| `/api/predict-yield` | `POST` | Harvest tonnage prediction with confidence scores |
| `/api/predict-electricity` | `POST` | Peak grid load and transformer surge forecasting |
| `/api/predict-risk` | `POST` | Multi-factor composite risk index (0–100) |
| `/api/simulation` | `POST` | Digital Twin What-If scenario simulator |
| `/api/alerts` | `GET` | Active alerts filtered by severity and category |
| `/api/alerts/{id}/acknowledge` | `POST` | Mark alert as acknowledged |
| `/api/recommendations` | `GET` | Actionable advisories for admins and farmers |
| `/api/datasets/preview` | `POST` | Validate and preview uploaded CSV files |
| `/api/datasets/upload` | `POST` | Batch ingest CSV rows into Cloud Firestore |
| `/api/reset-demo` | `POST` | Re-seed the village state to default demo dataset |
