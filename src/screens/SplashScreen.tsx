import React, { useEffect } from 'react';
import { sounds } from '../services/soundEffects';

interface SplashScreenProps {
  onContinue: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onContinue }) => {
  useEffect(() => {
    sounds.trainHorn();
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
      className="w-full h-full bg-white flex items-center justify-center overflow-hidden cursor-pointer select-none relative"
      title="Tap to continue to Login"
    >
      {/* Aspect-Locked Container (1125/2400) - Exact same size for all 3 pages */}
      <div className="relative aspect-[1125/2400] w-full h-full max-w-full max-h-full flex items-center justify-center">
        <img
          src="/extracted_designs/mockup_screen_1.png"
          alt="RailQuick Splash Screen"
          className="w-full h-full object-contain select-none pointer-events-none"
        />
      </div>
    </div>
  );
};
