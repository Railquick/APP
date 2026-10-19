import React, { useState } from 'react';
import { ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { GoogleAuthModal } from '../components/GoogleAuthModal';
import { sounds } from '../services/soundEffects';
import { UserProfile } from '../types';

interface LoginScreenProps {
  onLoginSuccess: (userOrPhone: string | UserProfile) => void;
  onSkip?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, onSkip }) => {
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [activeModalTitle, setActiveModalTitle] = useState('');

  const handleGoogleSuccess = (user: UserProfile) => {
    setShowGoogleModal(false);
    onLoginSuccess(user);
  };

  const handleQuickGuest = () => {
    sounds.tap();
    onLoginSuccess('Guest Passenger');
  };

  const handleOpenLegal = (title: string) => {
    sounds.tap();
    setActiveModalTitle(title);
    setShowTermsModal(true);
  };

  return (
    <div className="relative w-full h-full bg-white flex flex-col justify-between overflow-y-auto no-scrollbar select-none animate-in fade-in duration-500">
      {/* 1. Top Products Mosaic Showcase (Matching Figma Mockup) */}
      <div className="w-full flex-1 min-h-0 flex items-center justify-center relative p-2 overflow-hidden">
        <img
          src="/extracted_designs/mockup_products_top.png"
          alt="RailQuick Fresh Essentials Mosaic"
          className="w-full h-full max-h-[48vh] object-contain select-none transition-transform duration-700 hover:scale-[1.02]"
        />

        {/* Guest Skip Badge in top corner */}
        {onSkip && (
          <button
            onClick={() => {
              sounds.tap();
              onSkip();
            }}
            className="absolute top-3 right-3 text-[11px] font-bold text-slate-500 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full shadow-xs border border-slate-200/80 hover:bg-white active:scale-95 transition-all"
          >
            Explore App →
          </button>
        )}
      </div>

      {/* 2. Login Section (Redesigned with Prominent Google Login as requested) */}
      <div className="w-full px-6 pb-6 pt-1 flex flex-col items-center shrink-0">
        {/* Brand Headline */}
        <h1 className="text-[23px] sm:text-[25px] font-black text-slate-900 text-center tracking-tight leading-snug">
          India’s Train delivery app
        </h1>

        <p className="text-xs text-slate-500 mt-1 mb-5 text-center flex items-center gap-1.5 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          10-Minute On-Seat Delivery Across Indian Railways
        </p>

        {/* Prominent, Beautiful Google Login Button */}
        <button
          onClick={() => {
            sounds.tap();
            setShowGoogleModal(true);
          }}
          className="w-full bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-300 active:border-emerald-600 active:scale-[0.98] py-3.5 px-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-3.5 group cursor-pointer"
        >
          {/* Official Google 'G' Logo SVG */}
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
          <span className="text-[15px] font-bold text-slate-800 group-hover:text-slate-950">
            Continue with Google
          </span>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-transform ml-auto" />
        </button>

        {/* Quick Guest Access Link */}
        <button
          onClick={handleQuickGuest}
          className="mt-3.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 py-1 transition-colors"
        >
          Skip and continue as Guest →
        </button>

        {/* Security Badge */}
        <div className="mt-3 mb-4 flex items-center gap-1.5 text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>One-Tap Secure Login</span>
        </div>

        {/* Footer Legal Copy */}
        <div className="text-center text-[10px] text-slate-500 max-w-[280px] leading-relaxed">
          <p>By continuing, you agree to our</p>
          <div className="flex items-center justify-center gap-1.5 flex-wrap mt-0.5 font-medium text-slate-700">
            <button
              onClick={() => handleOpenLegal('Terms of Service')}
              className="underline hover:text-slate-900"
            >
              Terms of Service
            </button>
            <span>•</span>
            <button
              onClick={() => handleOpenLegal('Privacy Policy')}
              className="underline hover:text-slate-900"
            >
              Privacy Policy
            </button>
            <span>•</span>
            <button
              onClick={() => handleOpenLegal('Content Policy')}
              className="underline hover:text-slate-900"
            >
              Content Policy
            </button>
          </div>
        </div>
      </div>

      {/* Google Sign-in Modal Sheet */}
      <GoogleAuthModal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        onSuccess={handleGoogleSuccess}
      />

      {/* Legal Info Simple Modal */}
      {showTermsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onClick={() => setShowTermsModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-slate-900 mb-2">{activeModalTitle}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              RailQuick delivers fresh hot meals, beverages, snacks and travel essentials straight to your train berth across Indian Railway junctions.
            </p>
            <button
              onClick={() => setShowTermsModal(false)}
              className="mt-4 w-full bg-[#008b3e] text-white font-bold py-3 rounded-xl text-xs active:scale-98"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
