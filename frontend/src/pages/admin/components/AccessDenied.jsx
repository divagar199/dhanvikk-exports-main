import React from 'react';
import { ShieldAlert, LogOut, Store, ArrowLeft, RefreshCw } from 'lucide-react';
import Logo from '../../../components/common/Logo';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

export default function AccessDenied({ requiredRole = 'Admin' }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth?.user);

  const handleSignOutAndSwitch = async () => {
    await dispatch(logoutUser());
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-8 font-['Poppins'] selection:bg-rose-600 selection:text-white">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm text-center relative overflow-hidden">
        {/* Soft top border accent */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-rose-500 to-amber-500" />

        <div className="mb-4 flex justify-center">
          <Logo size="md" linkTo="/" />
        </div>

        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto mb-4 shadow-xs">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300 mb-2">
          403 • Access Restricted
        </span>

        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          Executive Portal Access Denied
        </h1>

        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          The signed-in account <strong>{user?.email || 'Guest User'}</strong> does not possess the required <strong>{requiredRole}</strong> clearance to manage international export operations.
        </p>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 my-5 text-left text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-slate-400">Authenticated Email:</span>
            <span className="font-mono font-semibold text-slate-700 truncate max-w-[200px]">{user?.email || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Current System Role:</span>
            <span className="font-semibold text-amber-700 capitalize">{user?.role || 'Customer'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Super Admin Contact:</span>
            <span className="font-mono text-slate-600">divagar.m.msc.cs@gmail.com</span>
          </div>
        </div>

        <div className="space-y-2.5">
          <button
            type="button"
            onClick={handleSignOutAndSwitch}
            className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Switch to Authorized Admin Account</span>
          </button>

          <a
            href="/"
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <Store className="w-4 h-4 text-slate-500" />
            <span>Return to Dhanvikk Storefront</span>
          </a>
        </div>
      </div>
    </div>
  );
}
