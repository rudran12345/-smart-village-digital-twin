import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import DigitalTwinMap from '../components/DigitalTwinMap';
import RiskBadge from '../components/RiskBadge';
import {
  Layers,
  Droplet,
  Zap,
  Sprout,
  Home,
  Filter,
  Info,
  Maximize2,
  TrendingUp,
  Cpu,
} from 'lucide-react';

export default function VillageTwin() {
  const [loading, setLoading] = useState(true);
  const [fields, setFields] = useState([]);
  const [farms, setFarms] = useState([]);
  const [waterResources, setWaterResources] = useState([]);
  const [electricityNodes, setElectricityNodes] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);

  const [activeLayers, setActiveLayers] = useState({
    fields: true,
    water: true,
    electricity: true,
    farms: true,
  });

  const [riskFilter, setRiskFilter] = useState('ALL'); // ALL, HIGH, MEDIUM, LOW

  useEffect(() => {
    loadTwinData();
  }, []);

  const loadTwinData = async () => {
    try {
      setLoading(true);
      const [fldRes, fRes, wRes, eRes] = await Promise.all([
        apiService.getFields(),
        apiService.getFarms(),
        apiService.getWaterResources(),
        apiService.getElectricityRecords(),
      ]);
      setFields(fldRes.data);
      setFarms(fRes.data);
      setWaterResources(wRes.data);
      setElectricityNodes(eRes.data);
      // Select first field as default inspect target
      if (fldRes.data.length > 0) {
        setSelectedElement({ type: 'field', data: fldRes.data[0] });
      }
    } catch (e) {
      console.error('Failed to load twin data:', e);
    } finally {
      setLoading(false);
    }
  };

  const toggleLayer = (layer) => {
    setActiveLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  };

  const filteredFields = fields.filter((f) => {
    if (riskFilter === 'ALL') return true;
    return f.riskLevel?.toUpperCase() === riskFilter;
  });

  const filteredWater = waterResources.filter((w) => {
    if (riskFilter === 'ALL') return true;
    return w.riskLevel?.toUpperCase() === riskFilter;
  });

  const filteredElectricity = electricityNodes.filter((e) => {
    if (riskFilter === 'ALL') return true;
    return e.riskLevel?.toUpperCase() === riskFilter;
  });

  return (
    <div className="space-y-4">
      {/* Top Cockpit Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">🗺️</span>
            Village Digital Twin Cockpit
          </h1>
          <p className="text-xs text-slate-500">
            Interactive virtual representation of Green Valley Village natural and municipal infrastructure.
          </p>
        </div>

        {/* Layer Toggles & Risk Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => toggleLayer('fields')}
              className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 font-medium ${
                activeLayers.fields ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500'
              }`}
            >
              <Sprout className="w-3.5 h-3.5" /> Fields
            </button>
            <button
              onClick={() => toggleLayer('water')}
              className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 font-medium ${
                activeLayers.water ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500'
              }`}
            >
              <Droplet className="w-3.5 h-3.5" /> Water
            </button>
            <button
              onClick={() => toggleLayer('electricity')}
              className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 font-medium ${
                activeLayers.electricity ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-500'
              }`}
            >
              <Zap className="w-3.5 h-3.5" /> Power
            </button>
            <button
              onClick={() => toggleLayer('farms')}
              className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 font-medium ${
                activeLayers.farms ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500'
              }`}
            >
              <Home className="w-3.5 h-3.5" /> Farms
            </button>
          </div>

          {/* Risk Level Filter dropdown */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="text-xs font-semibold px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="HIGH">High Risk Only</option>
            <option value="MEDIUM">Medium Risk Only</option>
            <option value="LOW">Low Risk Only</option>
          </select>
        </div>
      </div>

      {/* Main Map + Inspector Split */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-14rem)] min-h-[580px]">
        {/* Map Column (3 cols) */}
        <div className="lg:col-span-3 h-full">
          <DigitalTwinMap
            fields={filteredFields}
            farms={farms}
            waterResources={filteredWater}
            electricityNodes={filteredElectricity}
            activeLayers={activeLayers}
            onSelectElement={(elem) => setSelectedElement(elem)}
          />
        </div>

        {/* Inspector Panel (1 col) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between overflow-y-auto">
          {selectedElement ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Inspecting {selectedElement.type.toUpperCase()}
                  </span>
                  <h3 className="font-extrabold text-base text-slate-900 mt-0.5">
                    {selectedElement.data.fieldName ||
                      selectedElement.data.name ||
                      selectedElement.data.nodeName ||
                      selectedElement.data.farmName}
                  </h3>
                </div>
                <RiskBadge
                  level={selectedElement.data.riskLevel || 'Low'}
                  score={selectedElement.data.riskScore}
                  size="sm"
                />
              </div>

              {/* Field Inspector Details */}
              {selectedElement.type === 'field' && (
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 space-y-1">
                    <span className="text-emerald-800 font-semibold block">Crop Agronomics</span>
                    <p><strong className="text-slate-800">Crop Type:</strong> {selectedElement.data.crop}</p>
                    <p><strong className="text-slate-800">Area:</strong> {selectedElement.data.area} Acres</p>
                    <p><strong className="text-slate-800">Soil:</strong> {selectedElement.data.soilType}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="text-slate-700 font-semibold block">Virtual Telemetry & Agronomics</span>
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span>Crop Health Score</span>
                        <strong className="text-emerald-600">{selectedElement.data.cropHealth}%</strong>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full"
                          style={{ width: `${selectedElement.data.cropHealth}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span>Soil Moisture</span>
                        <strong className="text-blue-600">{selectedElement.data.moisture}%</strong>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-500 h-full rounded-full"
                          style={{ width: `${selectedElement.data.moisture}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 space-y-1">
                    <span className="text-blue-800 font-semibold block">AI Yield Prediction</span>
                    <p>
                      <strong className="text-slate-800">Predicted Yield:</strong>{' '}
                      {(selectedElement.data.area * 1.95).toFixed(1)} Tons
                    </p>
                    <p>
                      <strong className="text-slate-800">Confidence:</strong> 88%
                    </p>
                  </div>
                </div>
              )}

              {/* Water Inspector Details */}
              {selectedElement.type === 'water' && (
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 space-y-1">
                    <span className="text-blue-800 font-semibold block">Storage Capacity</span>
                    <p>
                      <strong className="text-slate-800">Current Volume:</strong>{' '}
                      {selectedElement.data.currentLevel?.toLocaleString()} L
                    </p>
                    <p>
                      <strong className="text-slate-800">Max Capacity:</strong>{' '}
                      {selectedElement.data.capacity?.toLocaleString()} L
                    </p>
                    <p>
                      <strong className="text-slate-800">Availability:</strong>{' '}
                      {((selectedElement.data.currentLevel / selectedElement.data.capacity) * 100).toFixed(1)}%
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-slate-800 font-semibold block">Demand Forecast</span>
                    <p>
                      <strong className="text-slate-800">Daily Consumption:</strong>{' '}
                      {selectedElement.data.dailyUsage?.toLocaleString()} L/day
                    </p>
                    <p>
                      <strong className="text-slate-800">AI Predicted Demand:</strong>{' '}
                      {selectedElement.data.predictedDemand?.toLocaleString()} L/day
                    </p>
                    <p>
                      <strong className="text-slate-800">Location:</strong>{' '}
                      {selectedElement.data.location}
                    </p>
                  </div>
                </div>
              )}

              {/* Electricity Inspector Details */}
              {selectedElement.type === 'electricity' && (
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100 space-y-1">
                    <span className="text-amber-800 font-semibold block">Grid Transformer State</span>
                    <p><strong className="text-slate-800">Current Load:</strong> {selectedElement.data.consumption} kWh</p>
                    <p><strong className="text-slate-800">Peak Demand:</strong> {selectedElement.data.peakDemand} kW</p>
                    <p><strong className="text-slate-800">AI Predicted Demand:</strong> {selectedElement.data.predictedDemand} kWh</p>
                  </div>
                </div>
              )}

              {/* Farm Inspector Details */}
              {selectedElement.type === 'farm' && (
                <div className="space-y-3 text-xs">
                  {selectedElement.data.image && (
                    <img
                      src={selectedElement.data.image}
                      alt={selectedElement.data.farmName}
                      className="w-full h-28 object-cover rounded-xl border border-slate-200"
                    />
                  )}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <p><strong className="text-slate-800">Owner:</strong> {selectedElement.data.farmerName}</p>
                    <p><strong className="text-slate-800">Area:</strong> {selectedElement.data.area} Acres</p>
                    <p><strong className="text-slate-800">Soil:</strong> {selectedElement.data.soilType}</p>
                    <p><strong className="text-slate-800">Sector:</strong> {selectedElement.data.location}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 p-4">
              <Info className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-xs font-semibold">Select Any Map Element</p>
              <p className="text-[11px] mt-1">
                Click a field polygon, water tank, or transformer node to view live digital twin telemetry.
              </p>
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 text-center">
            Cloud-Based Virtual Twin Architecture • Predictive Analytics
          </div>
        </div>
      </div>
    </div>
  );
}
