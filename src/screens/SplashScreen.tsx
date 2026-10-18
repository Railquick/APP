import React, { useEffect } from 'react';
import { RailQuickLogo } from '../components/RailQuickLogo';
import { sounds } from '../services/soundEffects';
import { Volume2, VolumeX, ArrowRight } from 'lucide-react';

interface SplashScreenProps {
  onContinue: () => void;
  onSkip?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onContinue, onSkip }) => {
  const [soundOn, setSoundOn] = React.useState(true);

  useEffect(() => {
    // Gentle train whistle on splash entrance
    const timer = setTimeout(() => {
      sounds.trainHorn();
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.enabled = !soundOn;
    setSoundOn(!soundOn);
    if (!soundOn) {
      sounds.trainHorn();
    }
  };

  return (
    <div
      onClick={onContinue}
      className="relative w-full h-full min-h-[640px] bg-white flex flex-col items-center justify-between p-8 select-none cursor-pointer overflow-hidden transition-all duration-500"
    >
      {/* Top Utility Bar */}
      <div className="w-full flex items-center justify-between z-10 pt-2">
        <button
          onClick={toggleSound}
          className="p-2 rounded-full bg-slate-50 border border-slate-100 text-slate-500 hover:text-slate-800 active:scale-90 transition-transform"
          title={soundOn ? 'Sound On' : 'Muted'}
        >
          {soundOn ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onContinue();
          }}
          className="text-xs font-bold text-slate-400 hover:text-slate-700 px-3 py-1.5 rounded-full hover:bg-slate-50 transition-colors flex items-center gap-1"
        >
          <span>Skip</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Center Brand Identity (Exact match to Mockup Screen 1) */}
      <div className="flex-1 flex flex-col items-center justify-center animate-in zoom-in-95 duration-700">
        <RailQuickLogo size="xl" showSubtitle={true} />

        {/* Ambient speed glow lines */}
        <div className="mt-8 flex items-center gap-1.5 opacity-60">
          <span className="w-2 h-2 rounded-full bg-[#008b3e] animate-ping"></span>
          <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
            Fastest 10-Min Delivery on Indian Tracks
          </span>
        </div>
      </div>

      {/* Bottom Action / Tap Prompt */}
      <div className="w-full flex flex-col items-center gap-3 pb-6 z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            sounds.tap();
            onContinue();
          }}
          className="w-full max-w-xs bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 active:scale-98 transition-all"
        >
          <span>Get Started</span>
          <ArrowRight className="w-4 h-4 text-emerald-400" />
        </button>
        <span className="text-[11px] text-slate-400">Tap anywhere to enter</span>
      </div>
    </div>
  );
};
