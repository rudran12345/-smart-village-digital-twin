import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, Info } from 'lucide-react';

export default function RiskBadge({ level = 'Low', score = null, size = 'md' }) {
  const normLevel = (level || 'Low').toUpperCase();

  const config = {
    LOW: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500',
      icon: ShieldCheck,
      label: 'Low Risk',
    },
    MEDIUM: {
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      dot: 'bg-amber-500',
      icon: AlertTriangle,
      label: 'Medium Risk',
    },
    HIGH: {
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      dot: 'bg-rose-500',
      icon: AlertOctagon,
      label: 'High Risk',
    },
    CRITICAL: {
      bg: 'bg-purple-50 text-purple-700 border-purple-200',
      dot: 'bg-purple-600',
      icon: AlertOctagon,
      label: 'Critical Risk',
    },
  }[normLevel] || {
    bg: 'bg-slate-50 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
    icon: Info,
    label: normLevel,
  };

  const Icon = config.icon;
  const isSm = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium border rounded-full transition-all ${config.bg} ${
        isSm ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      }`}
    >
      <span className={`w-2 h-2 rounded-full animate-pulse ${config.dot}`} />
      <Icon className={isSm ? 'w-3 h-3' : 'w-4 h-4'} />
      <span>{config.label}</span>
      {score !== null && score !== undefined && (
        <span className="font-semibold ml-0.5 opacity-90">({score})</span>
      )}
    </span>
  );
}
