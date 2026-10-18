import React, { useState } from 'react';
import { X, CheckCircle, ShieldCheck } from 'lucide-react';
import { sounds } from '../services/soundEffects';
import { authService } from '../services/auth';
import { UserProfile } from '../types';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSelectAccount = async (name: string, email: string) => {
    sounds.tap();
    setLoading(true);

    try {
      const res = await authService.loginWithGoogle();
      sounds.success();
      setTimeout(() => {
        setLoading(false);
        onSuccess({
          ...res.user,
          name,
          email,
        });
      }, 400);
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div
        className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl relative animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 active:scale-90 transition-transform rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Google Header */}
        <div className="flex items-center gap-2.5 mb-2">
          {/* Google G Logo */}
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span className="text-sm font-bold text-slate-800">Sign in with Google</span>
        </div>

        <h3 className="text-base font-black text-slate-900 mt-2">Choose an account</h3>
        <p className="text-xs text-slate-500 mb-4">to continue to <strong className="text-slate-800">RailQuick</strong></p>

        {loading ? (
          <div className="py-8 flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3"></div>
            <span className="text-xs font-bold text-slate-600">Signing you in securely...</span>
          </div>
        ) : (
          <div className="space-y-2 mb-4">
            {/* Account 1 */}
            <div
              onClick={() => handleSelectAccount('Kartik Guleria', 'kartik.guleria@gmail.com')}
              className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 border border-slate-200/80 cursor-pointer active:scale-98 transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold text-base flex items-center justify-center shadow-xs">
                K
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-slate-900">Kartik Guleria</div>
                <div className="text-[11px] text-slate-500 font-mono">kartik.guleria@gmail.com</div>
              </div>
            </div>

            {/* Account 2 */}
            <div
              onClick={() => handleSelectAccount('Passenger Travel', 'passenger@gmail.com')}
              className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 border border-slate-200/80 cursor-pointer active:scale-98 transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-base flex items-center justify-center shadow-xs">
                P
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-slate-900">Passenger Travel</div>
                <div className="text-[11px] text-slate-500 font-mono">passenger@gmail.com</div>
              </div>
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1 text-emerald-700 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" /> 256-bit Secure Google OAuth
          </span>
          <span>Ready for Backend</span>
        </div>
      </div>
    </div>
  );
};
