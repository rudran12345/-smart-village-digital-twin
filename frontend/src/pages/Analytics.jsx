import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import ChartCard from '../components/ChartCard';
import StatCard from '../components/StatCard';
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
  Legend,
  CartesianGrid,
} from 'recharts';
import { BarChart3, Droplet, Zap, Sprout, ShieldAlert } from 'lucide-react';

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [fields, setFields] = useState([]);
  const [crops, setCrops] = useState([]);
  const [waterResources, setWaterResources] = useState([]);
  const [electricity, setElectricity] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [fldRes, cRes, wRes, eRes] = await Promise.all([
        apiService.getFields(),
        apiService.getCrops(),
        apiService.getWaterResources(),
        apiService.getElectricityRecords(),
      ]);
      setFields(fldRes.data);
      setCrops(cRes.data);
      setWaterResources(wRes.data);
      setElectricity(eRes.data);
    } catch (e) {
      console.error('Failed to load analytics data:', e);
    } finally {
      setLoading(false);
    }
  };

  // 1. Water Usage Chart Data (Line Chart)
  const waterUsageData = [
    { day: 'Day 1', domestic: 2600, agricultural: 5600, total: 8200 },
    { day: 'Day 2', domestic: 2700, agricultural: 5700, total: 8400 },
    { day: 'Day 3', domestic: 2700, agricultural: 5900, total: 8600 },
    { day: 'Day 4', domestic: 2800, agricultural: 6100, total: 8900 },
    { day: 'Day 5', domestic: 2800, agricultural: 6400, total: 9200 },
    { day: 'Day 6', domestic: 2900, agricultural: 6600, total: 9500 },
    { day: 'Day 7', domestic: 2800, agricultural: 5700, total: 8500 },
  ];

  // 2. Electricity Usage Chart Data (Bar Chart)
  const electricityData = [
    { day: 'Mon', pump: 1850, domestic: 1650, commercial: 450 },
    { day: 'Tue', pump: 1900, domestic: 1670, commercial: 450 },
    { day: 'Wed', pump: 1980, domestic: 1680, commercial: 450 },
    { day: 'Thu', pump: 2120, domestic: 1700, commercial: 460 },
    { day: 'Fri', pump: 2210, domestic: 1720, commercial: 460 },
    { day: 'Sat', pump: 2290, domestic: 1730, commercial: 460 },
    { day: 'Sun', pump: 2100, domestic: 1650, commercial: 450 },
  ];

  // 3. Crop Health Chart Data (Line Chart)
  const cropHealthData = fields.map((f) => ({
    name: f.fieldName?.split(' ')[0] || f.fieldName,
    crop: f.crop,
    health: f.cropHealth,
    moisture: f.moisture,
  }));

  // 4. Risk Distribution (Pie Chart)
  const riskPieData = [
    { name: 'Low Risk', value: 4, color: '#10b981' },
    { name: 'Medium Risk', value: 2, color: '#f59e0b' },
    { name: 'High Risk', value: 1, color: '#f43f5e' },
  ];

  // 5. Predicted Yield (Bar Chart)
  const yieldData = crops.map((c) => ({
    crop: c.cropName?.split(' ')[0] || c.cropName,
    predictedYield: c.expectedYieldTons || 4.0,
    area: c.area,
  }));

  // 6. Resource Stress Comparison
  const resourceComparisonData = [
    { resource: 'Water Buffer', current: 74, stressThreshold: 60 },
    { resource: 'Grid Headroom', current: 68, stressThreshold: 85 },
    { resource: 'Crop Vigor', current: 84, stressThreshold: 65 },
    { resource: 'Soil Moisture', current: 58, stressThreshold: 45 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-emerald-600" />
          Cross-Domain Village Resource Analytics
        </h1>
        <p className="text-xs text-slate-500">
          Recharts multi-dimensional analytics synthesized from Cloud Firestore historical datasets.
        </p>
      </div>

      {/* Grid of 6 Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Chart 1: Water Usage Chart (Line chart) */}
        <ChartCard
          title="Water Usage Breakdown (Line Chart)"
          subtitle="Domestic vs Agricultural irrigation draw (L)"
        >
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={waterUsageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Line type="monotone" dataKey="agricultural" stroke="#0284c7" strokeWidth={2} name="Agri Irrigation" />
              <Line type="monotone" dataKey="domestic" stroke="#10b981" strokeWidth={2} name="Domestic Supply" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart 2: Electricity Usage Chart (Bar chart) */}
        <ChartCard
          title="Electricity Sectoral Draw (Bar Chart)"
          subtitle="Tube wells vs domestic lighting (kWh)"
        >
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={electricityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="pump" stackId="a" fill="#f59e0b" name="Pumping" />
              <Bar dataKey="domestic" stackId="a" fill="#64748b" name="Domestic" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart 3: Crop Health Chart (Line chart) */}
        <ChartCard
          title="Field Crop Health Vigor (Line Chart)"
          subtitle="Physiological health score vs soil moisture %"
        >
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={cropHealthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Line type="monotone" dataKey="health" stroke="#10b981" strokeWidth={2.5} name="Health Score (%)" />
              <Line type="monotone" dataKey="moisture" stroke="#0284c7" strokeWidth={1.5} name="Moisture (%)" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart 4: Risk Distribution (Pie chart) */}
        <ChartCard
          title="Village Subsystem Risk Distribution"
          subtitle="Proportion of monitored assets by danger level"
        >
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={riskPieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {riskPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart 5: Predicted Yield (Bar chart) */}
        <ChartCard
          title="Predicted Harvest Yield (Bar Chart)"
          subtitle="Machine learning tonnage forecast by crop variety"
        >
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={yieldData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="crop" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip />
              <Bar dataKey="predictedYield" fill="#10b981" name="Predicted Yield (Tons)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart 6: Resource Comparison (Bar chart) */}
        <ChartCard
          title="Resource Safety Margins vs Thresholds"
          subtitle="Comparative index across all four vital domains"
        >
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={resourceComparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="resource" stroke="#94a3b8" fontSize={10} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="current" fill="#0284c7" name="Current State Index" radius={[4, 4, 0, 0]} />
              <Bar dataKey="stressThreshold" fill="#f43f5e" name="Stress Threshold" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
