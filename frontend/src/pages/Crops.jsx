import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import Modal from '../components/Modal';
import RiskBadge from '../components/RiskBadge';
import { Plus, Sprout, Calendar, TrendingUp, Edit2, Trash2 } from 'lucide-react';

export default function Crops() {
  const [crops, setCrops] = useState([]);
  const [fields, setFields] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState(null);

  const [formData, setFormData] = useState({
    cropName: 'Rice (ADT-37)',
    fieldId: 'FL001',
    farmId: 'F001',
    plantingDate: '2026-06-15',
    expectedHarvestDate: '2026-10-30',
    area: 2.5,
    cropHealth: 84.0,
    growthStage: 'Flowering',
    riskLevel: 'Low',
    expectedYieldTons: 4.8,
    image: 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?w=600&auto=format&fit=crop&q=80',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cRes, fldRes, fRes] = await Promise.all([
        apiService.getCrops(),
        apiService.getFields(),
        apiService.getFarms(),
      ]);
      setCrops(cRes.data);
      setFields(fldRes.data);
      setFarms(fRes.data);
    } catch (e) {
      console.error('Failed to load crops:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (crop = null) => {
    if (crop) {
      setEditingCrop(crop);
      setFormData({
        cropName: crop.cropName,
        fieldId: crop.fieldId,
        farmId: crop.farmId,
        plantingDate: crop.plantingDate,
        expectedHarvestDate: crop.expectedHarvestDate,
        area: crop.area,
        cropHealth: crop.cropHealth,
        growthStage: crop.growthStage,
        riskLevel: crop.riskLevel,
        expectedYieldTons: crop.expectedYieldTons || 4.0,
        image: crop.image || '',
      });
    } else {
      setEditingCrop(null);
      setFormData({
        cropName: 'Rice (ADT-37)',
        fieldId: fields[0]?.fieldId || 'FL001',
        farmId: farms[0]?.farmId || 'F001',
        plantingDate: '2026-06-15',
        expectedHarvestDate: '2026-10-30',
        area: 2.0,
        cropHealth: 82.0,
        growthStage: 'Flowering',
        riskLevel: 'Low',
        expectedYieldTons: 4.2,
        image: 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?w=600&auto=format&fit=crop&q=80',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCrop) {
        await apiService.updateCrop(editingCrop.cropId, formData);
      } else {
        await apiService.createCrop(formData);
      }
      setIsModalOpen(false);
      loadData();
    } catch (e) {
      console.error('Failed to save crop:', e);
    }
  };

  const handleDelete = async (cropId) => {
    if (window.confirm('Delete this crop record?')) {
      try {
        await apiService.deleteCrop(cropId);
        loadData();
      } catch (e) {
        console.error('Failed to delete crop:', e);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Village Crop Monitoring & Phenology
          </h1>
          <p className="text-xs text-slate-500">
            Agricultural stages, health tracking, and yield forecasts.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Crop Record
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Loading crops...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {crops.map((crop) => (
            <div
              key={crop.cropId}
              className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="relative h-40 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={crop.image}
                    alt={crop.cropName}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                  <div className="absolute top-3 right-3">
                    <RiskBadge level={crop.riskLevel} size="sm" />
                  </div>
                  <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg">
                    {crop.growthStage} Stage
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <h3 className="font-bold text-base text-slate-900">{crop.cropName}</h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-slate-50">
                      <span className="text-slate-400 text-[10px] uppercase font-semibold block">
                        Area
                      </span>
                      <strong className="text-slate-800">{crop.area} Acres</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-emerald-50/60 border border-emerald-100">
                      <span className="text-emerald-700 text-[10px] uppercase font-semibold block">
                        Yield Estimate
                      </span>
                      <strong className="text-emerald-900">{crop.expectedYieldTons} Tons</strong>
                    </div>
                  </div>

                  <div className="space-y-1 pt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">Health Index</span>
                      <strong className="text-emerald-700">{crop.cropHealth}%</strong>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full"
                        style={{ width: `${crop.cropHealth}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 space-y-1 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span>Planted:</span>
                      <strong>{crop.plantingDate}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Expected Harvest:</span>
                      <strong className="text-emerald-700">{crop.expectedHarvestDate}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-5 pb-5 pt-2 flex items-center justify-end gap-2 border-t border-slate-50">
                <button
                  onClick={() => handleOpenModal(crop)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                  title="Edit Crop"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(crop.cropId)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                  title="Delete Crop"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCrop ? 'Edit Crop Record' : 'Add Crop Record'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Crop Name & Variety</label>
            <input
              type="text"
              required
              value={formData.cropName}
              onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
              placeholder="e.g. Rice (ADT-37)"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Growth Stage</label>
              <select
                value={formData.growthStage}
                onChange={(e) => setFormData({ ...formData, growthStage: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="Germination">Germination</option>
                <option value="Vegetative">Vegetative</option>
                <option value="Tillering">Tillering</option>
                <option value="Flowering">Flowering</option>
                <option value="Fruiting">Fruiting</option>
                <option value="Grain Formation">Grain Formation</option>
                <option value="Maturity">Maturity</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Area (Acres)</label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Planting Date</label>
              <input
                type="date"
                required
                value={formData.plantingDate}
                onChange={(e) => setFormData({ ...formData, plantingDate: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Harvest Date</label>
              <input
                type="date"
                required
                value={formData.expectedHarvestDate}
                onChange={(e) => setFormData({ ...formData, expectedHarvestDate: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Image URL</label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
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
              {editingCrop ? 'Save Changes' : 'Create Crop Record'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
