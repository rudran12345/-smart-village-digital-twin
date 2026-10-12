import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Bell,
  User,
  LogOut,
  RefreshCw,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { apiService } from '../services/api';

export default function Navbar({ alertCount = 7, onMenuToggle }) {
  const { user, isAdmin, isFarmer, loginAsAdmin, loginAsFarmer, logout, demoMode } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleReset = async () => {
    if (window.confirm('Reset all village resources to the realistic Green Valley demo dataset?')) {
      setResetting(true);
      try {
        await apiService.resetDemo();
        window.location.reload();
      } catch (e) {
        console.error('Failed to reset demo:', e);
      } finally {
        setResetting(false);
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Mobile hamburger + Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            aria-label="Toggle menu"
          >
            <Layers className="w-5 h-5" />
          </button>

          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base md:text-lg text-slate-900 tracking-tight block leading-tight">
                SmartVillage <span className="text-emerald-600">AI Twin</span>
              </span>
              <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider block">
                Cloud Resource Monitoring & Predictive Analytics
              </span>
            </div>
          </Link>
        </div>

        {/* Center / Right: Role switchers, notification, user */}
        <div className="flex items-center gap-2 sm:gap-4">
          {demoMode && <>
          <div className="hidden lg:flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
            <button
              onClick={loginAsAdmin}
              className={`px-2.5 py-1 rounded-md transition ${
                isAdmin
                  ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Admin View
            </button>
            <button
              onClick={loginAsFarmer}
              className={`px-2.5 py-1 rounded-md transition ${
                isFarmer
                  ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Farmer View
            </button>
          </div>

          <button
            onClick={handleReset}
            disabled={resetting}
            title="Reset Village Demo Data"
            className="hidden sm:flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
            <span>Reset Demo</span>
          </button>
          </>}

          {/* Notifications / Alerts Link */}
          <Link
            to="/alerts"
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
            title="Active Village Alerts"
          >
            <Bell className="w-5 h-5" />
            {alertCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {alertCount}
              </span>
            )}
          </Link>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition border border-transparent hover:border-slate-200"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div className="hidden sm:block text-left text-xs leading-tight">
                <span className="font-semibold text-slate-800 block truncate max-w-[120px]">
                  {user?.name || 'Guest'}
                </span>
                <span className="text-[10px] text-emerald-600 font-medium uppercase">
                  {user?.role || 'User'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 text-xs animate-in fade-in duration-100">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="font-bold text-slate-800">{user?.name}</p>
                  <p className="text-slate-500 text-[11px] truncate">{user?.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 uppercase">
                    Role: {user?.role}
                  </span>
                </div>

                {demoMode && <div className="lg:hidden px-3 py-2 border-b border-slate-100 space-y-1">
                  <p className="font-semibold text-slate-400 uppercase text-[10px]">Switch Role</p>
                  <button
                    onClick={() => {
                      loginAsAdmin();
                      setDropdownOpen(false);
                    }}
                    className="block w-full text-left py-1 text-slate-700 hover:text-emerald-600"
                  >
                    Admin Mode
                  </button>
                  <button
                    onClick={() => {
                      loginAsFarmer();
                      setDropdownOpen(false);
                    }}
                    className="block w-full text-left py-1 text-slate-700 hover:text-emerald-600"
                  >
                    Farmer Mode
                  </button>
                </div>}

                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 transition"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>My Profile</span>
                </Link>

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                    navigate('/login');
                  }}
                  className="flex items-center gap-2 w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 transition"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
