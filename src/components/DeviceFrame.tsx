import React, { useState } from 'react';
import { Smartphone, Monitor, Columns, Volume2, VolumeX, RefreshCw, Sparkles, ExternalLink } from 'lucide-react';
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
  currentStation,
  onReset,
  children,
  renderAllSideBySide,
}) => {
  const [viewMode, setViewMode] = useState<'phone' | 'fullscreen' | 'side-by-side'>('phone');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Live formatted time for status bar
  const now = new Date();
  const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  const toggleSound = () => {
    sounds.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
    if (!soundEnabled) sounds.tap();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-neutral-950 text-slate-100 flex flex-col items-center justify-start p-2 sm:p-4 select-none">
      {/* Top Application Control Toolbar */}
      <header className="w-full max-w-5xl mb-4 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        {/* Brand & Status */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-green-700 flex items-center justify-center text-white font-black text-lg shadow-md shadow-emerald-900/30">
            RQ
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-sm tracking-tight">RailQuick</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                1:1 Design Replica
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              India's Train Delivery App • UI/UX Preview
            </p>
          </div>
        </div>

        {/* Screen Quick Jumper Tabs */}
        <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80 overflow-x-auto">
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
            ⚡ Screen 1: Splash
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
            📱 Screen 2: Login
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
            🚉 Screen 3: Coming Soon
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
            🛒 Screen 4: Live Store
          </button>
        </div>

        {/* View Mode & Utility Controls */}
        <div className="flex items-center gap-2">
          {/* Side-by-Side Comparison Toggle */}
          <button
            onClick={() => {
              sounds.tap();
              setViewMode(viewMode === 'side-by-side' ? 'phone' : 'side-by-side');
            }}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              viewMode === 'side-by-side'
                ? 'bg-amber-500 text-slate-950 font-black'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`}
            title="View all 3 mockup screens side by side"
          >
            <Columns className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Side-by-Side</span>
          </button>

          {/* Phone Frame Toggle */}
          <button
            onClick={() => {
              sounds.tap();
              setViewMode(viewMode === 'phone' ? 'fullscreen' : 'phone');
            }}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all"
            title={viewMode === 'phone' ? 'Switch to Full Screen' : 'Switch to Phone Frame'}
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

          {/* Reset App State */}
          <button
            onClick={() => {
              sounds.tap();
              onReset();
            }}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all"
            title="Reset to Splash Screen"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      {viewMode === 'side-by-side' && renderAllSideBySide ? (
        <div className="w-full max-w-7xl pb-12 animate-in fade-in duration-300">
          <div className="mb-4 text-center">
            <h2 className="text-xl font-black text-white flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Side-by-Side Mockup Verification
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Exact replica of your 3 design screens side-by-side (matching Page 4 of your design attachments)
            </p>
          </div>
          {renderAllSideBySide}
        </div>
      ) : viewMode === 'phone' ? (
        /* Realistic iPhone 15 Pro Device Frame */
        <div className="relative my-auto pb-10 flex flex-col items-center animate-in zoom-in-95 duration-300">
          {/* Phone Shell with Titanium Bezel */}
          <div className="relative w-[390px] sm:w-[412px] h-[844px] sm:h-[870px] bg-black rounded-[52px] p-[12px] shadow-[0_25px_70px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.15)] ring-1 ring-slate-800">
            {/* Outer Titanium Trim Accent */}
            <div className="absolute inset-0 rounded-[52px] border-[2px] border-slate-700/40 pointer-events-none"></div>

            {/* Inner Screen Bezel */}
            <div className="relative w-full h-full bg-white rounded-[40px] overflow-hidden flex flex-col shadow-inner">
              {/* iOS Status Bar */}
              <div className="w-full h-11 px-7 flex items-center justify-between bg-transparent z-40 select-none text-slate-900 text-xs font-bold pt-1">
                {/* Time */}
                <span>{timeString}</span>

                {/* Dynamic Island Pill */}
                <div className="w-24 h-6 bg-black rounded-full flex items-center justify-end px-2.5 gap-1.5 shadow-sm">
                  {/* Camera lens reflection */}
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-indigo-950"></div>
                  </div>
                </div>

                {/* Status Icons: 5G, Wifi, Battery */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono font-black">5G</span>
                  {/* Wifi icon */}
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4C7.31 4 3.07 5.9 0 8.98L12 21 24 8.98C20.93 5.9 16.69 4 12 4zm0 3.5c3.74 0 7.15 1.48 9.69 3.91L12 19.38 2.31 11.41C4.85 8.98 8.26 7.5 12 7.5z"/>
                  </svg>
                  {/* Battery icon */}
                  <div className="w-5 h-2.5 border border-slate-900 rounded-sm p-0.5 flex items-center">
                    <div className="h-full w-full bg-slate-900 rounded-xs"></div>
                  </div>
                </div>
              </div>

              {/* Mobile App Canvas */}
              <div className="flex-1 w-full overflow-y-auto relative no-scrollbar">
                {children}
              </div>

              {/* iOS Home Bar Indicator */}
              <div className="w-full h-5 bg-transparent flex items-center justify-center z-40 select-none pb-1">
                <div className="w-32 h-1 bg-slate-400/80 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Full Screen Responsive Layout */
        <div className="w-full max-w-md mx-auto min-h-[750px] bg-white rounded-3xl shadow-2xl overflow-hidden my-4">
          {children}
        </div>
      )}
    </div>
  );
};
