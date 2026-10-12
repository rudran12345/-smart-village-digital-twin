import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Shield } from 'lucide-react';

export default function Profile() {
  const { user, isAdmin, isFarmer, loginAsAdmin, loginAsFarmer, demoMode } = useAuth();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          User Profile & Digital Twin Context
        </h1>
        <p className="text-xs text-slate-500">
          Role permissions and village access control in Cloud Firestore.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-extrabold text-2xl flex items-center justify-center shadow-md shadow-emerald-500/20">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{user?.name}</h2>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase bg-emerald-100 text-emerald-800">
              Role: {user?.role}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-4 border-t border-slate-100">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-400 font-semibold block text-[10px] uppercase">
              Assigned Village
            </span>
            <strong className="text-slate-800 text-sm">
              {user?.villageName || 'Green Valley Village'} (V001)
            </strong>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-400 font-semibold block text-[10px] uppercase">
              System Access Level
            </span>
            <strong className="text-slate-800 text-sm">
              {isAdmin ? 'Full Village Administrative Authority' : 'Farmer Farm & Field Management'}
            </strong>
          </div>
        </div>

        {demoMode && (
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
              Switch Persona for Grading Demonstration
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={loginAsAdmin}
                className={`p-3 rounded-xl border text-left transition ${
                  isAdmin
                    ? 'border-emerald-500 bg-emerald-50/50'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 mb-0.5">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  Village Administrator
                </div>
                <p className="text-[11px] text-slate-500">
                  Inspect complete village, manage water, grid & dataset uploads.
                </p>
              </button>

              <button
                onClick={loginAsFarmer}
                className={`p-3 rounded-xl border text-left transition ${
                  isFarmer
                    ? 'border-emerald-500 bg-emerald-50/50'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 mb-0.5">
                  <User className="w-4 h-4 text-teal-600" />
                  Farmer Arun Kumar
                </div>
                <p className="text-[11px] text-slate-500">
                  Manage personal farm, crop growth stages, and field health.
                </p>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
