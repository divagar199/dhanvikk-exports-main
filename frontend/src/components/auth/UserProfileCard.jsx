import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { logoutUser } from '../../store/slices/authSlice';
import { logOutFirebase } from '../../config/firebase';

/**
 * UserProfileCard
 *
 * Displays the signed-in user's avatar, display name, and email.
 * Provides a branded "Sign Out" button that:
 *   1. Signs out from Firebase Auth (clears the session token).
 *   2. Clears Redux auth state.
 *   3. Clears localStorage / sessionStorage tokens.
 *   4. Notifies the user via a toast.
 *
 * Props:
 *   onLogout  – optional callback called after successful sign-out
 *   compact   – renders a condensed single-row layout (for navbars)
 */
export default function UserProfileCard({ onLogout, compact = false }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [signingOut, setSigningOut] = useState(false);

  if (!user) return null;

  const displayName = user.name || user.displayName || 'Customer';
  const email = user.email || '';
  const avatarUrl = user.avatar || user.photoURL || '';
  const initials = displayName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('');

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      // 1. Sign out from Firebase (invalidates the token, clears local session)
      await logOutFirebase();
      // 2. Clear Redux + localStorage
      await dispatch(logoutUser());
      toast.success('Signed out successfully. See you again! 🌸');
      if (typeof onLogout === 'function') onLogout();
    } catch (err) {
      console.error('[UserProfileCard] Sign-out error:', err);
      toast.error('Sign-out failed. Please try again.');
    } finally {
      setSigningOut(false);
    }
  };

  /* ── Compact layout (navbar pill) ──────────────────────────────────────── */
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {/* Avatar */}
        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#E8D5C4] flex-shrink-0 bg-[#FFF0F5]">
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            <span className="flex items-center justify-center w-full h-full text-[11px] font-bold text-[#C2185B]">
              {initials || '🌸'}
            </span>
          )}
        </div>

        {/* Name */}
        <span className="text-[13px] font-semibold text-[#2E282A] hidden sm:block max-w-[120px] truncate">
          {displayName.split(' ')[0]}
        </span>

        {/* Sign-out button */}
        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className="text-[11px] text-[#888] hover:text-[#C2185B] font-medium transition-colors disabled:opacity-50 cursor-pointer"
          aria-label="Sign out"
        >
          {signingOut ? '…' : 'Sign out'}
        </button>
      </div>
    );
  }

  /* ── Full card layout ───────────────────────────────────────────────────── */
  return (
    <div className="w-full bg-white border border-[#EFE7DE] rounded-2xl p-5 shadow-[0_8px_24px_rgba(194,24,91,0.06)]">
      {/* Avatar + Info row */}
      <div className="flex items-center gap-4 mb-4">
        {/* Avatar */}
        <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-[#F8BBD0] flex-shrink-0 bg-[#FFF0F5]">
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <span className="flex items-center justify-center w-full h-full text-xl font-bold text-[#C2185B]">
              {initials || '🌸'}
            </span>
          )}
          {/* Online dot */}
          <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full" aria-label="Online" />
        </div>

        {/* Name & email */}
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-bold text-[#1F191D] truncate">{displayName}</p>
          <p className="text-[12px] text-[#888888] truncate mt-0.5">{email}</p>
          {user.provider === 'google' || user.provider === 'google.com' ? (
            <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-[#F5F5F5] rounded-full text-[10px] font-medium text-[#555]">
              {/* mini Google G */}
              <svg width="10" height="10" viewBox="0 0 18 18" aria-hidden="true">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
              </svg>
              Google Account
            </span>
          ) : null}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[#F2ECE6] mb-4" />

      {/* Sign-out button */}
      <button
        type="button"
        onClick={handleSignOut}
        disabled={signingOut}
        className={[
          'w-full flex items-center justify-center gap-2 h-10 rounded-xl',
          'border border-[#FECDD3] text-[13px] font-semibold text-[#C2185B]',
          'hover:bg-[#FFF0F5] hover:border-[#F9A8D4] active:bg-[#FCE7F3]',
          'transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EC407A]',
          signingOut ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
        ].join(' ')}
        aria-label="Sign out of your account"
      >
        {signingOut ? (
          <>
            <svg className="animate-spin w-4 h-4 text-[#C2185B]" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            Signing out…
          </>
        ) : (
          <>
            {/* Arrow-right-from-bracket icon */}
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign Out
          </>
        )}
      </button>
    </div>
  );
}

