import React, { useState } from 'react';
import { GoogleAuthModal } from '../components/GoogleAuthModal';
import { sounds } from '../services/soundEffects';
import { UserProfile } from '../types';

interface LoginScreenProps {
  onLoginSuccess: (userOrPhone: string | UserProfile) => void;
  onSkip?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, onSkip }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [activeModalTitle, setActiveModalTitle] = useState('');

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(raw);
  };

  const handleProceed = () => {
    sounds.success();
    const phone = phoneNumber || '9876543210';
    onLoginSuccess(phone);
  };

  const handleGoogleSuccess = (user: UserProfile) => {
    setShowGoogleModal(false);
    onLoginSuccess(user);
  };

  return (
    <div className="w-full h-full bg-white flex items-center justify-center overflow-hidden select-none relative">
      {/* Aspect-Locked Container (1125/2400) - Exact same size for all 3 pages */}
      <div className="relative aspect-[1125/2400] w-full h-full max-w-full max-h-full flex items-center justify-center">
        {/* Full-Bleed Exact Figma Screen 2 Artwork */}
        <img
          src="/extracted_designs/mockup_screen_2.png"
          alt="RailQuick Login & Onboarding"
          className="w-full h-full object-contain select-none pointer-events-none"
        />

        {/* --- Interactive Hotspots over the Exact Figma Elements --- */}

        {/* 1. Interactive Phone Input Overlay */}
        <div className="absolute top-[67%] left-[34%] w-[54%] h-[5.2%] flex items-center">
          <input
            type="tel"
            inputMode="numeric"
            maxLength={10}
            value={phoneNumber}
            onChange={handlePhoneChange}
            placeholder=""
            className="w-full h-full bg-transparent text-[13px] sm:text-[14px] font-bold text-slate-900 focus:outline-none tracking-wider"
            title="Type 10-digit phone number"
          />
        </div>

        {/* 2. Coral Red Primary Button: "Enter Phone Number" / "Continue" */}
        <button
          type="button"
          onClick={handleProceed}
          className="absolute top-[74.6%] left-[10.5%] w-[79%] h-[5.6%] rounded-2xl cursor-pointer active:scale-[0.98] active:brightness-95 transition-all focus:outline-none"
          title="Login / Continue"
        >
          <span className="sr-only">Enter Phone Number / Continue</span>
        </button>

        {/* 3. Google Login Circular Button ('G') */}
        <button
          type="button"
          onClick={() => {
            sounds.tap();
            setShowGoogleModal(true);
          }}
          className="absolute top-[85.6%] left-[37.8%] w-[11.2%] h-[5.2%] rounded-full cursor-pointer active:scale-90 transition-transform focus:outline-none"
          title="Sign in with Google"
        >
          <span className="sr-only">Sign in with Google</span>
        </button>

        {/* 4. More Options Circular Button ('...') */}
        <button
          type="button"
          onClick={() => {
            sounds.tap();
            handleProceed();
          }}
          className="absolute top-[85.6%] left-[54.8%] w-[11.2%] h-[5.2%] rounded-full cursor-pointer active:scale-90 transition-transform focus:outline-none"
          title="Quick Login"
        >
          <span className="sr-only">Quick Login</span>
        </button>

        {/* 5. Legal Terms Footer Links */}
        <button
          type="button"
          onClick={() => {
            sounds.tap();
            setActiveModalTitle('Terms & Privacy Policy');
            setShowTermsModal(true);
          }}
          className="absolute bottom-[2.5%] left-[18%] w-[64%] h-[4.5%] cursor-pointer active:opacity-60 transition-opacity focus:outline-none"
          title="Terms of Service & Privacy Policy"
        >
          <span className="sr-only">Terms of Service Privacy Policy</span>
        </button>
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
