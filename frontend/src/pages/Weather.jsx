import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import Modal from '../components/Modal';
import { CloudSun, Plus, Thermometer, Droplets, CloudRain, Wind } from 'lucide-react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function Weather() {
  const [records, setRecords] = useState([]);
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    date: '2026-10-12',
    temperature: 29.5,
    humidity: 72.0,
    rainfall: 8.0,
    condition: 'Cloudy',
    windSpeed: 12.0,
  });

  useEffect(() => {
    loadWeatherData();
  }, []);

  const loadWeatherData = async () => {
    try {
      setLoading(true);
      const [listRes, curRes] = await Promise.all([
        apiService.getWeatherRecords(),
        apiService.getCurrentWeather(),
      ]);
      setRecords(listRes.data);
      setCurrent(curRes.data);
    } catch (e) {
      console.error('Failed to load weather data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleManualEntry = async (e) => {
    e.preventDefault();
    try {
      await apiService.createWeatherRecord(formData);
      setIsModalOpen(false);
      loadWeatherData();
    } catch (e) {
      console.error('Failed to create weather record:', e);
    }
  };

  const chartData = records.slice(0, 10).reverse().map((r) => ({
    date: r.date?.slice(5) || '',
    temp: r.temperature,
    humidity: r.humidity,
    rainfall: r.rainfall,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <CloudSun className="w-6 h-6 text-sky-500" />
            Village Weather Records & Climate Observations
          </h1>
          <p className="text-xs text-slate-500">
            Historical datasets and manual meteorological logs driving digital twin evapotranspiration (No IoT).
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-xs transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Weather Observation
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Ambient Temp"
          value={`${current?.temperature || 29.5}°C`}
          subvalue="Moderate Heat Index"
          icon={Thermometer}
          color="amber"
        />
        <StatCard
          title="Relative Humidity"
          value={`${current?.humidity || 72}%`}
          subvalue="Normal Transpiration"
          icon={Droplets}
          color="blue"
        />
        <StatCard
          title="Precipitation"
          value={`${current?.rainfall || 8.0} mm`}
          subvalue="Recorded Rain"
          icon={CloudRain}
          color="indigo"
        />
        <StatCard
          title="Wind Velocity"
          value={`${current?.windSpeed || 12} km/h`}
          subvalue="Condition: Cloudy"
          icon={Wind}
          color="emerald"
        />
      </div>

      {/* Weather Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Temperature (°C) & Humidity (%) History"
          subtitle="Recent observation series"
        >
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData}>
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip />
              <Line type="monotone" dataKey="temp" stroke="#f59e0b" strokeWidth={2} name="Temp (°C)" />
              <Line type="monotone" dataKey="humidity" stroke="#0284c7" strokeWidth={2} name="Humidity (%)" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Rainfall Depth (mm)"
          subtitle="Precipitation replenishment records"
        >
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData}>
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip />
              <Area type="monotone" dataKey="rainfall" stroke="#4f46e5" fill="#818cf8" fillOpacity={0.3} name="Rainfall (mm)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Weather Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <h3 className="font-bold text-base text-slate-900">
          Historical Meteorological Observation Log
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
              <tr>
                <th className="p-3">Observation Date</th>
                <th className="p-3">Temperature</th>
                <th className="p-3">Relative Humidity</th>
                <th className="p-3">Precipitation</th>
                <th className="p-3">Sky Condition</th>
                <th className="p-3">Wind Speed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map((r) => (
                <tr key={r.recordId} className="hover:bg-slate-50/70 transition">
                  <td className="p-3 font-semibold text-slate-900">{r.date}</td>
                  <td className="p-3 text-amber-700 font-bold">{r.temperature}°C</td>
                  <td className="p-3 text-blue-700 font-semibold">{r.humidity}%</td>
                  <td className="p-3 text-indigo-700 font-semibold">{r.rainfall} mm</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 font-medium text-slate-700">
                      {r.condition}
                    </span>
                  </td>
                  <td className="p-3 text-slate-500">{r.windSpeed} km/h</td>
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
        title="Add Weather Observation (Manual Log)"
      >
        <form onSubmit={handleManualEntry} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Condition</label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500 bg-white"
              >
                <option value="Sunny">Sunny</option>
                <option value="Cloudy">Cloudy</option>
                <option value="Partly Cloudy">Partly Cloudy</option>
                <option value="Rainy">Rainy</option>
                <option value="Thunderstorm">Thunderstorm</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Temp (°C)</label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.temperature}
                onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Humidity (%)</label>
              <input
                type="number"
                required
                value={formData.humidity}
                onChange={(e) => setFormData({ ...formData, humidity: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Rain (mm)</label>
              <input
                type="number"
                step="0.5"
                required
                value={formData.rainfall}
                onChange={(e) => setFormData({ ...formData, rainfall: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
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
              className="px-4 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-xs transition"
            >
              Save Observation
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
