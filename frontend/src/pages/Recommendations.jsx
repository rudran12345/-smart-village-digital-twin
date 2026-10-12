import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Lightbulb,
  Droplet,
  Sprout,
  Zap,
  Globe,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export default function Recommendations() {
  const { user, isAdmin } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState('ALL');

  useEffect(() => {
    loadRecommendations();
  }, [user]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const res = await apiService.getRecommendations({
        role: user?.role || 'admin',
      });
      setRecommendations(res.data);
    } catch (e) {
      console.error('Failed to load recommendations:', e);
    } finally {
      setLoading(false);
    }
  };

  const domainIcon = {
    Water: Droplet,
    Agriculture: Sprout,
    Electricity: Zap,
    General: Globe,
  };

  const filtered = recommendations.filter((r) => {
    if (selectedDomain === 'ALL') return true;
    return r.domain === selectedDomain;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-amber-500" />
            AI Decision Support & Actionable Recommendations
          </h1>
          <p className="text-xs text-slate-500">
            Intelligent advisories generated from machine learning predictions and digital twin simulations.
          </p>
        </div>

        {/* Domain Filter */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs">
          {['ALL', 'Water', 'Agriculture', 'Electricity', 'General'].map((dom) => (
            <button
              key={dom}
              onClick={() => setSelectedDomain(dom)}
              className={`px-3 py-1.5 rounded-lg transition font-medium ${
                selectedDomain === dom
                  ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {dom === 'ALL' ? 'All Domains' : dom}
            </button>
          ))}
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Loading recommendations...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((rec) => {
            const Icon = domainIcon[rec.domain] || Globe;
            const priorityBadge =
              rec.priority === 'HIGH'
                ? 'bg-rose-100 text-rose-800'
                : rec.priority === 'MEDIUM'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-emerald-100 text-emerald-800';

            return (
              <div
                key={rec.recId}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">{rec.title}</h3>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">
                          Domain: {rec.domain}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${priorityBadge}`}
                    >
                      {rec.priority} Priority
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {rec.text}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{rec.impact}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
