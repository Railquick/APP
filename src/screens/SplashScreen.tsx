import React, { useEffect } from 'react';
import { sounds } from '../services/soundEffects';

interface SplashScreenProps {
  onContinue: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onContinue }) => {
  useEffect(() => {
    sounds.trainHorn();

    // Auto-advance to Login screen after 2 seconds (1-3 seconds range requested)
    const timer = setTimeout(() => {
      onContinue();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <div
      onClick={() => {
        sounds.tap();
        onContinue();
      }}
      className="relative w-full h-full bg-white flex flex-col items-center justify-center cursor-pointer select-none overflow-hidden animate-in fade-in duration-500"
    >
      {/* Exact Splash Screen Artwork fitting 100% of mobile screen */}
      <img
        src="/extracted_designs/mockup_screen_1.png"
        alt="RailQuick Splash"
        className="w-full h-full object-contain object-center select-none"
      />

      {/* Subtle loader bar at the bottom */}
      <div className="absolute bottom-6 inset-x-0 flex flex-col items-center gap-2 pointer-events-none">
        <div className="w-24 h-1 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#008b3e] rounded-full animate-[pulse_1.5s_ease-in-out_infinite] w-full"></div>
        </div>
        <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
          Loading RailQuick...
        </span>
      </div>
    </div>
  );
};
