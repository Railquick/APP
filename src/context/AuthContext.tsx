import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types/auth';
import { authService, DEFAULT_REAL_USER } from '../services/authService';

interface AuthContextType {
  user: UserProfile;
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
  const [user, setUser] = useState<UserProfile>(DEFAULT_REAL_USER);
  const [token, setToken] = useState<string | null>(authService.getToken());
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // 1. Fetch real profile from GET /api/v1/users/me on mount
    const initProfile = async () => {
      try {
        const profile = await authService.getMyProfile();
        setUser(profile);
      } catch (err) {
        // Fallback to DEFAULT_REAL_USER (Ayush Mishra)
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
    authService.clearSession();
    setUser(DEFAULT_REAL_USER);
    setToken(null);
  };

  const refreshProfile = async (): Promise<void> => {
    const profile = await authService.getMyProfile();
    setUser(profile);
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

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

