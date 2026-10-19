import React, { useState } from 'react';
import { SplashScreen } from './screens/SplashScreen';
import { LoginScreen } from './screens/LoginScreen';
import { ComingSoonScreen } from './screens/ComingSoonScreen';
import { LiveStoreScreen } from './screens/LiveStoreScreen';
import { ScreenId, Station, UserProfile } from './types';
import { INITIAL_STATIONS } from './services/mockData';
import { sounds } from './services/soundEffects';

export function App() {
  // App lifecycle: 1. Splash -> 2. Login -> 3. Coming Soon (Train)
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('splash');
  const [currentStation, setCurrentStation] = useState<Station>(INITIAL_STATIONS[0]); // 12952 Rajdhani Express (Unserviceable train)
  const [phoneNumber, setPhoneNumber] = useState<string>('+91 98765 43210');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Transitions after successful login
  const handleLoginSuccess = (userOrPhone: string | UserProfile) => {
    if (typeof userOrPhone === 'string') {
      setPhoneNumber(userOrPhone);
    } else {
      setUserProfile(userOrPhone);
      if (userOrPhone.phoneNumber) setPhoneNumber(userOrPhone.phoneNumber);
    }
    sounds.success();
    // After login, transition directly to the 3rd screen (Coming Soon Train)
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
            onLogout={() => {
              sounds.tap();
              setCurrentScreen('login');
            }}
          />
        );
      case 'live-store':
        return (
          <LiveStoreScreen
            currentStation={currentStation}
            phoneNumber={phoneNumber}
            onSelectStation={handleSelectStation}
            onLogout={() => {
              sounds.tap();
              setCurrentScreen('login');
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full min-h-[100dvh] h-[100dvh] bg-[#0E1217] flex items-center justify-center overflow-hidden selection:bg-emerald-500">
      {/* Real Mobile Application Viewport */}
      <main className="w-full sm:max-w-[420px] h-[100dvh] sm:h-[92vh] sm:max-h-[890px] bg-white relative overflow-hidden sm:rounded-[36px] shadow-[0_25px_80px_rgba(0,0,0,0.7)] flex flex-col sm:border sm:border-slate-800/40">
        <div className="flex-1 w-full h-full relative overflow-hidden">
          {renderActiveScreen()}
        </div>
      </main>
    </div>
  );
}

export default App;
