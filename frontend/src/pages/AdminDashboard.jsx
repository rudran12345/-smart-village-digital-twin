import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import StatCard from '../components/StatCard';
import RiskBadge from '../components/RiskBadge';
import ChartCard from '../components/ChartCard';
import {
  ShieldCheck,
  Users,
  Home,
  Grid,
  Droplet,
  Zap,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function AdminDashboard() {
  const [village, setVillage] = useState(null);
  const [farms, setFarms] = useState([]);
  const [fields, setFields] = useState([]);
  const [crops, setCrops] = useState([]);
  const [waterSummary, setWaterSummary] = useState(null);
  const [electricitySummary, setElectricitySummary] = useState(null);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const [vRes, fRes, fldRes, cRes, wRes, eRes, aRes] = await Promise.all([
        apiService.getVillage('V001'),
        apiService.getFarms(),
        apiService.getFields(),
        apiService.getCrops(),
        apiService.getWaterSummary(),
        apiService.getElectricitySummary(),
        apiService.getAlerts(),
      ]);
      setVillage(vRes.data);
      setFarms(fRes.data);
      setFields(fldRes.data);
      setCrops(cRes.data);
      setWaterSummary(wRes.data);
      setElectricitySummary(eRes.data);
      setAlerts(aRes.data);
    } catch (e) {
      console.error('Failed to load admin data:', e);
    }
  };

  const handleResetSystem = async () => {
    if (window.confirm('Reset all digital twin state to default demo dataset?')) {
      await apiService.resetDemo();
      window.location.reload();
    }
  };

  const riskPieData = [
    { name: 'Low Risk', value: 4, color: '#10b981' },
    { name: 'Medium Risk', value: 2, color: '#f59e0b' },
    { name: 'High Risk', value: 1, color: '#f43f5e' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            Village Administration Master Console
          </h1>
          <p className="text-xs text-slate-500">
            High-level oversight of Green Valley Village municipal and agricultural assets.
          </p>
        </div>

        <button
          onClick={handleResetSystem}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Re-seed Village Data
        </button>
      </div>

      {/* Top 9 Administrative Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-3">
        <StatCard title="Total Villages" value="1" icon={Home} color="emerald" />
        <StatCard title="Farmers" value="2" icon={Users} color="blue" />
        <StatCard title="Total Farms" value={village?.totalFarms || 48} icon={Home} color="emerald" />
        <StatCard title="Fields" value={fields.length} icon={Grid} color="teal" />
        <StatCard title="Water Avail." value={`${waterSummary?.availabilityPercentage || 74}%`} icon={Droplet} color="blue" />
        <StatCard title="Electricity" value="4,200 kWh" icon={Zap} color="amber" />
        <StatCard title="Avg Crop Health" value="84%" icon={TrendingUp} color="emerald" />
        <StatCard title="High Risk" value="5" icon={AlertTriangle} color="rose" />
        <StatCard title="Alerts" value={alerts.length} icon={AlertTriangle} color="purple" />
      </div>

      {/* 4 Admin Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Water Chart */}
        <ChartCard title="Village Water Holding (L)" subtitle="Capacity: 500,000 Litres">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={[
              { name: 'Reservoir', value: 280000 },
              { name: 'Tank 1', value: 72000 },
              { name: 'South Storage', value: 22000 },
            ]}>
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip />
              <Bar dataKey="value" fill="#0284c7" radius={[4, 4, 0, 0]} name="Litres" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Electricity Chart */}
        <ChartCard title="Grid Feeder Load Distribution" subtitle="Active Transformer Demand (kW)">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={[
              { name: 'Central X-former', peak: 580 },
              { name: 'Pump Feeder', peak: 380 },
              { name: 'Community Grid', peak: 95 },
            ]}>
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip />
              <Bar dataKey="peak" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Peak (kW)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Crops Chart */}
        <ChartCard title="Field Crop Health Scores (%)" subtitle="Evaluated via agronomic model">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={fields.map((f) => ({ name: f.fieldName?.split(' ')[0], health: f.cropHealth }))}>
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip />
              <Line type="monotone" dataKey="health" stroke="#10b981" strokeWidth={2.5} name="Health %" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Risk Chart */}
        <ChartCard title="Digital Twin Risk Distribution" subtitle="Subsystems categorized by danger score">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={riskPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                {riskPieData.map((e, idx) => (
                  <Cell key={idx} fill={e.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
