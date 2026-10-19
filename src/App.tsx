import React, { useState } from 'react';
import { SplashScreen } from './screens/SplashScreen';
import { LoginScreen } from './screens/LoginScreen';
import { ComingSoonScreen } from './screens/ComingSoonScreen';
import { Station, UserProfile } from './types';
import { INITIAL_STATIONS } from './services/mockData';
import { sounds } from './services/soundEffects';
import { Smartphone, LayoutGrid } from 'lucide-react';

export function App() {
  // Page 1 = Splash, Page 2 = Login, Page 3 = Coming Soon Station (All from Figma)
  const [currentPage, setCurrentPage] = useState<1 | 2 | 3>(1);
  const [currentStation, setCurrentStation] = useState<Station>(INITIAL_STATIONS[0]);
  const [phoneNumber, setPhoneNumber] = useState<string>('9876543210');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [viewMode, setViewMode] = useState<'app-flow' | 'side-by-side'>('app-flow');

  // Transition from Page 2 -> Page 3 upon login
  const handleLoginSuccess = (userOrPhone: string | UserProfile) => {
    if (typeof userOrPhone === 'string') {
      setPhoneNumber(userOrPhone);
    } else {
      setUserProfile(userOrPhone);
      if (userOrPhone.phoneNumber) setPhoneNumber(userOrPhone.phoneNumber);
    }
    sounds.success();
    // After login, advance to Page 3
    setCurrentPage(3);
  };

  const renderPage = (pageNumber: 1 | 2 | 3) => {
    switch (pageNumber) {
      case 1:
        return (
          <SplashScreen
            onContinue={() => {
              sounds.tap();
              setCurrentPage(2);
            }}
          />
        );
      case 2:
        return (
          <LoginScreen
            onLoginSuccess={handleLoginSuccess}
            onSkip={() => {
              sounds.tap();
              setCurrentPage(3);
            }}
          />
        );
      case 3:
      default:
        return (
          <ComingSoonScreen
            currentStation={currentStation}
            phoneNumber={phoneNumber}
            onSelectStation={(s) => setCurrentStation(s)}
            onLogout={() => {
              sounds.tap();
              setCurrentPage(2);
            }}
          />
        );
    }
  };

  return (
    <div className="w-full h-[100dvh] min-h-[100dvh] bg-[#12161A] text-slate-100 flex flex-col items-center justify-between overflow-hidden select-none">
      {/* Top Minimal View Mode Switcher */}
      <header className="w-full px-4 py-2 flex items-center justify-between z-30 shrink-0 border-b border-slate-800/60 bg-[#12161A]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#008b3e] text-white flex items-center justify-center font-black text-xs">
            RQ
          </div>
          <span className="text-xs font-black text-white tracking-tight">RailQuick Figma App</span>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              sounds.tap();
              setViewMode('app-flow');
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'app-flow'
                ? 'bg-[#008b3e] text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>App Flow (Page {currentPage})</span>
          </button>
          <button
            onClick={() => {
              sounds.tap();
              setViewMode('side-by-side');
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'side-by-side'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>3 Pages Side-by-Side</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full flex items-center justify-center overflow-hidden p-1 sm:p-3 relative">
        {viewMode === 'app-flow' ? (
          /* Single Mobile App Screen: Fills the screen 100%, same size for all 3 pages */
          <div className="w-full h-full max-w-[430px] flex items-center justify-center relative overflow-hidden rounded-2xl shadow-2xl bg-white">
            {renderPage(currentPage)}
          </div>
        ) : (
          /* Side-by-Side View: All 3 Figma Pages EXACT same size (matching user screenshot) */
          <div className="w-full max-w-6xl h-full flex items-center justify-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar py-2">
            {/* Page 1: Splash */}
            <div className="h-full aspect-[1125/2400] max-h-full rounded-2xl overflow-hidden shadow-2xl bg-white border border-slate-800 shrink-0">
              {renderPage(1)}
            </div>

            {/* Page 2: Login */}
            <div className="h-full aspect-[1125/2400] max-h-full rounded-2xl overflow-hidden shadow-2xl bg-white border border-slate-800 shrink-0">
              {renderPage(2)}
            </div>

            {/* Page 3: Station Coming Soon */}
            <div className="h-full aspect-[1125/2400] max-h-full rounded-2xl overflow-hidden shadow-2xl bg-white border border-slate-800 shrink-0">
              {renderPage(3)}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
