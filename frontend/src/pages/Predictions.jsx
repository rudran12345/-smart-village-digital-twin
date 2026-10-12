import React, { useState } from 'react';
import { apiService } from '../services/api';
import RiskBadge from '../components/RiskBadge';
import {
  Cpu,
  Droplet,
  Sprout,
  TrendingUp,
  Zap,
  ShieldAlert,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

export default function Predictions() {
  const [activeTab, setActiveTab] = useState('water');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // 1. Water Form State
  const [waterForm, setWaterForm] = useState({
    historicalUsage: 8500,
    population: 5200,
    temperature: 29.5,
    rainfall: 8.0,
    agriculturalDemand: 5800,
    previousConsumption: 8600,
  });

  // 2. Crop Health Form State
  const [cropHealthForm, setCropHealthForm] = useState({
    crop: 'Rice',
    soilType: 'Clay',
    moisture: 65,
    temperature: 29.0,
    rainfall: 120,
    growthStage: 'Flowering',
    historicalCropHealth: 84,
  });

  // 3. Yield Form State
  const [yieldForm, setYieldForm] = useState({
    crop: 'Rice',
    area: 2.5,
    soilType: 'Clay',
    rainfall: 120,
    temperature: 29.0,
    cropHealth: 84,
    historicalYield: 4.8,
  });

  // 4. Electricity Form State
  const [electricityForm, setElectricityForm] = useState({
    previousConsumption: 4200,
    population: 5200,
    temperature: 29.5,
    season: 'Summer',
    historicalPeakDemand: 580,
  });

  // 5. Risk Form State
  const [riskForm, setRiskForm] = useState({
    waterAvailabilityRatio: 0.72,
    waterDemandRatio: 1.15,
    averageCropHealth: 84.0,
    temperature: 29.5,
    rainfallDeficit: 15.0,
    electricityDemandRatio: 1.08,
  });

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      let res;
      if (activeTab === 'water') {
        res = await apiService.predictWater(waterForm);
      } else if (activeTab === 'cropHealth') {
        res = await apiService.predictCropHealth(cropHealthForm);
      } else if (activeTab === 'yield') {
        res = await apiService.predictYield(yieldForm);
      } else if (activeTab === 'electricity') {
        res = await apiService.predictElectricity(electricityForm);
      } else if (activeTab === 'risk') {
        res = await apiService.predictRisk(riskForm);
      }
      setResult(res.data);
    } catch (err) {
      console.error('Prediction failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Cpu className="w-6 h-6 text-emerald-600" />
          AI & Machine Learning Prediction Center
        </h1>
        <p className="text-xs text-slate-500">
          Scikit-learn algorithms forecasting water demand, crop health, harvest yield, and electrical load without hardware sensors.
        </p>
      </div>

      {/* Prediction Subsystem Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        <button
          onClick={() => {
            setActiveTab('water');
            setResult(null);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'water'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Droplet className="w-4 h-4" /> Water Demand
        </button>

        <button
          onClick={() => {
            setActiveTab('cropHealth');
            setResult(null);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'cropHealth'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sprout className="w-4 h-4" /> Crop Health
        </button>

        <button
          onClick={() => {
            setActiveTab('yield');
            setResult(null);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'yield'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-4 h-4" /> Harvest Yield
        </button>

        <button
          onClick={() => {
            setActiveTab('electricity');
            setResult(null);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'electricity'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Zap className="w-4 h-4" /> Electricity Demand
        </button>

        <button
          onClick={() => {
            setActiveTab('risk');
            setResult(null);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'risk'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldAlert className="w-4 h-4" /> Composite Risk Model
        </button>
      </div>

      {/* Main Form + Prediction Result View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Container (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <form onSubmit={handlePredict} className="space-y-4">
            {/* 1. Water Form */}
            {activeTab === 'water' && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-800 text-sm">
                  Water Demand Prediction Parameters
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Historical Usage (L/day)
                    </label>
                    <input
                      type="number"
                      value={waterForm.historicalUsage}
                      onChange={(e) =>
                        setWaterForm({ ...waterForm, historicalUsage: parseFloat(e.target.value) })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Village Population
                    </label>
                    <input
                      type="number"
                      value={waterForm.population}
                      onChange={(e) =>
                        setWaterForm({ ...waterForm, population: parseInt(e.target.value) })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Ambient Temperature (°C)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={waterForm.temperature}
                      onChange={(e) =>
                        setWaterForm({ ...waterForm, temperature: parseFloat(e.target.value) })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Recent Rainfall (mm)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={waterForm.rainfall}
                      onChange={(e) =>
                        setWaterForm({ ...waterForm, rainfall: parseFloat(e.target.value) })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Agricultural Draw (L/day)
                    </label>
                    <input
                      type="number"
                      value={waterForm.agriculturalDemand}
                      onChange={(e) =>
                        setWaterForm({
                          ...waterForm,
                          agriculturalDemand: parseFloat(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Prior Day Consumption (L)
                    </label>
                    <input
                      type="number"
                      value={waterForm.previousConsumption}
                      onChange={(e) =>
                        setWaterForm({
                          ...waterForm,
                          previousConsumption: parseFloat(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. Crop Health Form */}
            {activeTab === 'cropHealth' && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-800 text-sm">
                  Crop Health Model Parameters
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Crop</label>
                    <select
                      value={cropHealthForm.crop}
                      onChange={(e) => setCropHealthForm({ ...cropHealthForm, crop: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                    >
                      <option value="Rice">Rice</option>
                      <option value="Wheat">Wheat</option>
                      <option value="Maize">Maize</option>
                      <option value="Tomato">Tomato</option>
                      <option value="Sugarcane">Sugarcane</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Soil Type</label>
                    <select
                      value={cropHealthForm.soilType}
                      onChange={(e) => setCropHealthForm({ ...cropHealthForm, soilType: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                    >
                      <option value="Clay">Clay</option>
                      <option value="Loam">Loam</option>
                      <option value="Clay Loam">Clay Loam</option>
                      <option value="Sandy Loam">Sandy Loam</option>
                      <option value="Alluvial">Alluvial</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Moisture (%)</label>
                    <input
                      type="number"
                      value={cropHealthForm.moisture}
                      onChange={(e) =>
                        setCropHealthForm({ ...cropHealthForm, moisture: parseFloat(e.target.value) })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Temp (°C)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={cropHealthForm.temperature}
                      onChange={(e) =>
                        setCropHealthForm({ ...cropHealthForm, temperature: parseFloat(e.target.value) })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Rain (mm)</label>
                    <input
                      type="number"
                      value={cropHealthForm.rainfall}
                      onChange={(e) =>
                        setCropHealthForm({ ...cropHealthForm, rainfall: parseFloat(e.target.value) })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Growth Stage</label>
                    <select
                      value={cropHealthForm.growthStage}
                      onChange={(e) => setCropHealthForm({ ...cropHealthForm, growthStage: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                    >
                      <option value="Germination">Germination</option>
                      <option value="Vegetative">Vegetative</option>
                      <option value="Tillering">Tillering</option>
                      <option value="Flowering">Flowering</option>
                      <option value="Fruiting">Fruiting</option>
                      <option value="Grain Formation">Grain Formation</option>
                      <option value="Maturity">Maturity</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Historical Health Index</label>
                    <input
                      type="number"
                      value={cropHealthForm.historicalCropHealth}
                      onChange={(e) =>
                        setCropHealthForm({ ...cropHealthForm, historicalCropHealth: parseFloat(e.target.value) })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 3. Yield Form */}
            {activeTab === 'yield' && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-800 text-sm">Yield Prediction Inputs</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Crop</label>
                    <select
                      value={yieldForm.crop}
                      onChange={(e) => setYieldForm({ ...yieldForm, crop: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                    >
                      <option value="Rice">Rice</option>
                      <option value="Wheat">Wheat</option>
                      <option value="Maize">Maize</option>
                      <option value="Tomato">Tomato</option>
                      <option value="Sugarcane">Sugarcane</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Area (Acres)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={yieldForm.area}
                      onChange={(e) => setYieldForm({ ...yieldForm, area: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Soil Type</label>
                    <select
                      value={yieldForm.soilType}
                      onChange={(e) => setYieldForm({ ...yieldForm, soilType: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                    >
                      <option value="Clay">Clay</option>
                      <option value="Loam">Loam</option>
                      <option value="Clay Loam">Clay Loam</option>
                      <option value="Sandy Loam">Sandy Loam</option>
                      <option value="Alluvial">Alluvial</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Crop Health Score</label>
                    <input
                      type="number"
                      value={yieldForm.cropHealth}
                      onChange={(e) => setYieldForm({ ...yieldForm, cropHealth: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 4. Electricity Form */}
            {activeTab === 'electricity' && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-800 text-sm">Electricity Prediction Inputs</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Previous 24h Consumption (kWh)</label>
                    <input
                      type="number"
                      value={electricityForm.previousConsumption}
                      onChange={(e) =>
                        setElectricityForm({ ...electricityForm, previousConsumption: parseFloat(e.target.value) })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Season</label>
                    <select
                      value={electricityForm.season}
                      onChange={(e) => setElectricityForm({ ...electricityForm, season: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                    >
                      <option value="Summer">Summer</option>
                      <option value="Monsoon">Monsoon</option>
                      <option value="Winter">Winter</option>
                      <option value="Post-Monsoon">Post-Monsoon</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Temperature (°C)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={electricityForm.temperature}
                      onChange={(e) =>
                        setElectricityForm({ ...electricityForm, temperature: parseFloat(e.target.value) })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Historical Peak Demand (kW)</label>
                    <input
                      type="number"
                      value={electricityForm.historicalPeakDemand}
                      onChange={(e) =>
                        setElectricityForm({ ...electricityForm, historicalPeakDemand: parseFloat(e.target.value) })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 5. Risk Form */}
            {activeTab === 'risk' && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-800 text-sm">Composite Village Risk Inputs</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Water Avail. Ratio (0-1.0)</label>
                    <input
                      type="number"
                      step="0.05"
                      value={riskForm.waterAvailabilityRatio}
                      onChange={(e) =>
                        setRiskForm({ ...riskForm, waterAvailabilityRatio: parseFloat(e.target.value) })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Water Demand Multiplier</label>
                    <input
                      type="number"
                      step="0.05"
                      value={riskForm.waterDemandRatio}
                      onChange={(e) =>
                        setRiskForm({ ...riskForm, waterDemandRatio: parseFloat(e.target.value) })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Average Crop Health (%)</label>
                    <input
                      type="number"
                      value={riskForm.averageCropHealth}
                      onChange={(e) =>
                        setRiskForm({ ...riskForm, averageCropHealth: parseFloat(e.target.value) })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Rainfall Deficit (%)</label>
                    <input
                      type="number"
                      value={riskForm.rainfallDeficit}
                      onChange={(e) =>
                        setRiskForm({ ...riskForm, rainfallDeficit: parseFloat(e.target.value) })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-xs transition"
            >
              <Cpu className="w-4 h-4" />
              {loading ? 'Executing ML Inference...' : 'Run Machine Learning Model'}
            </button>
          </form>
        </div>

        {/* Prediction Results Display (1 Col) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 text-base">Prediction Output</h3>
              {result?.riskLevel && <RiskBadge level={result.riskLevel} size="sm" />}
            </div>

            {result ? (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Water Results */}
                {result.predictedDemand && result.unit === 'litres/day' && (
                  <div className="space-y-3">
                    <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 text-center">
                      <span className="text-slate-500 text-xs font-medium block">
                        Predicted Daily Demand
                      </span>
                      <strong className="text-2xl text-blue-900 block mt-1">
                        {result.predictedDemand.toLocaleString()} {result.unit}
                      </strong>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                      {result.explanation}
                    </p>
                  </div>
                )}

                {/* Crop Health Results */}
                {result.cropHealth !== undefined && result.status && (
                  <div className="space-y-3">
                    <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100 text-center">
                      <span className="text-slate-500 text-xs font-medium block">
                        Crop Health Score
                      </span>
                      <strong className="text-3xl text-emerald-900 block mt-1">
                        {result.cropHealth}%
                      </strong>
                      <span className="text-xs font-bold text-emerald-700 uppercase mt-1 inline-block">
                        Status: {result.status}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                      <span className="font-semibold text-slate-700 block">Stress Factors:</span>
                      {result.stressFactors?.map((f, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-slate-600">
                          <span className="text-emerald-600 mt-0.5">•</span>
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Yield Results */}
                {result.predictedYield !== undefined && result.unit === 'tons' && (
                  <div className="space-y-3">
                    <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-100 text-center">
                      <span className="text-slate-500 text-xs font-medium block">
                        Predicted Harvest Yield
                      </span>
                      <strong className="text-3xl text-teal-900 block mt-1">
                        {result.predictedYield} Tons
                      </strong>
                      <span className="text-xs text-slate-500 block mt-1">
                        Yield per Acre: {result.yieldPerAcre} Tons
                      </span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between">
                      <span className="text-slate-500">Confidence Metric:</span>
                      <strong className="text-slate-800">
                        {(result.confidence * 100).toFixed(0)}% Confidence
                      </strong>
                    </div>
                  </div>
                )}

                {/* Electricity Results */}
                {result.predictedDemand && result.unit === 'kWh' && (
                  <div className="space-y-3">
                    <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-100 text-center">
                      <span className="text-slate-500 text-xs font-medium block">
                        Projected Grid Consumption
                      </span>
                      <strong className="text-3xl text-amber-900 block mt-1">
                        {result.predictedDemand.toLocaleString()} {result.unit}
                      </strong>
                      <span className="text-xs text-rose-600 font-semibold block mt-1">
                        Estimated Peak Load: {result.peakDemand} kW
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                      {result.explanation}
                    </p>
                  </div>
                )}

                {/* Composite Risk Results */}
                {result.riskScore !== undefined && result.factors && (
                  <div className="space-y-3">
                    <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-100 text-center">
                      <span className="text-slate-500 text-xs font-medium block">
                        Composite Risk Index
                      </span>
                      <strong className="text-3xl text-rose-900 block mt-1">
                        {result.riskScore}/100
                      </strong>
                      <span className="text-xs font-bold text-rose-700 uppercase mt-1 inline-block">
                        Level: {result.riskLevel}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                      <span className="font-semibold text-slate-700 block">Risk Breakdown:</span>
                      <div className="flex justify-between">
                        <span>Water Risk:</span> <strong>{result.factors.water_risk}%</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Crop Risk:</span> <strong>{result.factors.crop_risk}%</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Electricity Stress:</span> <strong>{result.factors.electricity_risk}%</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Weather Extremes:</span> <strong>{result.factors.weather_risk}%</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-center text-slate-400 text-xs p-4">
                <Cpu className="w-8 h-8 mb-2 opacity-50" />
                <p>No Prediction Executed Yet</p>
                <p className="text-[11px] mt-1 text-slate-400">
                  Select parameters on the left and click "Run Machine Learning Model".
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 text-center">
            Zero Hardware Telemetry • Python Scikit-Learn Engine
          </div>
        </div>
      </div>
    </div>
  );
}
