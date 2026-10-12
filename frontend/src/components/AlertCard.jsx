import React from 'react';
import { Droplet, Sprout, Zap, CloudSun, AlertCircle, CheckCircle } from 'lucide-react';

export default function AlertCard({ alert, onAcknowledge }) {
  const { alertId, title, message, severity, category, timestamp, status } = alert;

  const severityStyle = {
    CRITICAL: 'border-l-4 border-l-purple-600 bg-purple-50/40 text-purple-950',
    HIGH: 'border-l-4 border-l-rose-500 bg-rose-50/40 text-rose-950',
    WARNING: 'border-l-4 border-l-amber-500 bg-amber-50/40 text-amber-950',
    INFO: 'border-l-4 border-l-blue-500 bg-blue-50/40 text-blue-950',
  }[severity] || 'border-l-4 border-l-slate-400 bg-slate-50 text-slate-800';

  const categoryIcon = {
    Water: Droplet,
    Agriculture: Sprout,
    Electricity: Zap,
    Weather: CloudSun,
  }[category] || AlertCircle;

  const Icon = categoryIcon;

  return (
    <div
      className={`rounded-xl p-4 bg-white border border-slate-200/80 shadow-xs transition-all hover:shadow-sm ${severityStyle}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-white/80 shadow-xs mt-0.5">
            <Icon className="w-5 h-5 text-slate-700" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm text-slate-900">{title}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded font-semibold uppercase ${
                  severity === 'CRITICAL'
                    ? 'bg-purple-100 text-purple-800'
                    : severity === 'HIGH'
                    ? 'bg-rose-100 text-rose-800'
                    : severity === 'WARNING'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {severity}
              </span>
              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {category}
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-600 mt-1 leading-relaxed">
              {message}
            </p>
            <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
              <span>{new Date(timestamp).toLocaleString()}</span>
              {status === 'ACKNOWLEDGED' && (
                <span className="text-emerald-600 font-medium flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Acknowledged
                </span>
              )}
            </div>
          </div>
        </div>

        {status !== 'ACKNOWLEDGED' && onAcknowledge && (
          <button
            onClick={() => onAcknowledge(alertId)}
            className="text-xs whitespace-nowrap px-3 py-1.5 rounded-lg font-medium bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 transition"
          >
            Acknowledge
          </button>
        )}
      </div>
    </div>
  );
}
