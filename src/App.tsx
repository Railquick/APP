import React, { useState } from 'react';
import { SplashScreen } from './screens/SplashScreen';
import { LoginScreen } from './screens/LoginScreen';
import { ComingSoonScreen } from './screens/ComingSoonScreen';
import { LiveStoreScreen } from './screens/LiveStoreScreen';
import { ScreenId, Station } from './types';
import { INITIAL_STATIONS } from './services/mockData';
import { sounds } from './services/soundEffects';

export function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('splash');
  const [currentStation, setCurrentStation] = useState<Station>(INITIAL_STATIONS[0]); // Pocket A 2 (Unserviceable area)
  const [phoneNumber, setPhoneNumber] = useState<string>('9876543210');
  const [showNavDots, setShowNavDots] = useState<boolean>(true);

  const handleLoginSuccess = (phone: string) => {
    setPhoneNumber(phone);
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

  const renderScreen = () => {
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
    <div className="w-full h-[100dvh] min-h-[100dvh] bg-slate-900 sm:bg-slate-950 flex items-center justify-center overflow-hidden">
      {/* Pure Mobile Viewport - Fits directly for mobile phone, centered with clean shadow on desktop */}
      <main className="w-full sm:max-w-[412px] h-[100dvh] sm:h-[92vh] sm:max-h-[890px] bg-white relative overflow-hidden sm:rounded-[32px] sm:shadow-[0_20px_60px_rgba(0,0,0,0.6)] flex flex-col">
        {/* Render Current Mobile Screen */}
        <div className="flex-1 w-full h-full overflow-hidden relative">
          {renderScreen()}
        </div>

        {/* Minimal Subtle Screen Jump Bar (Discreet floating pill to jump between screens easily) */}
        {showNavDots && (
          <nav
            aria-label="Screen switcher"
            className="absolute bottom-2 left-1/2 -translate-x-1/2 z-40 bg-black/50 hover:bg-black/75 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2 transition-all opacity-40 hover:opacity-100"
          >
            <button
              onClick={() => {
                sounds.tap();
                setCurrentScreen('splash');
              }}
              title="Screen 1: Splash"
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full transition-colors ${
                currentScreen === 'splash' ? 'bg-white text-slate-900 font-black' : 'text-white/80 hover:text-white'
              }`}
            >
              Splash
            </button>
            <span className="text-white/30 text-[9px]">•</span>
            <button
              onClick={() => {
                sounds.tap();
                setCurrentScreen('login');
              }}
              title="Screen 2: Login"
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full transition-colors ${
                currentScreen === 'login' ? 'bg-white text-slate-900 font-black' : 'text-white/80 hover:text-white'
              }`}
            >
              Login
            </button>
            <span className="text-white/30 text-[9px]">•</span>
            <button
              onClick={() => {
                sounds.tap();
                setCurrentScreen('coming-soon');
              }}
              title="Screen 3: Station (Coming Soon)"
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full transition-colors ${
                currentScreen === 'coming-soon' ? 'bg-white text-slate-900 font-black' : 'text-white/80 hover:text-white'
              }`}
            >
              Station
            </button>
            <span className="text-white/30 text-[9px]">•</span>
            <button
              onClick={() => {
                sounds.tap();
                setCurrentScreen('live-store');
              }}
              title="Screen 4: Live Store"
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full transition-colors ${
                currentScreen === 'live-store' ? 'bg-white text-slate-900 font-black' : 'text-white/80 hover:text-white'
              }`}
            >
              Store
            </button>
            <button
              onClick={() => setShowNavDots(false)}
              className="text-white/40 hover:text-white text-[10px] ml-1 pl-1 border-l border-white/20"
              title="Hide switcher"
            >
              ✕
            </button>
          </nav>
        )}
      </main>
    </div>
  );
}

export default App;
