import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import StatCard from '../components/StatCard';
import RiskBadge from '../components/RiskBadge';
import AlertCard from '../components/AlertCard';
import DigitalTwinMap from '../components/DigitalTwinMap';
import ChartCard from '../components/ChartCard';
import {
  Home,
  Droplet,
  Zap,
  Sprout,
  AlertTriangle,
  MapPin,
  TrendingUp,
  Cpu,
  Sliders,
  Calendar,
  CloudSun,
  ShieldCheck,
  ArrowRight,
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function Dashboard() {
  const { user, isAdmin, isFarmer } = useAuth();
  const [loading, setLoading] = useState(true);
  const [village, setVillage] = useState(null);
  const [farms, setFarms] = useState([]);
  const [fields, setFields] = useState([]);
  const [crops, setCrops] = useState([]);
  const [waterResources, setWaterResources] = useState([]);
  const [waterSummary, setWaterSummary] = useState(null);
  const [electricitySummary, setElectricitySummary] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [vRes, fRes, fldRes, cRes, wRes, wSum, eSum, aRes, wtRes] =
        await Promise.all([
          apiService.getVillage('V001'),
          apiService.getFarms(),
          apiService.getFields(),
          apiService.getCrops(),
          apiService.getWaterResources(),
          apiService.getWaterSummary(),
          apiService.getElectricitySummary(),
          apiService.getAlerts(),
          apiService.getCurrentWeather(),
        ]);

      setVillage(vRes.data);
      setFarms(fRes.data);
      setFields(fldRes.data);
      setCrops(cRes.data);
      setWaterResources(wRes.data);
      setWaterSummary(wSum.data);
      setElectricitySummary(eSum.data);
      setAlerts(aRes.data);
      setWeather(wtRes.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledgeAlert = async (id) => {
    try {
      await apiService.acknowledgeAlert(id);
      setAlerts((prev) =>
        prev.map((a) => (a.alertId === id ? { ...a, status: 'ACKNOWLEDGED' } : a))
      );
    } catch (e) {
      console.error('Failed to acknowledge alert:', e);
    }
  };

  // Farmer specific filtering
  const farmerFarms = farms.filter((f) => f.ownerId === user?.userId || f.farmName?.includes('Green Valley'));
  const farmerFarmIds = farmerFarms.map((f) => f.farmId);
  const farmerFields = fields.filter((f) => farmerFarmIds.includes(f.farmId) || f.farmId === 'F001');

  // Chart Sample Data
  const waterTrendData = [
    { day: 'Mon', usage: 8200, avail: 78000 },
    { day: 'Tue', usage: 8400, avail: 77500 },
    { day: 'Wed', usage: 8900, avail: 74800 },
    { day: 'Thu', usage: 9200, avail: 73200 },
    { day: 'Fri', usage: 9500, avail: 71500 },
    { day: 'Sat', usage: 9100, avail: 72500 },
    { day: 'Today', usage: 8500, avail: 72000 },
  ];

  const riskDistributionData = [
    { name: 'Low Risk', value: 4, color: '#10b981' },
    { name: 'Medium Risk', value: 2, color: '#f59e0b' },
    { name: 'High Risk', value: 1, color: '#f43f5e' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-emerald-500/20 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                {isAdmin ? 'ADMINISTRATIVE COCKPIT' : 'FARMER PORTAL'}
              </span>
              <span className="text-xs text-slate-300">
                • {village?.name || 'Green Valley Village'} ({village?.state || 'Tamil Nadu'})
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {isAdmin
                ? 'Smart Village Digital Twin Resource Center'
                : `Welcome Back, ${user?.name || 'Farmer Arun'}`}
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Virtual software twin tracking village water balances, agricultural health,
              and transformer grids through cloud predictive simulation.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <Link
              to="/twin"
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs md:text-sm font-semibold flex items-center gap-1.5 shadow-sm transition"
            >
              <MapPin className="w-4 h-4" /> Open Full Twin Map
            </Link>
            <Link
              to="/simulation"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs md:text-sm font-semibold flex items-center gap-1.5 border border-white/20 transition"
            >
              <Sliders className="w-4 h-4" /> What-If Lab
            </Link>
          </div>
        </div>
      </div>

      {/* Top Metric Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 md:gap-4">
        <StatCard
          title="Villages"
          value="1"
          subvalue="Green Valley"
          icon={Home}
          color="emerald"
        />
        <StatCard
          title="Farms"
          value={isAdmin ? (village?.totalFarms || 48) : farmerFarms.length}
          subvalue={isAdmin ? 'Total Active' : 'My Registered Farms'}
          icon={Sprout}
          color="blue"
        />
        <StatCard
          title="Water Avail."
          value={`${waterSummary?.availabilityPercentage || 72}%`}
          subvalue="374,000 Litres"
          icon={Droplet}
          color="blue"
          trend="-2.4% this wk"
        />
        <StatCard
          title="Avg Crop Health"
          value="84%"
          subvalue="6 Monitored Fields"
          icon={TrendingUp}
          color="emerald"
          badge={<RiskBadge level="Low" size="sm" />}
        />
        <StatCard
          title="Power Usage"
          value={`${electricitySummary?.currentUsage?.toLocaleString() || '4,200'} kWh`}
          subvalue="Peak: 580 kW"
          icon={Zap}
          color="amber"
        />
        <StatCard
          title="High Risk"
          value="5"
          subvalue="Subsystems Flagged"
          icon={AlertTriangle}
          color="rose"
        />
        <StatCard
          title="Active Alerts"
          value={alerts.filter((a) => a.status === 'ACTIVE').length}
          subvalue="Real-time Advisory"
          icon={AlertTriangle}
          color="purple"
        />
      </div>

      {/* Main Grid: Digital Twin Mini Map & Subsystem Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Mini Digital Twin Map */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                Geospatial Resource Twin
              </h2>
              <p className="text-xs text-slate-500">
                Click any farm, field, water reservoir, or power node to inspect telemetry
              </p>
            </div>
            <Link
              to="/twin"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              Full Screen Map <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-[360px] w-full rounded-xl overflow-hidden border border-slate-100">
            <DigitalTwinMap
              fields={isAdmin ? fields : farmerFields}
              farms={isAdmin ? farms : farmerFarms}
              waterResources={waterResources}
              electricityNodes={electricitySummary ? [electricitySummary] : []}
            />
          </div>

          {/* Quick Subsystem Indicator Strip */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                Weather Now
              </span>
              <span className="font-bold text-slate-800 text-sm">
                {weather?.temperature || 29.5}°C • {weather?.condition || 'Cloudy'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                Daily Rainfall
              </span>
              <span className="font-bold text-slate-800 text-sm">
                {weather?.rainfall || 8.0} mm
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                Village Storage
              </span>
              <span className="font-bold text-emerald-700 text-sm">
                72,000 / 100,000 L
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                Overall Risk
              </span>
              <span className="font-bold text-emerald-700 text-sm">
                LOW (Score 28/100)
              </span>
            </div>
          </div>
        </div>

        {/* Right Col: Resource Risk Breakdown & Actions */}
        <div className="space-y-6">
          {/* Risk Pie Chart */}
          <ChartCard
            title="Subsystem Risk Breakdown"
            subtitle="Categorized across village resources"
          >
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={riskDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {riskDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Quick Navigation Cards */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-800 text-sm">Quick Predictive Services</h3>
            <div className="space-y-2">
              <Link
                to="/predictions"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200/70 hover:border-emerald-200 transition group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-xs text-slate-800 group-hover:text-emerald-800 block">
                      AI Demand & Yield Predictor
                    </span>
                    <span className="text-[11px] text-slate-500">Run machine learning models</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
              </Link>

              <Link
                to="/simulation"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-teal-50 border border-slate-200/70 hover:border-teal-200 transition group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-teal-100 text-teal-700">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-xs text-slate-800 group-hover:text-teal-800 block">
                      Digital Twin What-If Lab
                    </span>
                    <span className="text-[11px] text-slate-500">Simulate climate & water shifts</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600" />
              </Link>

              <Link
                to="/datasets"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200/70 hover:border-blue-200 transition group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-xs text-slate-800 group-hover:text-blue-800 block">
                      CSV Dataset Management
                    </span>
                    <span className="text-[11px] text-slate-500">Import weather & energy data</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Trends Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard
          title="Water Storage & Consumption Trend"
          subtitle="7-day village replenishment vs withdrawal (Litres)"
          action={
            <Link to="/water" className="text-xs text-emerald-600 font-medium hover:underline">
              View Water Details
            </Link>
          }
        >
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={waterTrendData}>
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip />
              <Area type="monotone" dataKey="avail" stroke="#0284c7" fill="#38bdf8" fillOpacity={0.2} name="Available Water" />
              <Area type="monotone" dataKey="usage" stroke="#e11d48" fill="#fb7185" fillOpacity={0.2} name="Consumption" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Priority Village Alerts Feed */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Active Alerts & Anomaly Warnings
              </h3>
              <p className="text-xs text-slate-500">
                Generated from multi-variable predictive risk model
              </p>
            </div>
            <Link to="/alerts" className="text-xs text-emerald-600 font-semibold hover:underline">
              View All ({alerts.length})
            </Link>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[250px] pr-1">
            {alerts.slice(0, 3).map((alert) => (
              <AlertCard
                key={alert.alertId}
                alert={alert}
                onAcknowledge={handleAcknowledgeAlert}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
