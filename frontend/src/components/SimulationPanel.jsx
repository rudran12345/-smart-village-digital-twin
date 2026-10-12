import React from 'react';
import { Play, RotateCcw, Sliders, Droplet, Sun, CloudRain, Zap } from 'lucide-react';

export default function SimulationPanel({
  params,
  onChange,
  onRun,
  onReset,
  loading = false,
}) {
  const updateParam = (key, value) => {
    onChange({ ...params, [key]: parseFloat(value) });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-slate-800 text-base">What-If Virtual Parameters</h3>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 transition px-2 py-1 rounded hover:bg-slate-100"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>

      {/* 1. Water Reduction */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5 text-slate-700 font-medium">
            <Droplet className="w-4 h-4 text-blue-500" /> Water Availability Cut
          </span>
          <span className="font-bold text-rose-600">
            {params.waterReductionPct > 0 ? `-${params.waterReductionPct}%` : '0%'}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="50"
          step="5"
          value={params.waterReductionPct}
          onChange={(e) => updateParam('waterReductionPct', e.target.value)}
          className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-[11px] text-slate-400">
          <span>0% (Normal)</span>
          <span>-25% (Drought)</span>
          <span>-50% (Severe)</span>
        </div>
      </div>

      {/* 2. Temperature Delta */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5 text-slate-700 font-medium">
            <Sun className="w-4 h-4 text-amber-500" /> Temperature Shift
          </span>
          <span className="font-bold text-amber-600">
            {params.temperatureDeltaC > 0
              ? `+${params.temperatureDeltaC}°C`
              : `${params.temperatureDeltaC}°C`}
          </span>
        </div>
        <input
          type="range"
          min="-5"
          max="5"
          step="0.5"
          value={params.temperatureDeltaC}
          onChange={(e) => updateParam('temperatureDeltaC', e.target.value)}
          className="w-full accent-amber-500 h-2 bg-slate-200 rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-[11px] text-slate-400">
          <span>-5°C (Cooler)</span>
          <span>0°C (Baseline)</span>
          <span>+5°C (Heatwave)</span>
        </div>
      </div>

      {/* 3. Rainfall Change */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5 text-slate-700 font-medium">
            <CloudRain className="w-4 h-4 text-indigo-500" /> Rainfall Variation
          </span>
          <span
            className={`font-bold ${
              params.rainfallDeltaPct < 0 ? 'text-rose-600' : 'text-emerald-600'
            }`}
          >
            {params.rainfallDeltaPct > 0
              ? `+${params.rainfallDeltaPct}%`
              : `${params.rainfallDeltaPct}%`}
          </span>
        </div>
        <input
          type="range"
          min="-50"
          max="50"
          step="5"
          value={params.rainfallDeltaPct}
          onChange={(e) => updateParam('rainfallDeltaPct', e.target.value)}
          className="w-full accent-indigo-500 h-2 bg-slate-200 rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-[11px] text-slate-400">
          <span>-50% (Monsoon Failure)</span>
          <span>0%</span>
          <span>+50% (Excess Inflow)</span>
        </div>
      </div>

      {/* 4. Irrigation Change */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5 text-slate-700 font-medium">
            <Droplet className="w-4 h-4 text-teal-500" /> Irrigation Allocation
          </span>
          <span
            className={`font-bold ${
              params.irrigationChangePct < 0 ? 'text-amber-600' : 'text-teal-600'
            }`}
          >
            {params.irrigationChangePct > 0
              ? `+${params.irrigationChangePct}%`
              : `${params.irrigationChangePct}%`}
          </span>
        </div>
        <input
          type="range"
          min="-50"
          max="50"
          step="5"
          value={params.irrigationChangePct}
          onChange={(e) => updateParam('irrigationChangePct', e.target.value)}
          className="w-full accent-teal-500 h-2 bg-slate-200 rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-[11px] text-slate-400">
          <span>-50% (Rationing)</span>
          <span>0%</span>
          <span>+50% (Intensive)</span>
        </div>
      </div>

      {/* 5. Electricity Demand Change */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5 text-slate-700 font-medium">
            <Zap className="w-4 h-4 text-yellow-500" /> Power Grid Load Shift
          </span>
          <span
            className={`font-bold ${
              params.electricityDemandChangePct > 0 ? 'text-amber-600' : 'text-emerald-600'
            }`}
          >
            {params.electricityDemandChangePct > 0
              ? `+${params.electricityDemandChangePct}%`
              : `${params.electricityDemandChangePct}%`}
          </span>
        </div>
        <input
          type="range"
          min="-20"
          max="50"
          step="5"
          value={params.electricityDemandChangePct}
          onChange={(e) => updateParam('electricityDemandChangePct', e.target.value)}
          className="w-full accent-yellow-500 h-2 bg-slate-200 rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-[11px] text-slate-400">
          <span>-20% (Conservation)</span>
          <span>0%</span>
          <span>+50% (Heavy Pumping)</span>
        </div>
      </div>

      <button
        onClick={onRun}
        disabled={loading}
        className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm transition"
      >
        <Play className="w-4 h-4 fill-current" />
        {loading ? 'Simulating Digital Twin...' : 'Execute What-If Simulation'}
      </button>
    </div>
  );
}
