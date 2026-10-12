import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import Modal from '../components/Modal';
import { Plus, Search, Edit2, Trash2, Home, MapPin, Layers } from 'lucide-react';

export default function Farms() {
  const [farms, setFarms] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFarm, setEditingFarm] = useState(null);

  const [formData, setFormData] = useState({
    farmName: '',
    farmerName: '',
    location: '',
    area: 5.0,
    soilType: 'Clay',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&auto=format&fit=crop&q=80',
  });

  useEffect(() => {
    fetchFarms();
  }, [search]);

  const fetchFarms = async () => {
    try {
      setLoading(true);
      const res = await apiService.getFarms({ search: search || undefined });
      setFarms(res.data);
    } catch (e) {
      console.error('Failed to load farms:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (farm = null) => {
    if (farm) {
      setEditingFarm(farm);
      setFormData({
        farmName: farm.farmName,
        farmerName: farm.farmerName || '',
        location: farm.location,
        area: farm.area,
        soilType: farm.soilType,
        image: farm.image || '',
      });
    } else {
      setEditingFarm(null);
      setFormData({
        farmName: '',
        farmerName: '',
        location: '',
        area: 5.0,
        soilType: 'Clay',
        image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&auto=format&fit=crop&q=80',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingFarm) {
        await apiService.updateFarm(editingFarm.farmId, formData);
      } else {
        await apiService.createFarm(formData);
      }
      setIsModalOpen(false);
      fetchFarms();
    } catch (e) {
      console.error('Failed to save farm:', e);
    }
  };

  const handleDelete = async (farmId) => {
    if (window.confirm('Are you sure you want to delete this farm?')) {
      try {
        await apiService.deleteFarm(farmId);
        fetchFarms();
      } catch (e) {
        console.error('Failed to delete farm:', e);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Village Farm Management
          </h1>
          <p className="text-xs text-slate-500">
            Registered farm estates in Green Valley Village saved to Cloud Firestore.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search farm, farmer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 w-48 sm:w-60"
            />
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <Plus className="w-4 h-4" /> Add Farm
          </button>
        </div>
      </div>

      {/* Farms Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Loading farms...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {farms.map((farm) => (
            <div
              key={farm.farmId}
              className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={
                      farm.image ||
                      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&auto=format&fit=crop&q=80'
                    }
                    alt={farm.farmName}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs text-slate-800 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                    {farm.area} Acres
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{farm.farmName}</h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        {farm.location}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                    <div className="p-2 rounded-lg bg-slate-50">
                      <span className="text-slate-400 text-[10px] uppercase font-semibold block">
                        Farmer
                      </span>
                      <strong className="text-slate-800 truncate block">
                        {farm.farmerName || 'Arun'}
                      </strong>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50">
                      <span className="text-slate-400 text-[10px] uppercase font-semibold block">
                        Soil Type
                      </span>
                      <strong className="text-slate-800">{farm.soilType}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-5 pb-5 pt-2 flex items-center justify-end gap-2 border-t border-slate-50">
                <button
                  onClick={() => handleOpenModal(farm)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                  title="Edit Farm"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(farm.farmId)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                  title="Delete Farm"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Farm Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingFarm ? 'Edit Farm' : 'Add New Farm'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Farm Name
            </label>
            <input
              type="text"
              required
              value={formData.farmName}
              onChange={(e) => setFormData({ ...formData, farmName: e.target.value })}
              placeholder="e.g. Green Valley Farm"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Farmer / Owner Name
            </label>
            <input
              type="text"
              required
              value={formData.farmerName}
              onChange={(e) => setFormData({ ...formData, farmerName: e.target.value })}
              placeholder="e.g. Arun Kumar"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Location / Sector
            </label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g. North Zone"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Farm Image URL (Cloud Storage or Unsplash)
            </label>
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
              {editingFarm ? 'Save Changes' : 'Create Farm'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
