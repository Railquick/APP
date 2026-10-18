import React, { useEffect } from 'react';
import { sounds } from '../services/soundEffects';

interface SplashScreenProps {
  onContinue: () => void;
  onSkip?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onContinue }) => {
  useEffect(() => {
    sounds.trainHorn();
    // Auto transition to login after 2.2 seconds
    const timer = setTimeout(() => {
      onContinue();
    }, 2200);

    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <div
      onClick={() => {
        sounds.tap();
        onContinue();
      }}
      className="relative w-full h-full min-h-[720px] bg-white flex flex-col items-center justify-center cursor-pointer select-none overflow-hidden"
    >
      {/* Exact Splash Screen Artwork matching Mockup 1 */}
      <img
        src="/extracted_designs/mockup_screen_1.png"
        alt="RailQuick Splash"
        className="w-full h-full object-contain select-none animate-in fade-in duration-500"
      />

      {/* Subtle Bottom Tap Prompt */}
      <div className="absolute bottom-6 inset-x-0 flex flex-col items-center gap-1.5 pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#008b3e] animate-ping"></span>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            Fastest 10-Min Train Delivery
          </span>
        </div>
        <span className="text-[10px] text-slate-300">Tap anywhere to enter</span>
      </div>
    </div>
  );
};
