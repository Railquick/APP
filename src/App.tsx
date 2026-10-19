import React, { useState } from 'react';
import { SplashScreen } from './screens/SplashScreen';
import { LoginScreen } from './screens/LoginScreen';
import { ZeptoStoreScreen } from './screens/ZeptoStoreScreen';
import { ScreenId, UserProfile } from './types';
import { sounds } from './services/soundEffects';

export function App() {
  // Real mobile application lifecycle: 1. Splash -> 2. Login -> 3. Zepto Store
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('splash');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string>('+91 98765 43210');

  const handleLoginSuccess = (userOrPhone: string | UserProfile) => {
    if (typeof userOrPhone === 'string') {
      setPhoneNumber(userOrPhone);
    } else {
      setUserProfile(userOrPhone);
      if (userOrPhone.phoneNumber) setPhoneNumber(userOrPhone.phoneNumber);
    }
    sounds.success();
    // After login, transition directly to the real Zepto train delivery store!
    setCurrentScreen('live-store');
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
              setCurrentScreen('live-store');
            }}
          />
        );
      case 'live-store':
      default:
        return (
          <ZeptoStoreScreen
            userProfile={userProfile}
            phoneNumber={phoneNumber}
            onLogout={() => {
              sounds.tap();
              setCurrentScreen('login');
            }}
          />
        );
    }
  };

  return (
    // Fills 100% of the mobile screen / browser without any fake phone frames or outer borders
    <div className="w-full h-[100dvh] min-h-[100dvh] bg-white flex flex-col overflow-hidden selection:bg-emerald-500">
      <main className="w-full h-full flex-1 relative overflow-hidden flex flex-col">
        {renderActiveScreen()}
      </main>
    </div>
  );
}

export default App;
