import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import Modal from '../components/Modal';
import RiskBadge from '../components/RiskBadge';
import { Plus, Grid, Edit2, Trash2, Sprout, Thermometer, Droplet, CloudRain } from 'lucide-react';

export default function Fields() {
  const [fields, setFields] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFarm, setSelectedFarm] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingField, setEditingField] = useState(null);

  const [formData, setFormData] = useState({
    fieldName: '',
    farmId: 'F001',
    crop: 'Rice',
    area: 2.5,
    soilType: 'Clay',
    moisture: 65.0,
    temperature: 29.0,
    rainfall: 120.0,
  });

  useEffect(() => {
    loadData();
  }, [selectedFarm]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [fldRes, fRes] = await Promise.all([
        apiService.getFields(selectedFarm !== 'ALL' ? { farm_id: selectedFarm } : {}),
        apiService.getFarms(),
      ]);
      setFields(fldRes.data);
      setFarms(fRes.data);
    } catch (e) {
      console.error('Failed to load fields:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (field = null) => {
    if (field) {
      setEditingField(field);
      setFormData({
        fieldName: field.fieldName,
        farmId: field.farmId,
        crop: field.crop,
        area: field.area,
        soilType: field.soilType,
        moisture: field.moisture,
        temperature: field.temperature,
        rainfall: field.rainfall,
      });
    } else {
      setEditingField(null);
      setFormData({
        fieldName: '',
        farmId: farms[0]?.farmId || 'F001',
        crop: 'Rice',
        area: 2.0,
        soilType: 'Clay',
        moisture: 65.0,
        temperature: 29.0,
        rainfall: 120.0,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingField) {
        await apiService.updateField(editingField.fieldId, formData);
      } else {
        await apiService.createField(formData);
      }
      setIsModalOpen(false);
      loadData();
    } catch (e) {
      console.error('Failed to save field:', e);
    }
  };

  const handleDelete = async (fieldId) => {
    if (window.confirm('Are you sure you want to delete this field?')) {
      try {
        await apiService.deleteField(fieldId);
        loadData();
      } catch (e) {
        console.error('Failed to delete field:', e);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Agricultural Field Management
          </h1>
          <p className="text-xs text-slate-500">
            Monitored plot parcels with software-evaluated soil moisture and crop health.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedFarm}
            onChange={(e) => setSelectedFarm(e.target.value)}
            className="text-xs font-semibold px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">All Village Farms</option>
            {farms.map((f) => (
              <option key={f.farmId} value={f.farmId}>
                {f.farmName}
              </option>
            ))}
          </select>

          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <Plus className="w-4 h-4" /> Add Field
          </button>
        </div>
      </div>

      {/* Fields Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Loading fields...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {fields.map((field) => (
            <div
              key={field.fieldId}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all duration-200 space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-base text-slate-900">{field.fieldName}</h3>
                    <span className="text-xs text-slate-500 block mt-0.5">
                      {farms.find((f) => f.farmId === field.farmId)?.farmName || field.farmId}
                    </span>
                  </div>
                  <RiskBadge level={field.riskLevel} score={field.riskScore} size="sm" />
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
                  <div className="p-2 rounded-xl bg-emerald-50/60 border border-emerald-100 text-center">
                    <span className="text-slate-400 text-[10px] block">Crop</span>
                    <strong className="text-emerald-800">{field.crop}</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                    <span className="text-slate-400 text-[10px] block">Area</span>
                    <strong className="text-slate-800">{field.area} ac</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                    <span className="text-slate-400 text-[10px] block">Soil</span>
                    <strong className="text-slate-800 truncate block">{field.soilType}</strong>
                  </div>
                </div>

                {/* Telemetry Progress Bars */}
                <div className="mt-4 space-y-2.5 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-500">Crop Health Index</span>
                      <strong className="text-emerald-700">{field.cropHealth}%</strong>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all"
                        style={{ width: `${field.cropHealth}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-500">Soil Moisture</span>
                      <strong className="text-blue-700">{field.moisture}%</strong>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full transition-all"
                        style={{ width: `${field.moisture}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Weather Observation Strip */}
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <span className="flex items-center gap-1">
                    <Thermometer className="w-3.5 h-3.5 text-amber-500" /> {field.temperature}°C
                  </span>
                  <span className="flex items-center gap-1">
                    <CloudRain className="w-3.5 h-3.5 text-blue-500" /> {field.rainfall} mm rain
                  </span>
                  <span className="font-semibold text-emerald-700">
                    Est: {(field.area * 1.95).toFixed(1)}t yield
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenModal(field)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                  title="Edit Field"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(field.fieldId)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                  title="Delete Field"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Field Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingField ? 'Edit Field' : 'Add New Field'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Field Name
            </label>
            <input
              type="text"
              required
              value={formData.fieldName}
              onChange={(e) => setFormData({ ...formData, fieldName: e.target.value })}
              placeholder="e.g. Field A (North Paddy)"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Parent Farm
              </label>
              <select
                value={formData.farmId}
                onChange={(e) => setFormData({ ...formData, farmId: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                {farms.map((f) => (
                  <option key={f.farmId} value={f.farmId}>
                    {f.farmName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Crop
              </label>
              <select
                value={formData.crop}
                onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="Rice">Rice</option>
                <option value="Wheat">Wheat</option>
                <option value="Maize">Maize</option>
                <option value="Tomato">Tomato</option>
                <option value="Sugarcane">Sugarcane</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Area (Acres)
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Soil Type
              </label>
              <select
                value={formData.soilType}
                onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="Clay">Clay</option>
                <option value="Loam">Loam</option>
                <option value="Clay Loam">Clay Loam</option>
                <option value="Sandy Loam">Sandy Loam</option>
                <option value="Alluvial">Alluvial</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Moisture (%)
              </label>
              <input
                type="number"
                value={formData.moisture}
                onChange={(e) => setFormData({ ...formData, moisture: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Temp (°C)
              </label>
              <input
                type="number"
                step="0.5"
                value={formData.temperature}
                onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Rainfall (mm)
              </label>
              <input
                type="number"
                value={formData.rainfall}
                onChange={(e) => setFormData({ ...formData, rainfall: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
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
              className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition"
            >
              {editingField ? 'Save Changes' : 'Create Field'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
