import React, { useState } from 'react';
import { SplashScreen } from './screens/SplashScreen';
import { LoginScreen } from './screens/LoginScreen';
import { ComingSoonScreen } from './screens/ComingSoonScreen';
import { LiveStoreScreen } from './screens/LiveStoreScreen';
import { ScreenId, Station, UserProfile } from './types';
import { INITIAL_STATIONS } from './services/mockData';
import { sounds } from './services/soundEffects';
import { LayoutGrid, Smartphone } from 'lucide-react';

export function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('login');
  const [currentStation, setCurrentStation] = useState<Station>(INITIAL_STATIONS[0]); // 12952 Rajdhani Express (Unserviceable train)
  const [phoneNumber, setPhoneNumber] = useState<string>('9876543210');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [viewMode, setViewMode] = useState<'side-by-side' | 'single'>('side-by-side');

  const handleLoginSuccess = (userOrPhone: string | UserProfile) => {
    if (typeof userOrPhone === 'string') {
      setPhoneNumber(userOrPhone);
    } else {
      setUserProfile(userOrPhone);
      if (userOrPhone.phoneNumber) setPhoneNumber(userOrPhone.phoneNumber);
    }
    sounds.success();
    setCurrentScreen('coming-soon');
  };

  const handleSelectStation = (station: Station) => {
    setCurrentStation(station);
    if (station.isServiceable) {
      setCurrentScreen('live-store');
    } else {
      setCurrentScreen('coming-soon');
    }
  };

  const renderSingleScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return (
          <SplashScreen
            onContinue={() => {
              sounds.tap();
              setCurrentScreen('login');
            }}
          />
        );
      case 'login':
        return (
          <LoginScreen
            onLoginSuccess={handleLoginSuccess}
            onSkip={() => {
              sounds.tap();
              setCurrentScreen('coming-soon');
            }}
          />
        );
      case 'coming-soon':
        return (
          <ComingSoonScreen
            currentStation={currentStation}
            phoneNumber={phoneNumber}
            onSelectStation={handleSelectStation}
            onLogout={() => setCurrentScreen('login')}
          />
        );
      case 'live-store':
        return (
          <LiveStoreScreen
            currentStation={currentStation}
            phoneNumber={phoneNumber}
            onSelectStation={handleSelectStation}
            onLogout={() => setCurrentScreen('login')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full min-h-[100dvh] bg-[#12161A] text-slate-100 flex flex-col items-center justify-center p-2 sm:p-6 overflow-x-hidden select-none">
      {/* Discreet View Mode Toggle (Hidden on small mobile screens) */}
      <div className="w-full max-w-6xl flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#008b3e] text-white flex items-center justify-center font-black text-xs">
            RQ
          </div>
          <span className="text-xs font-black text-slate-300 tracking-tight">RailQuick UI Preview</span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              sounds.tap();
              setViewMode('side-by-side');
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'side-by-side'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">3-Screen Mockup View</span>
          </button>
          <button
            onClick={() => {
              sounds.tap();
              setViewMode('single');
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'single'
                ? 'bg-[#008b3e] text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Interactive Mobile</span>
          </button>
        </div>
      </div>

      {/* Main Presentation View */}
      {viewMode === 'side-by-side' ? (
        /* EXACT 3-SCREEN SIDE-BY-SIDE MATCHING USER'S REFERENCE IMAGE */
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-center justify-items-center py-2 animate-in fade-in duration-300">
          {/* Card 1: Splash Screen */}
          <div className="w-full max-w-[340px] sm:max-w-[365px] h-[740px] sm:h-[780px] bg-white rounded-[36px] overflow-hidden shadow-2xl relative border border-slate-800/40">
            <SplashScreen onContinue={() => setCurrentScreen('login')} />
          </div>

          {/* Card 2: Login Screen (No OTP, Google Login enabled) */}
          <div className="w-full max-w-[340px] sm:max-w-[365px] h-[740px] sm:h-[780px] bg-white rounded-[36px] overflow-hidden shadow-2xl relative border border-slate-800/40">
            <LoginScreen onLoginSuccess={handleLoginSuccess} />
          </div>

          {/* Card 3: Coming Soon Station Screen (Showing Train Name) */}
          <div className="w-full max-w-[340px] sm:max-w-[365px] h-[740px] sm:h-[780px] bg-white rounded-[36px] overflow-hidden shadow-2xl relative border border-slate-800/40">
            <ComingSoonScreen
              currentStation={currentStation}
              phoneNumber={phoneNumber}
              onSelectStation={handleSelectStation}
              onLogout={() => setCurrentScreen('login')}
            />
          </div>
        </div>
      ) : (
        /* Single Mobile Screen View - 100% Fit for phone testing */
        <main className="w-full sm:max-w-[420px] h-[100dvh] sm:h-[860px] bg-white relative overflow-hidden sm:rounded-[36px] shadow-2xl flex flex-col border border-slate-800/30">
          {renderSingleScreen()}
        </main>
      )}
    </div>
  );
}

export default App;
