import React, { useState } from 'react';
import { DeviceFrame } from './components/DeviceFrame';
import { SplashScreen } from './screens/SplashScreen';
import { LoginScreen } from './screens/LoginScreen';
import { ComingSoonScreen } from './screens/ComingSoonScreen';
import { LiveStoreScreen } from './screens/LiveStoreScreen';
import { ScreenId, Station } from './types';
import { INITIAL_STATIONS } from './services/mockData';
import { sounds } from './services/soundEffects';

export function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('login');
  const [currentStation, setCurrentStation] = useState<Station>(INITIAL_STATIONS[0]); // Pocket A 2 (Unserviceable area)
  const [phoneNumber, setPhoneNumber] = useState<string>('9876543210');

  const handleLoginSuccess = (phone: string) => {
    setPhoneNumber(phone);
    sounds.success();
    // Navigate to Coming Soon screen (matching mockup flow)
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

  const handleReset = () => {
    setCurrentStation(INITIAL_STATIONS[0]);
    setCurrentScreen('splash');
  };

  // Render active screen in primary device simulator
  const renderActiveScreen = () => {
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

  // Side-by-side replica view matching Page 4 of the user's design attachments
  const renderSideBySide = (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto items-start">
      {/* 1. Splash Screen Card */}
      <div className="flex flex-col items-center">
        <div className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2 px-3 py-1 bg-slate-900 rounded-full border border-slate-800">
          Screen 1 • Splash Branding
        </div>
        <div className="w-[360px] h-[740px] bg-white rounded-[38px] shadow-2xl border-4 border-slate-800 overflow-hidden relative">
          <SplashScreen onContinue={() => setCurrentScreen('login')} />
        </div>
      </div>

      {/* 2. Login Screen Card */}
      <div className="flex flex-col items-center">
        <div className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2 px-3 py-1 bg-slate-900 rounded-full border border-slate-800">
          Screen 2 • Login & Product Mosaic
        </div>
        <div className="w-[360px] h-[740px] bg-white rounded-[38px] shadow-2xl border-4 border-slate-800 overflow-hidden relative">
          <LoginScreen onLoginSuccess={handleLoginSuccess} />
        </div>
      </div>

      {/* 3. Coming Soon Station Card */}
      <div className="flex flex-col items-center">
        <div className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2 px-3 py-1 bg-slate-900 rounded-full border border-slate-800">
          Screen 3 • Station / Coming Soon
        </div>
        <div className="w-[360px] h-[740px] bg-white rounded-[38px] shadow-2xl border-4 border-slate-800 overflow-hidden relative">
          <ComingSoonScreen
            currentStation={currentStation}
            phoneNumber={phoneNumber}
            onSelectStation={handleSelectStation}
            onLogout={() => setCurrentScreen('login')}
          />
        </div>
      </div>
    </div>
  );

  return (
    <DeviceFrame
      currentScreen={currentScreen}
      onNavigate={setCurrentScreen}
      currentStation={currentStation}
      onReset={handleReset}
      renderAllSideBySide={renderSideBySide}
    >
      {renderActiveScreen()}
    </DeviceFrame>
  );
}

export default App;
