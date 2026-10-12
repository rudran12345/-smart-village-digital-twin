import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import AlertCard from '../components/AlertCard';
import { AlertTriangle, Filter, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  useEffect(() => {
    loadAlerts();
  }, [selectedSeverity, selectedCategory]);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedSeverity !== 'ALL') params.severity = selectedSeverity;
      if (selectedCategory !== 'ALL') params.category = selectedCategory;
      const res = await apiService.getAlerts(params);
      setAlerts(res.data);
    } catch (e) {
      console.error('Failed to load alerts:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (id) => {
    try {
      await apiService.acknowledgeAlert(id);
      setAlerts((prev) =>
        prev.map((a) => (a.alertId === id ? { ...a, status: 'ACKNOWLEDGED' } : a))
      );
    } catch (e) {
      console.error('Failed to acknowledge alert:', e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-rose-600" />
            Active Village Alerts & Risk Advisories
          </h1>
          <p className="text-xs text-slate-500">
            Real-time critical events evaluated by the multi-factor AI risk engine.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="text-xs font-semibold px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="WARNING">Warning</option>
            <option value="INFO">Info</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs font-semibold px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">All Categories</option>
            <option value="Water">Water</option>
            <option value="Agriculture">Agriculture</option>
            <option value="Electricity">Electricity</option>
            <option value="Weather">Weather</option>
          </select>
        </div>
      </div>

      {/* Alerts Count Overview Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between">
          <span className="text-xs font-semibold text-purple-900">Critical Alerts</span>
          <strong className="text-lg text-purple-950 font-extrabold">
            {alerts.filter((a) => a.severity === 'CRITICAL').length}
          </strong>
        </div>
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between">
          <span className="text-xs font-semibold text-rose-900">High Risk</span>
          <strong className="text-lg text-rose-950 font-extrabold">
            {alerts.filter((a) => a.severity === 'HIGH').length}
          </strong>
        </div>
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
          <span className="text-xs font-semibold text-amber-900">Warnings</span>
          <strong className="text-lg text-amber-950 font-extrabold">
            {alerts.filter((a) => a.severity === 'WARNING').length}
          </strong>
        </div>
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
          <span className="text-xs font-semibold text-blue-900">Informational</span>
          <strong className="text-lg text-blue-950 font-extrabold">
            {alerts.filter((a) => a.severity === 'INFO').length}
          </strong>
        </div>
      </div>

      {/* Alerts List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Loading alerts...</div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <AlertCard
              key={alert.alertId}
              alert={alert}
              onAcknowledge={handleAcknowledge}
            />
          ))}

          {alerts.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="font-semibold text-slate-700">No active alerts matching filter criteria.</p>
              <p className="text-slate-400 mt-1">Village systems are performing within safety bounds.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
