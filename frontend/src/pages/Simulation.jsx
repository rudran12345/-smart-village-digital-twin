import React, { useState } from 'react';
import { apiService } from '../services/api';
import SimulationPanel from '../components/SimulationPanel';
import RiskBadge from '../components/RiskBadge';
import ChartCard from '../components/ChartCard';
import {
  Sliders,
  Droplet,
  Sprout,
  Zap,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from 'recharts';

export default function Simulation() {
  const [params, setParams] = useState({
    waterReductionPct: 20.0,
    temperatureDeltaC: 2.5,
    rainfallDeltaPct: -30.0,
    irrigationChangePct: -15.0,
    electricityDemandChangePct: 15.0,
  });

  const [loading, setLoading] = useState(false);
  const [simulationResult, setSimulationResult] = useState({
    scenarioName: 'What-If: Water -20%, Temp +2.5°C, Rain -30%',
    currentState: {
      waterAvailability: 72000,
      waterDemand: 8500,
      waterShortageRisk: 'Low',
      cropHealth: 84.0,
      cropYieldTons: 4.8,
      cropRisk: 'Low',
      electricityDemand: 4200,
      electricityPeak: 580,
      electricityRisk: 'Low',
      overallRiskScore: 24.5,
      overallRiskLevel: 'LOW',
    },
    simulatedState: {
      waterAvailability: 57600,
      waterDemand: 9800,
      waterShortageRisk: 'Medium',
      cropHealth: 71.5,
      cropYieldTons: 4.05,
      cropRisk: 'Medium',
      electricityDemand: 4830,
      electricityPeak: 665,
      electricityRisk: 'High',
      overallRiskScore: 58.2,
      overallRiskLevel: 'MEDIUM',
    },
    changes: {
      waterAvailabilityDeltaPct: -20,
      cropHealthDelta: -12.5,
      cropYieldDeltaTons: -0.75,
      riskScoreDelta: 33.7,
      electricityDemandDeltaPct: 15,
    },
    recommendations: [
      'Rotational canal gating advised: shift irrigation to nocturnal cycles to reduce 18% evaporation loss.',
      'Apply protective organic mulching to Field B (Tomato) and Paddy to prevent terminal heat stress.',
      'Stagger agricultural tube well loads into off-peak windows (11:00 PM - 05:00 AM) to prevent 665 kW transformer overload.',
    ],
    alerts: [
      'Water storage projected to drop from 72,000 L to 57,600 L.',
      'Crop health stress warning: projected yield dropping from 4.8t to 4.05t.',
      'Central transformer peak surge projected at 665 kW (rated capacity 600 kW).',
    ],
  });

  const handleResetParams = () => {
    setParams({
      waterReductionPct: 0.0,
      temperatureDeltaC: 0.0,
      rainfallDeltaPct: 0.0,
      irrigationChangePct: 0.0,
      electricityDemandChangePct: 0.0,
    });
  };

  const handleRunSimulation = async () => {
    setLoading(true);
    try {
      const res = await apiService.runSimulation(params);
      setSimulationResult(res.data);
    } catch (e) {
      console.error('Simulation execution failed:', e);
    } finally {
      setLoading(false);
    }
  };

  // Comparative Chart Data
  const comparativeChartData = [
    {
      metric: 'Crop Health (%)',
      Current: simulationResult.currentState.cropHealth,
      Simulated: simulationResult.simulatedState.cropHealth,
    },
    {
      metric: 'Yield (Tons x10)',
      Current: simulationResult.currentState.cropYieldTons * 10,
      Simulated: simulationResult.simulatedState.cropYieldTons * 10,
    },
    {
      metric: 'Risk Score (/100)',
      Current: simulationResult.currentState.overallRiskScore,
      Simulated: simulationResult.simulatedState.overallRiskScore,
    },
    {
      metric: 'Peak Load (kW /10)',
      Current: simulationResult.currentState.electricityPeak / 10,
      Simulated: simulationResult.simulatedState.electricityPeak / 10,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Sliders className="w-6 h-6 text-teal-600" />
          Digital Twin What-If Simulation Laboratory
        </h1>
        <p className="text-xs text-slate-500">
          Hypothetical virtual scenario modeling for water availability cuts, climate anomalies, and peak load shifting.
        </p>
      </div>

      {/* Main Grid: Control Panel (1 Col) & Side-by-Side Results (2 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-1">
          <SimulationPanel
            params={params}
            onChange={(newParams) => setParams(newParams)}
            onRun={handleRunSimulation}
            onReset={handleResetParams}
            loading={loading}
          />
        </div>

        {/* Results & Comparison Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Side-by-Side State Comparison Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* CURRENT STATE CARD */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs relative overflow-hidden">
              <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Baseline Baseline
                  </span>
                  <h3 className="font-extrabold text-slate-900 text-lg">CURRENT STATE</h3>
                </div>
                <RiskBadge
                  level={simulationResult.currentState.overallRiskLevel}
                  score={simulationResult.currentState.overallRiskScore}
                />
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between p-2.5 rounded-xl bg-slate-50">
                  <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                    <Droplet className="w-4 h-4 text-blue-500" /> Available Water
                  </span>
                  <strong className="text-slate-800 text-sm">
                    {simulationResult.currentState.waterAvailability.toLocaleString()} L
                  </strong>
                </div>

                <div className="flex justify-between p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
                  <span className="text-emerald-800 flex items-center gap-1.5 font-medium">
                    <Sprout className="w-4 h-4 text-emerald-600" /> Crop Health
                  </span>
                  <strong className="text-emerald-900 text-sm">
                    {simulationResult.currentState.cropHealth}%
                  </strong>
                </div>

                <div className="flex justify-between p-2.5 rounded-xl bg-teal-50/60 border border-teal-100">
                  <span className="text-teal-800 flex items-center gap-1.5 font-medium">
                    <TrendingUp className="w-4 h-4 text-teal-600" /> Projected Yield
                  </span>
                  <strong className="text-teal-900 text-sm">
                    {simulationResult.currentState.cropYieldTons} Tons
                  </strong>
                </div>

                <div className="flex justify-between p-2.5 rounded-xl bg-amber-50/60 border border-amber-100">
                  <span className="text-amber-800 flex items-center gap-1.5 font-medium">
                    <Zap className="w-4 h-4 text-amber-500" /> Peak Electricity
                  </span>
                  <strong className="text-amber-900 text-sm">
                    {simulationResult.currentState.electricityPeak} kW
                  </strong>
                </div>
              </div>
            </div>

            {/* SIMULATED STATE CARD */}
            <div className="bg-white rounded-2xl border-2 border-emerald-500/30 p-5 shadow-xs relative overflow-hidden bg-gradient-to-br from-white to-slate-50/80">
              <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">
                    Virtual What-If Output
                  </span>
                  <h3 className="font-extrabold text-slate-900 text-lg">SIMULATED STATE</h3>
                </div>
                <RiskBadge
                  level={simulationResult.simulatedState.overallRiskLevel}
                  score={simulationResult.simulatedState.overallRiskScore}
                />
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between p-2.5 rounded-xl bg-slate-50">
                  <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                    <Droplet className="w-4 h-4 text-blue-500" /> Available Water
                  </span>
                  <div className="text-right">
                    <strong className="text-slate-800 text-sm block">
                      {simulationResult.simulatedState.waterAvailability.toLocaleString()} L
                    </strong>
                    <span className="text-[10px] text-rose-600 font-semibold">
                      ({params.waterReductionPct > 0 ? `-${params.waterReductionPct}%` : '0%'})
                    </span>
                  </div>
                </div>

                <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-700 flex items-center gap-1.5 font-medium">
                    <Sprout className="w-4 h-4 text-emerald-600" /> Crop Health
                  </span>
                  <div className="text-right">
                    <strong
                      className={`text-sm block ${
                        simulationResult.simulatedState.cropHealth <
                        simulationResult.currentState.cropHealth
                          ? 'text-rose-600'
                          : 'text-emerald-700'
                      }`}
                    >
                      {simulationResult.simulatedState.cropHealth}%
                    </strong>
                    <span className="text-[10px] text-slate-500">
                      Δ {simulationResult.changes?.cropHealthDelta || 0}%
                    </span>
                  </div>
                </div>

                <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-700 flex items-center gap-1.5 font-medium">
                    <TrendingUp className="w-4 h-4 text-teal-600" /> Projected Yield
                  </span>
                  <div className="text-right">
                    <strong className="text-slate-900 text-sm block">
                      {simulationResult.simulatedState.cropYieldTons} Tons
                    </strong>
                    <span className="text-[10px] text-slate-500">
                      Δ {simulationResult.changes?.cropYieldDeltaTons || 0} t
                    </span>
                  </div>
                </div>

                <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-700 flex items-center gap-1.5 font-medium">
                    <Zap className="w-4 h-4 text-amber-500" /> Peak Electricity
                  </span>
                  <div className="text-right">
                    <strong className="text-amber-700 text-sm block">
                      {simulationResult.simulatedState.electricityPeak} kW
                    </strong>
                    <span className="text-[10px] text-slate-500">
                      Rated threshold: 600 kW
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Comparative Bar Chart */}
          <ChartCard
            title="Current vs Simulated State Comparison"
            subtitle="Side-by-side indicator deltas under simulated climate and resource stress"
          >
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={comparativeChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="metric" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="Current" fill="#0284c7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Simulated" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Simulation Actionable Recommendations */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              Dynamic AI Recommendations Under Scenario
            </h3>
            <div className="space-y-2">
              {simulationResult.recommendations?.map((rec, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/50 border border-amber-200/60 text-xs text-slate-800"
                >
                  <CheckCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
