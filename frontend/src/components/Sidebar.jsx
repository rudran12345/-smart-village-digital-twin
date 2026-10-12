import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  MapPin,
  Home,
  Grid,
  Sprout,
  Droplet,
  Zap,
  CloudSun,
  BarChart3,
  Cpu,
  Sliders,
  Lightbulb,
  AlertTriangle,
  FileSpreadsheet,
  ShieldCheck,
  User,
  X,
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { isAdmin, isFarmer } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Village Digital Twin', path: '/twin', icon: MapPin },
    { name: 'Farms', path: '/farms', icon: Home },
    { name: 'Fields', path: '/fields', icon: Grid },
    { name: 'Crops', path: '/crops', icon: Sprout },
    { name: 'Water Resources', path: '/water', icon: Droplet },
    { name: 'Electricity', path: '/electricity', icon: Zap },
    { name: 'Weather', path: '/weather', icon: CloudSun },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'AI Predictions', path: '/predictions', icon: Cpu },
    { name: 'What-If Simulation', path: '/simulation', icon: Sliders },
    { name: 'Recommendations', path: '/recommendations', icon: Lightbulb },
    { name: 'Alerts', path: '/alerts', icon: AlertTriangle },
    { name: 'CSV Datasets', path: '/datasets', icon: FileSpreadsheet },
    ...(isAdmin
      ? [{ name: 'Admin Dashboard', path: '/admin', icon: ShieldCheck }]
      : []),
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
        />
      )}

      <aside
        className={`fixed md:sticky top-0 md:top-16 z-50 md:z-30 h-screen md:h-[calc(100vh-4rem)] w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Header */}
          <div className="flex md:hidden items-center justify-between p-4 border-b border-slate-100">
            <span className="font-bold text-slate-800 text-sm">Navigation</span>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links List */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
              Village Monitoring
            </div>

            {navItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => onClose && onClose()}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Bottom Card: Platform Badge */}
          <div className="p-3 border-t border-slate-100">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] space-y-1 text-slate-600">
              <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                AI Digital Twin
              </div>
              <p className="text-slate-500 text-[10px] leading-tight">
                Virtual resource management powered by predictive analytics & Cloud Firestore.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
