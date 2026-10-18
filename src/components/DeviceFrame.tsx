import React, { useState } from 'react';
import { Smartphone, Monitor, Columns, Volume2, VolumeX, Sparkles, RefreshCw } from 'lucide-react';
import { ScreenId, Station } from '../types';
import { sounds } from '../services/soundEffects';

interface DeviceFrameProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  currentStation: Station;
  onReset: () => void;
  children: React.ReactNode;
  renderAllSideBySide?: React.ReactNode;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({
  currentScreen,
  onNavigate,
  onReset,
  children,
  renderAllSideBySide,
}) => {
  const [viewMode, setViewMode] = useState<'phone' | 'fullscreen' | 'side-by-side'>('phone');
  const [soundEnabled, setSoundEnabled] = useState(true);

  const now = new Date();
  const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  const toggleSound = () => {
    sounds.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
    if (!soundEnabled) sounds.tap();
  };

  return (
    <div className="min-h-screen bg-[#0F141C] text-slate-100 flex flex-col items-center justify-start p-2 sm:p-4 selection:bg-emerald-500">
      {/* Sleek Floating Control Bar */}
      <header className="w-full max-w-4xl mb-3 bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-2.5 flex flex-wrap items-center justify-between gap-2 shadow-2xl z-50">
        {/* Brand */}
        <div className="flex items-center gap-2.5 pl-1">
          <div className="w-8 h-8 rounded-xl bg-[#008b3e] flex items-center justify-center text-white font-black text-sm shadow-sm">
            RQ
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-white text-sm tracking-tight">RailQuick</span>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.2 rounded-full border border-emerald-500/30">
                Pixel-Exact
              </span>
            </div>
          </div>
        </div>

        {/* Screen Switcher Pills */}
        <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800 overflow-x-auto no-scrollbar">
          <button
            onClick={() => {
              sounds.tap();
              setViewMode('phone');
              onNavigate('splash');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              currentScreen === 'splash' && viewMode !== 'side-by-side'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ⚡ Splash
          </button>
          <button
            onClick={() => {
              sounds.tap();
              setViewMode('phone');
              onNavigate('login');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              currentScreen === 'login' && viewMode !== 'side-by-side'
                ? 'bg-[#e23744] text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            📱 Login
          </button>
          <button
            onClick={() => {
              sounds.tap();
              setViewMode('phone');
              onNavigate('coming-soon');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              currentScreen === 'coming-soon' && viewMode !== 'side-by-side'
                ? 'bg-[#008b3e] text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🚉 Coming Soon
          </button>
          <button
            onClick={() => {
              sounds.tap();
              setViewMode('phone');
              onNavigate('live-store');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              currentScreen === 'live-store' && viewMode !== 'side-by-side'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🛒 Live Store (NDLS)
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* Side-by-Side Comparison Toggle */}
          <button
            onClick={() => {
              sounds.tap();
              setViewMode(viewMode === 'side-by-side' ? 'phone' : 'side-by-side');
            }}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              viewMode === 'side-by-side'
                ? 'bg-amber-400 text-slate-950 font-black'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            title="View all 3 mockup screens side by side"
          >
            <Columns className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Side-by-Side</span>
          </button>

          {/* Toggle Full Screen vs Phone Simulator */}
          <button
            onClick={() => {
              sounds.tap();
              setViewMode(viewMode === 'phone' ? 'fullscreen' : 'phone');
            }}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all"
            title={viewMode === 'phone' ? 'Full Screen View' : 'Phone Bezel View'}
          >
            {viewMode === 'phone' ? <Smartphone className="w-4 h-4 text-emerald-400" /> : <Monitor className="w-4 h-4" />}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all"
            title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Reset */}
          <button
            onClick={() => {
              sounds.tap();
              onReset();
            }}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all"
            title="Reset App"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main View Area */}
      {viewMode === 'side-by-side' && renderAllSideBySide ? (
        <div className="w-full max-w-7xl pb-10 animate-in fade-in duration-300">
          <div className="mb-4 text-center">
            <h2 className="text-xl font-black text-white flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              1:1 Side-by-Side Comparison (Exact Mockup Match)
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Splash Screen • Login Onboarding • Coming Soon Station
            </p>
          </div>
          {renderAllSideBySide}
        </div>
      ) : viewMode === 'phone' ? (
        /* Native iPhone Phone Simulator */
        <div className="relative my-auto pb-8 flex flex-col items-center">
          <div className="relative w-[385px] sm:w-[395px] h-[835px] sm:h-[845px] bg-[#000000] rounded-[52px] p-[10px] shadow-[0_25px_80px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.1)] ring-1 ring-slate-800">
            {/* Inner Screen Display */}
            <div className="relative w-full h-full bg-white rounded-[42px] overflow-hidden flex flex-col">
              {/* Dynamic Island & iOS Status Bar */}
              <div className="w-full h-10 px-7 flex items-center justify-between bg-transparent z-40 select-none text-slate-900 text-[11px] font-bold pt-1">
                <span>{timeString}</span>
                {/* Dynamic Island */}
                <div className="w-24 h-5.5 bg-black rounded-full flex items-center justify-end px-2 gap-1.5 shadow-sm">
                  <div className="w-2.5 h-2.5 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-indigo-950"></div>
                  </div>
                </div>
                {/* Status Icons */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono font-bold">5G</span>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4C7.31 4 3.07 5.9 0 8.98L12 21 24 8.98C20.93 5.9 16.69 4 12 4zm0 3.5c3.74 0 7.15 1.48 9.69 3.91L12 19.38 2.31 11.41C4.85 8.98 8.26 7.5 12 7.5z"/>
                  </svg>
                  <div className="w-5 h-2.5 border border-slate-900 rounded-sm p-0.5 flex items-center">
                    <div className="h-full w-full bg-slate-900 rounded-xs"></div>
                  </div>
                </div>
              </div>

              {/* Mobile Screen Body */}
              <div className="flex-1 w-full overflow-y-auto relative no-scrollbar">
                {children}
              </div>

              {/* Home Indicator */}
              <div className="w-full h-4 bg-transparent flex items-center justify-center z-40 select-none pb-1">
                <div className="w-32 h-1 bg-slate-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Full Screen Mobile View */
        <div className="w-full max-w-md mx-auto min-h-[760px] bg-white rounded-3xl shadow-2xl overflow-hidden my-3">
          {children}
        </div>
      )}
    </div>
  );
};
