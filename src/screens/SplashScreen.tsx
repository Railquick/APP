import React, { useEffect } from 'react';
import { sounds } from '../services/soundEffects';

interface SplashScreenProps {
  onContinue: () => void;
  onSkip?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onContinue }) => {
  useEffect(() => {
    sounds.trainHorn();
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
      className="relative w-full h-full bg-white flex items-center justify-center cursor-pointer select-none overflow-hidden"
    >
      {/* Exact Splash Screen Artwork fitting 100% of mobile screen */}
      <img
        src="/extracted_designs/mockup_screen_1.png"
        alt="RailQuick Splash"
        className="w-full h-full object-contain object-center select-none animate-in fade-in duration-500"
      />
    </div>
  );
};
