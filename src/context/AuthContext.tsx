import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types/auth';
import { authService, DEFAULT_REAL_USER } from '../services/authService';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signInWithGoogle: (googleAccessToken?: string) => Promise<UserProfile>;
  updateProfile: (name: string, phone: string) => Promise<UserProfile>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const initial = authService.getCurrentUser();
    return initial?.name || initial?.email ? initial : null;
  });
  const [token, setToken] = useState<string | null>(authService.getToken());
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // 1. Fetch real profile from GET /api/v1/users/me on mount
    const initProfile = async () => {
      try {
        const storedToken = authService.getToken();
        if (!storedToken) {
          const storedUser = authService.getCurrentUser();
          if (storedUser?.name || storedUser?.email) {
            setUser(storedUser);
          } else {
            setUser(null);
          }
          return;
        }
        const profile = await authService.getMyProfile();
        if (profile?.email || profile?.name) {
          setUser(profile);
        } else {
          setUser(null);
        }
      } catch (err) {
        const storedUser = authService.getCurrentUser();
        if (storedUser?.name || storedUser?.email) {
          setUser(storedUser);
        } else {
          setUser(null);
        }
      }
    };
    initProfile();
  }, []);

  const signInWithGoogle = async (googleAccessToken?: string): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const res = await authService.loginWithGoogleToken(googleAccessToken);
      setUser(res.user);
      setToken(res.token);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 2. PUT /api/v1/users/me
   */
  const updateProfile = async (name: string, phone: string): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const updated = await authService.updateMyProfile(name, phone);
      setUser(updated);
      return updated;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    // 1. Clear authService session and local memory
    try {
      authService.clearSession();
    } catch (err) {
      console.warn('Error clearing auth service session:', err);
    }

    // 2. Clear all persisted auth tokens and user keys from localStorage (Web)
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const keysToRemove = [
          'railquick_token',
          'access_token',
          'token',
          'railquick_user_name',
          'railquick_user_email',
          'railquick_user_phone',
          'railquick_user_avatar',
          'supabase.auth.token',
          'sb-access-token',
          'sb-refresh-token',
        ];
        keysToRemove.forEach((key) => {
          try {
            localStorage.removeItem(key);
          } catch {}
        });

        // Purge any Supabase / sb-* session entries from localStorage
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('sb-') || key.toLowerCase().includes('supabase'))) {
            localStorage.removeItem(key);
          }
        }
      } catch (err) {
        console.warn('Error clearing localStorage during sign out:', err);
      }
    }

    // 3. Clear AsyncStorage if available (Mobile / React Native runtime)
    try {
      const asyncStorage =
        (typeof globalThis !== 'undefined' && (globalThis as any).AsyncStorage) ||
        (typeof window !== 'undefined' && (window as any).AsyncStorage);
      if (asyncStorage) {
        if (typeof asyncStorage.multiRemove === 'function') {
          await asyncStorage.multiRemove([
            'railquick_token',
            'access_token',
            'token',
            'railquick_user_name',
            'railquick_user_email',
            'railquick_user_phone',
            'railquick_user_avatar',
            'supabase.auth.token',
            'sb-access-token',
            'sb-refresh-token',
          ]);
        } else if (typeof asyncStorage.clear === 'function') {
          await asyncStorage.clear();
        }
      }
    } catch (err) {
      console.warn('AsyncStorage clear warning:', err);
    }

    // 4. Safely call supabase.auth.signOut() wrapped in try/catch so it never blocks
    try {
      const supabaseClient =
        (typeof window !== 'undefined' && (window as any).supabase) ||
        (typeof globalThis !== 'undefined' && (globalThis as any).supabase);
      if (supabaseClient?.auth?.signOut) {
        await supabaseClient.auth.signOut();
      }
    } catch (err) {
      console.warn('Supabase auth signOut error (non-blocking):', err);
    }

    // 5. Reset user and token React state to null
    setUser(null);
    setToken(null);
  };

  const refreshProfile = async (): Promise<void> => {
    try {
      const profile = await authService.getMyProfile();
      if (profile?.email || profile?.name) {
        setUser(profile);
      }
    } catch (err) {
      console.warn('Error refreshing profile:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token || !!user?.email,
        signInWithGoogle,
        updateProfile,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const fallbackAuthContextValue: AuthContextType = {
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
  signInWithGoogle: async () => DEFAULT_REAL_USER,
  updateProfile: async (name: string, phone: string) => ({
    ...DEFAULT_REAL_USER,
    name,
    phone,
  }),
  signOut: async () => {},
  refreshProfile: async () => {},
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    console.warn('useAuth called outside AuthProvider, using fallback profile');
    return fallbackAuthContextValue;
  }
  return context;
};

export default AuthContext;

