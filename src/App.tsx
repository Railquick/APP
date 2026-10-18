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
    <div className="w-full h-[100dvh] min-h-[100dvh] bg-black sm:bg-slate-950 flex items-center justify-center overflow-hidden">
      {/* 100% Mobile Phone Fit - Zero external borders, bezels, or navigation pills */}
      <main className="w-full sm:max-w-[430px] h-[100dvh] bg-white relative overflow-hidden flex flex-col shadow-2xl">
        {renderScreen()}
      </main>
    </div>
  );
}

export default App;
