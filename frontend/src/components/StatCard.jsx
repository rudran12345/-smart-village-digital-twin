import React from 'react';

export default function StatCard({
  title,
  value,
  subvalue,
  icon: Icon,
  trend,
  color = 'emerald',
  badge,
}) {
  const colorMap = {
    emerald: {
      bg: 'bg-emerald-50 text-emerald-600',
      border: 'hover:border-emerald-300',
      accent: 'text-emerald-600',
    },
    blue: {
      bg: 'bg-blue-50 text-blue-600',
      border: 'hover:border-blue-300',
      accent: 'text-blue-600',
    },
    amber: {
      bg: 'bg-amber-50 text-amber-600',
      border: 'hover:border-amber-300',
      accent: 'text-amber-600',
    },
    rose: {
      bg: 'bg-rose-50 text-rose-600',
      border: 'hover:border-rose-300',
      accent: 'text-rose-600',
    },
    indigo: {
      bg: 'bg-indigo-50 text-indigo-600',
      border: 'hover:border-indigo-300',
      accent: 'text-indigo-600',
    },
    purple: {
      bg: 'bg-purple-50 text-purple-600',
      border: 'hover:border-purple-300',
      accent: 'text-purple-600',
    },
  }[color] || {
    bg: 'bg-slate-50 text-slate-600',
    border: 'hover:border-slate-300',
    accent: 'text-slate-600',
  };

  return (
    <div
      className={`bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 ${colorMap.border}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div className={`p-2.5 rounded-lg ${colorMap.bg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between">
        <div className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
          {value}
        </div>
        {badge}
      </div>

      {(subvalue || trend) && (
        <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
          <span>{subvalue}</span>
          {trend && (
            <span
              className={`font-medium ${
                trend.startsWith('+') ? 'text-amber-600' : 'text-emerald-600'
              }`}
            >
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
