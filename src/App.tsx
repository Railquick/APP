import { useCallback, useEffect, useState } from 'react';
import { HomeScreen } from './screens/HomeScreen';
import { JourneyScreen } from './screens/JourneyScreen';
import { EssentialsScreen } from './screens/EssentialsScreen';
import { ComingSoonScreen } from './screens/ComingSoonScreen';
import { AccountScreen } from './screens/AccountScreen';
import { LoginScreen } from './screens/LoginScreen';
import { SplashScreen } from './screens/SplashScreen';
import { checkAuthCallback, clearSession, getSession, saveSession } from './services/auth';
import { navigate, usePath } from './router';
import { Session } from './types';

const SPLASH_MS = 1200;

export function App() {
  const [session, setSession] = useState<Session | null>(() => checkAuthCallback() || getSession());
  const [splashDone, setSplashDone] = useState(false);
  const path = usePath();

  useEffect(() => {
    const timer = window.setTimeout(() => setSplashDone(true), SPLASH_MS);
    return () => window.clearTimeout(timer);
  }, []);

  // Authentication guards
  useEffect(() => {
    if (!splashDone) return;
    if (!session && path !== '/login') {
      navigate('/login', true);
    } else if (session && path === '/login') {
      navigate('/', true);
    }
  }, [splashDone, session, path]);

  const handleAuthenticated = useCallback((next: Session) => {
    saveSession(next);
    setSession(next);
    navigate('/', true);
  }, []);

  const handleLogout = useCallback(() => {
    clearSession();
    setSession(null);
    navigate('/login', true);
  }, []);

  let screen;
  if (!splashDone) {
    screen = <SplashScreen />;
  } else if (!session) {
    screen = <LoginScreen onAuthenticated={handleAuthenticated} />;
  } else if (path === '/account') {
    screen = <AccountScreen session={session} onLogout={handleLogout} />;
  } else if (path === '/journey') {
    screen = <JourneyScreen />;
  } else if (path === '/essentials') {
    screen = <EssentialsScreen />;
  } else if (path === '/coming-soon') {
    screen = <ComingSoonScreen session={session} onLogout={handleLogout} />;
  } else {
    // Default home screen (Page 1)
    screen = <HomeScreen session={session} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-dvh w-full bg-slate-900/90 sm:bg-slate-900 flex justify-center">
      <div className="min-h-dvh w-full max-w-[480px] bg-white shadow-2xl overflow-x-hidden antialiased flex flex-col relative">
        {screen}
      </div>
    </div>
  );
}

export default App;
