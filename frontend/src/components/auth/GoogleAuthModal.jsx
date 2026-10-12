import React, { useState, useEffect } from 'react';
import { X, User, Plus, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import Spinner from '../common/Spinner';

const GOOGLE_G_LOGO = 'https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png';

export default function GoogleAuthModal({
  isOpen,
  onClose,
  onSelectAccount,
  loading = false,
  error = '',
}) {
  const [accounts, setAccounts] = useState([]);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setFormError('');
    setShowCustomInput(false);

    try {
      const raw = localStorage.getItem('dhanvikk_saved_accounts');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAccounts(parsed);
          return;
        }
      }
    } catch {}

    // Default accounts for immediate testing
    setAccounts([
      {
        name: 'Google Customer',
        email: 'customer@gmail.com',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      },
    ]);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAccountClick = (acc) => {
    onSelectAccount({
      email: acc.email,
      name: acc.name || acc.email.split('@')[0],
      avatar: acc.avatar || '',
    });
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    const cleanEmail = customEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setFormError('Please enter a valid Google or Gmail address.');
      return;
    }
    const cleanName = customName.trim() || cleanEmail.split('@')[0];
    onSelectAccount({
      email: cleanEmail,
      name: cleanName,
      avatar: `https://unavatar.io/google/${encodeURIComponent(cleanEmail)}`,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[400px] bg-[#1F1F1F] text-white rounded-3xl p-6 shadow-2xl border border-white/10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img src={GOOGLE_G_LOGO} alt="Google" className="w-6 h-6 object-contain" />
            <div>
              <h3 className="text-[15px] font-medium text-white tracking-tight">Sign in with Google</h3>
              <p className="text-[11.5px] text-[#9AA0A6]">Choose an account to continue</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-full hover:bg-white/10 text-[#9AA0A6] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Alert */}
        {(error || formError) && (
          <div className="mt-3.5 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
            <span>{error || formError}</span>
          </div>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="py-6 flex flex-col items-center justify-center gap-2.5">
            <Spinner size="md" color="#8AB4F8" />
            <span className="text-xs text-[#9AA0A6]">Connecting to Google Identity...</span>
          </div>
        )}

        {!loading && !showCustomInput && (
          <div className="mt-4 space-y-2">
            {/* Accounts list */}
            {accounts.map((acc, idx) => (
              <button
                key={acc.email || idx}
                type="button"
                onClick={() => handleAccountClick(acc)}
                className="w-full p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 flex items-center justify-between transition-all cursor-pointer text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#4285F4] text-white flex items-center justify-center font-bold text-xs uppercase overflow-hidden border border-white/20">
                    {acc.avatar ? (
                      <img src={acc.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      (acc.name || acc.email)[0]
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white group-hover:text-[#8AB4F8] transition-colors">
                      {acc.name || acc.email.split('@')[0]}
                    </p>
                    <p className="text-[11px] text-[#9AA0A6]">{acc.email}</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#9AA0A6] group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </button>
            ))}

            {/* Use another account button */}
            <button
              type="button"
              onClick={() => setShowCustomInput(true)}
              className="w-full py-2.5 px-3 rounded-2xl hover:bg-white/5 border border-dashed border-white/15 hover:border-white/30 flex items-center justify-center gap-2 text-xs font-medium text-[#8AB4F8] hover:text-[#A8C7FA] transition-all cursor-pointer mt-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Use another Google account</span>
            </button>
          </div>
        )}

        {!loading && showCustomInput && (
          <form onSubmit={handleCustomSubmit} className="mt-4 space-y-3">
            <div>
              <label className="block text-[11px] font-medium text-[#9AA0A6] mb-1">
                Google / Gmail Address
              </label>
              <input
                type="email"
                required
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="yourname@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 focus:border-[#8AB4F8] focus:ring-1 focus:ring-[#8AB4F8] text-white text-xs outline-none transition-all placeholder:text-white/30"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#9AA0A6] mb-1">
                Display Name (Optional)
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Your Name"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 focus:border-[#8AB4F8] focus:ring-1 focus:ring-[#8AB4F8] text-white text-xs outline-none transition-all placeholder:text-white/30"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowCustomInput(false)}
                className="flex-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-[#9AA0A6] hover:text-white transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 py-2 px-3 rounded-xl bg-[#8AB4F8] hover:bg-[#A8C7FA] text-xs font-semibold text-[#1F1F1F] transition-colors cursor-pointer"
              >
                Continue
              </button>
            </div>
          </form>
        )}

        {/* Security Footer Note */}
        <div className="mt-5 pt-3.5 border-t border-white/10 flex items-center justify-between text-[10.5px] text-[#9AA0A6]">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3 text-[#34A853]" />
            Secure Google OAuth Session
          </span>
          <span>Dhanvikk Blooms</span>
        </div>
      </div>
    </div>
  );
}
