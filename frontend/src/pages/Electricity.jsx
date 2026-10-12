import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import StatCard from '../components/StatCard';
import RiskBadge from '../components/RiskBadge';
import ChartCard from '../components/ChartCard';
import Modal from '../components/Modal';
import { Zap, Plus, AlertTriangle, TrendingUp, Cpu, Activity } from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export default function Electricity() {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    date: '2026-10-12',
    consumption: 4200.0,
    peakDemand: 580.0,
    averageDemand: 175.0,
    predictedDemand: 4500.0,
    riskLevel: 'Medium',
    nodeName: 'Village Central Transformer',
  });

  useEffect(() => {
    loadElectricityData();
  }, []);

  const loadElectricityData = async () => {
    try {
      setLoading(true);
      const [recRes, sumRes] = await Promise.all([
        apiService.getElectricityRecords(),
        apiService.getElectricitySummary(),
      ]);
      setRecords(recRes.data);
      setSummary(sumRes.data);
    } catch (e) {
      console.error('Failed to load electricity data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleManualEntry = async (e) => {
    e.preventDefault();
    try {
      await apiService.createElectricityRecord(formData);
      setIsModalOpen(false);
      loadElectricityData();
    } catch (e) {
      console.error('Failed to create electricity record:', e);
    }
  };

  const dailyUsageData = [
    { time: '02:00', load: 85, peak: 95 },
    { time: '06:00', load: 380, peak: 420 },
    { time: '10:00', load: 460, peak: 510 },
    { time: '14:00', load: 390, peak: 450 },
    { time: '18:00', load: 560, peak: 580 },
    { time: '22:00', load: 320, peak: 350 },
  ];

  const weeklyTrendData = [
    { day: 'Mon', actual: 3950, predicted: 4100 },
    { day: 'Tue', actual: 4020, predicted: 4150 },
    { day: 'Wed', actual: 4110, predicted: 4200 },
    { day: 'Thu', actual: 4280, predicted: 4350 },
    { day: 'Fri', actual: 4390, predicted: 4450 },
    { day: 'Sat', actual: 4480, predicted: 4500 },
    { day: 'Today', actual: 4200, predicted: 4500 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Zap className="w-6 h-6 text-amber-500" />
            Village Electricity & Grid Telemetry
          </h1>
          <p className="text-xs text-slate-500">
            Transformer loads, irrigation pump feeders, and peak surge forecasts (No IoT).
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold shadow-xs transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Electricity Record
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        <StatCard
          title="Current Usage"
          value={`${summary?.currentUsage?.toLocaleString() || '4,200'} kWh`}
          subvalue="24h Cumulative Draw"
          icon={Activity}
          color="amber"
        />
        <StatCard
          title="Average Usage"
          value={`${summary?.averageUsage?.toLocaleString() || '4,100'} kWh`}
          subvalue="Baseline Load"
          icon={TrendingUp}
          color="blue"
        />
        <StatCard
          title="Peak Demand"
          value={`${summary?.peakDemand || 580} kW`}
          subvalue="Rated: 600 kW Safe"
          icon={Zap}
          color="rose"
        />
        <StatCard
          title="Predicted Demand"
          value={`${summary?.predictedDemand?.toLocaleString() || '4,500'} kWh`}
          subvalue="ML Daily Forecast"
          icon={Cpu}
          color="purple"
        />
        <StatCard
          title="Grid Risk"
          value={summary?.riskLevel || 'Medium'}
          subvalue="Transformer Headroom"
          icon={AlertTriangle}
          color="amber"
          badge={<RiskBadge level={summary?.riskLevel || 'Medium'} size="sm" />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Diurnal Load Curve & Surge Spikes (kW)"
          subtitle="Showing heavy irrigation pump window during morning & evening"
        >
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={dailyUsageData}>
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Line type="monotone" dataKey="load" stroke="#f59e0b" strokeWidth={2} name="Baseline Load (kW)" />
              <Line type="monotone" dataKey="peak" stroke="#e11d48" strokeWidth={2} strokeDasharray="4 4" name="Peak Surge (kW)" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Weekly Actual vs AI Predicted Energy Demand (kWh)"
          subtitle="7-day demand trend with temperature-driven cooling adjustment"
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={weeklyTrendData}>
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="actual" fill="#64748b" name="Historical kWh" radius={[4, 4, 0, 0]} />
              <Bar dataKey="predicted" fill="#f59e0b" name="AI Projected kWh" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Grid Nodes Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <h3 className="font-bold text-base text-slate-900">
          Village Electricity Infrastructure & Transformers
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
              <tr>
                <th className="p-3">Infrastructure Node</th>
                <th className="p-3">Date</th>
                <th className="p-3">Daily Consumption</th>
                <th className="p-3">Peak Demand</th>
                <th className="p-3">Predicted Demand</th>
                <th className="p-3">Risk Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map((r) => (
                <tr key={r.recordId} className="hover:bg-slate-50/70 transition">
                  <td className="p-3 font-semibold text-slate-900 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-500" />
                    {r.nodeName || 'Central Grid Node'}
                  </td>
                  <td className="p-3">{r.date}</td>
                  <td className="p-3 font-bold text-slate-800">{r.consumption?.toLocaleString()} kWh</td>
                  <td className="p-3 text-rose-600 font-semibold">{r.peakDemand} kW</td>
                  <td className="p-3 text-amber-700 font-semibold">{r.predictedDemand?.toLocaleString()} kWh</td>
                  <td className="p-3">
                    <RiskBadge level={r.riskLevel} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Entry Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Electricity Record (Manual Entry)"
      >
        <form onSubmit={handleManualEntry} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Grid Node / Transformer Name
            </label>
            <input
              type="text"
              required
              value={formData.nodeName}
              onChange={(e) => setFormData({ ...formData, nodeName: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Daily Usage (kWh)</label>
              <input
                type="number"
                required
                value={formData.consumption}
                onChange={(e) => setFormData({ ...formData, consumption: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Peak Demand (kW)</label>
              <input
                type="number"
                required
                value={formData.peakDemand}
                onChange={(e) => setFormData({ ...formData, peakDemand: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Average Demand (kW)</label>
              <input
                type="number"
                value={formData.averageDemand}
                onChange={(e) => setFormData({ ...formData, averageDemand: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-xs transition"
            >
              Save Record
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
