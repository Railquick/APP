import React, { useState } from 'react';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { OtpModal } from '../components/OtpModal';
import { sounds } from '../services/soundEffects';

interface LoginScreenProps {
  onLoginSuccess: (phoneNumber: string) => void;
  onSkip?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, onSkip }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [activeModalTitle, setActiveModalTitle] = useState('');

  const isComplete = phoneNumber.length === 10;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(raw);
  };

  const handleProceed = () => {
    if (!phoneNumber) {
      setPhoneNumber('9876543210');
      sounds.tap();
      setShowOtpModal(true);
      return;
    }
    sounds.tap();
    setShowOtpModal(true);
  };

  const handleGoogleLogin = () => {
    sounds.tap();
    onLoginSuccess('9876543210');
  };

  const handleOpenLegal = (title: string) => {
    sounds.tap();
    setActiveModalTitle(title);
    setShowTermsModal(true);
  };

  return (
    <div className="relative w-full h-full min-h-[720px] bg-white flex flex-col justify-between overflow-y-auto no-scrollbar">
      {/* 1. Top Products Mosaic (Exact High-Resolution Product Artwork from Design Mockup) */}
      <div className="w-full relative shrink-0">
        <img
          src="/extracted_designs/mockup_products_top.png"
          alt="RailQuick Fresh Essentials Mosaic"
          className="w-full h-auto object-contain select-none"
        />

        {/* Guest Skip Pill */}
        {onSkip && (
          <button
            onClick={() => {
              sounds.tap();
              onSkip();
            }}
            className="absolute top-3 right-3 text-[11px] font-bold text-slate-500 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full shadow-2xs hover:bg-white active:scale-95 transition-all"
          >
            Guest View
          </button>
        )}
      </div>

      {/* 2. Login Form (Exact Replica of Mockup Screen 2) */}
      <div className="w-full px-6 pb-6 pt-1 flex flex-col items-center">
        {/* Main Headline */}
        <h1 className="text-[23px] font-black text-slate-950 text-center tracking-tight mb-3">
          India’s Train delivery app
        </h1>

        {/* Divider: "Log in or sign up" */}
        <div className="w-full flex items-center gap-3 mb-3.5">
          <div className="flex-1 h-[1px] bg-slate-200"></div>
          <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">
            Log in or sign up
          </span>
          <div className="flex-1 h-[1px] bg-slate-200"></div>
        </div>

        {/* Phone Input Box */}
        <div className="w-full mb-3">
          <div className="flex items-center w-full px-3.5 py-3 border border-slate-300 rounded-2xl bg-white shadow-2xs focus-within:border-slate-800 transition-all">
            {/* Country Flag + Chevron */}
            <div className="flex items-center gap-1.5 pr-2.5 border-r border-slate-200 shrink-0 cursor-pointer">
              {/* India Flag SVG */}
              <div className="w-6 h-4.5 rounded-xs overflow-hidden shadow-2xs flex flex-col border border-slate-200">
                <div className="h-1.5 bg-[#FF9933]"></div>
                <div className="h-1.5 bg-white relative flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full border border-[#000080] flex items-center justify-center">
                    <div className="w-0.5 h-0.5 rounded-full bg-[#000080]"></div>
                  </div>
                </div>
                <div className="h-1.5 bg-[#128807]"></div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </div>

            {/* Code +91 */}
            <span className="pl-3 pr-2 text-sm font-bold text-slate-900 shrink-0">
              +91
            </span>

            {/* Input */}
            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={phoneNumber}
              onChange={handlePhoneChange}
              placeholder="Enter Phone Number"
              className="w-full bg-transparent text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Primary Coral Red Button matching Mockup 2 */}
        <button
          onClick={handleProceed}
          className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm tracking-wide text-white transition-all shadow-sm flex items-center justify-center gap-2 active:scale-98 ${
            isComplete
              ? 'bg-[#e23744] hover:bg-[#d02c39] shadow-red-500/25 shadow-md'
              : 'bg-[#f04f5f] hover:bg-[#e23744]'
          }`}
        >
          <span>{isComplete ? 'Continue' : 'Enter Phone Number'}</span>
          {isComplete && <ArrowRight className="w-4 h-4" />}
        </button>

        {/* Divider: "or" */}
        <div className="my-2.5 text-xs font-semibold text-slate-400">or</div>

        {/* Social Auth Circles */}
        <div className="flex items-center justify-center gap-4 mb-4">
          {/* Google Button */}
          <button
            onClick={handleGoogleLogin}
            title="Continue with Google"
            className="w-11 h-11 rounded-full border border-slate-200 bg-white shadow-2xs hover:border-slate-300 hover:shadow-xs active:scale-95 transition-all flex items-center justify-center"
          >
            {/* Google 'G' Multi-color SVG */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
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
          </button>

          {/* More options circular button ("...") */}
          <button
            onClick={() => {
              sounds.tap();
              alert('More login options (Truecaller, Apple ID, SMS) will connect when you plug your backend!');
            }}
            title="More Options"
            className="w-11 h-11 rounded-full border border-slate-200 bg-white shadow-2xs hover:border-slate-300 hover:shadow-xs active:scale-95 transition-all flex items-center justify-center text-slate-700 font-black tracking-widest text-base"
          >
            •••
          </button>
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
            <button
              onClick={() => handleOpenLegal('Privacy Policy')}
              className="underline hover:text-slate-900"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => handleOpenLegal('Content Policy')}
              className="underline hover:text-slate-900"
            >
              Content Policy
            </button>
          </div>
        </div>
      </div>

      {/* OTP Verification Bottom Sheet */}
      <OtpModal
        isOpen={showOtpModal}
        phoneNumber={phoneNumber}
        onClose={() => setShowOtpModal(false)}
        onSuccess={() => {
          setShowOtpModal(false);
          onLoginSuccess(phoneNumber || '9876543210');
        }}
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
              RailQuick ensures passenger safety and hygiene for deliveries straight to your train coach or platform seat across Indian Railway junctions.
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
