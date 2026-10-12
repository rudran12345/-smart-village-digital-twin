import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import StatCard from '../components/StatCard';
import RiskBadge from '../components/RiskBadge';
import ChartCard from '../components/ChartCard';
import Modal from '../components/Modal';
import {
  Droplet,
  Plus,
  AlertTriangle,
  TrendingDown,
  Waves,
  MapPin,
  Calendar,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export default function Water() {
  const [resources, setResources] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'Water Tank',
    capacity: 100000.0,
    currentLevel: 72000.0,
    dailyUsage: 8500.0,
    location: 'Central Storage',
  });

  useEffect(() => {
    loadWaterData();
  }, []);

  const loadWaterData = async () => {
    try {
      setLoading(true);
      const [resList, sumRes] = await Promise.all([
        apiService.getWaterResources(),
        apiService.getWaterSummary(),
      ]);
      setResources(resList.data);
      setSummary(sumRes.data);
    } catch (e) {
      console.error('Failed to load water data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleManualEntry = async (e) => {
    e.preventDefault();
    try {
      await apiService.createWaterResource(formData);
      setIsModalOpen(false);
      loadWaterData();
    } catch (e) {
      console.error('Failed to create water node:', e);
    }
  };

  const chartData = [
    { day: 'Day 1', available: 78000, consumption: 8200, predictedDemand: 8500 },
    { day: 'Day 2', available: 77500, consumption: 8400, predictedDemand: 8600 },
    { day: 'Day 3', available: 76200, consumption: 8600, predictedDemand: 8800 },
    { day: 'Day 4', available: 74800, consumption: 8900, predictedDemand: 9100 },
    { day: 'Day 5', available: 73200, consumption: 9200, predictedDemand: 9400 },
    { day: 'Day 6', available: 71500, consumption: 9500, predictedDemand: 9600 },
    { day: 'Today', available: 72000, consumption: 8500, predictedDemand: 9200 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Droplet className="w-6 h-6 text-blue-600" />
            Water Resource Management & Demand Forecasting
          </h1>
          <p className="text-xs text-slate-500">
            Village storage balance, agricultural irrigation draw, and shortage risk (No IoT).
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Manual Water Entry
        </button>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        <StatCard
          title="Total Capacity"
          value={`${((summary?.totalCapacity || 500000) / 1000).toFixed(0)}k L`}
          subvalue="Village Max Reservoir"
          icon={Waves}
          color="blue"
        />
        <StatCard
          title="Available Water"
          value={`${((summary?.currentAvailable || 374000) / 1000).toFixed(0)}k L`}
          subvalue="Current Holding"
          icon={Droplet}
          color="emerald"
        />
        <StatCard
          title="Water Avail. %"
          value={`${summary?.availabilityPercentage || 74.8}%`}
          subvalue="Storage Buffer"
          icon={Droplet}
          color="blue"
        />
        <StatCard
          title="Daily Usage"
          value={`${((summary?.totalDailyUsage || 29700) / 1000).toFixed(1)}k L/d`}
          subvalue="Combined Rural Draw"
          icon={TrendingDown}
          color="amber"
        />
        <StatCard
          title="Predicted Demand"
          value={`${((summary?.totalPredictedDemand || 33200) / 1000).toFixed(1)}k L/d`}
          subvalue="AI Projected"
          icon={Waves}
          color="purple"
        />
        <StatCard
          title="Shortage Risk"
          value={`${summary?.shortageProbability || 31}%`}
          subvalue={summary?.overallWaterRisk || 'Medium'}
          icon={AlertTriangle}
          color={summary?.overallWaterRisk === 'High' ? 'rose' : 'amber'}
          badge={<RiskBadge level={summary?.overallWaterRisk || 'Medium'} size="sm" />}
        />
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Water Storage Availability Trend"
          subtitle="Holding depth across village reservoirs (Litres)"
        >
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData}>
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip />
              <Area type="monotone" dataKey="available" stroke="#0284c7" fill="#38bdf8" fillOpacity={0.25} name="Available Water (L)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Daily Consumption vs AI Predicted Demand"
          subtitle="Model forecasting based on temperature & crop evapotranspiration"
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData}>
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="consumption" fill="#64748b" name="Recorded Usage (L)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="predictedDemand" fill="#0284c7" name="AI Predicted Demand (L)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Village Water Nodes Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <h3 className="font-bold text-base text-slate-900">
          Village Water Resources & Storage Units
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
              <tr>
                <th className="p-3">Resource Name</th>
                <th className="p-3">Type</th>
                <th className="p-3">Capacity</th>
                <th className="p-3">Current Level</th>
                <th className="p-3">Daily Draw</th>
                <th className="p-3">Predicted Demand</th>
                <th className="p-3">Risk Level</th>
                <th className="p-3">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {resources.map((w) => (
                <tr key={w.resourceId} className="hover:bg-slate-50/70 transition">
                  <td className="p-3 font-semibold text-slate-900 flex items-center gap-1.5">
                    <Droplet className="w-4 h-4 text-blue-500" />
                    {w.name}
                  </td>
                  <td className="p-3">{w.type}</td>
                  <td className="p-3">{w.capacity?.toLocaleString()} L</td>
                  <td className="p-3 font-bold text-slate-800">
                    {w.currentLevel?.toLocaleString()} L
                    <span className="text-[10px] text-slate-400 block font-normal">
                      {((w.currentLevel / w.capacity) * 100).toFixed(0)}% full
                    </span>
                  </td>
                  <td className="p-3">{w.dailyUsage?.toLocaleString()} L/d</td>
                  <td className="p-3 text-blue-700 font-semibold">
                    {w.predictedDemand?.toLocaleString()} L/d
                  </td>
                  <td className="p-3">
                    <RiskBadge level={w.riskLevel} size="sm" />
                  </td>
                  <td className="p-3 text-slate-400">{w.location}</td>
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
        title="Add Water Resource (Manual / Dataset Entry)"
      >
        <form onSubmit={handleManualEntry} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Resource Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. West Canal Tank"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="Water Tank">Water Tank</option>
                <option value="Reservoir">Reservoir</option>
                <option value="Overhead Tank">Overhead Tank</option>
                <option value="Borewell Network">Borewell Network</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Sector 3"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Capacity (L)</label>
              <input
                type="number"
                required
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Current (L)</label>
              <input
                type="number"
                required
                value={formData.currentLevel}
                onChange={(e) => setFormData({ ...formData, currentLevel: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Daily Usage (L)</label>
              <input
                type="number"
                required
                value={formData.dailyUsage}
                onChange={(e) => setFormData({ ...formData, dailyUsage: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
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
              className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition"
            >
              Save Water Resource
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
