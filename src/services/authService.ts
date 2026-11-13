import { API_BASE_URL } from '../config/constants';
import { UserProfile, AuthResponse } from '../types/auth';

const API_BASE_CANDIDATES = [
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL
    ? process.env.EXPO_PUBLIC_API_URL
    : null),
  API_BASE_URL,
  'https://railquick-backend.onrender.com',
].filter(Boolean) as string[];

export const getInitialStoredUser = (): UserProfile => {
  let name = '';
  let email = '';
  let phone = '';
  let avatarUrl = '';

  if (typeof window !== 'undefined') {
    try {
      name = localStorage.getItem('railquick_user_name') || '';
      email = localStorage.getItem('railquick_user_email') || '';
      phone = localStorage.getItem('railquick_user_phone') || '';
      avatarUrl = localStorage.getItem('railquick_user_avatar') || '';
    } catch {}
  }

  return {
    id: 'usr-customer-id',
    name,
    email,
    phone,
    phoneNumber: phone,
    avatarUrl,
    authProvider: 'google',
    isVerified: Boolean(name || email),
  };
};

export const DEFAULT_REAL_USER: UserProfile = getInitialStoredUser();

class AuthService {
  private currentUser: UserProfile = getInitialStoredUser();
  private token: string | null = null;

  public getToken(): string | null {
    if (typeof window !== 'undefined') {
      const stored =
        localStorage.getItem('railquick_token') ||
        localStorage.getItem('access_token') ||
        localStorage.getItem('token');
      if (stored) {
        this.token = stored;
        return stored;
      }
    }
    return this.token;
  }

  /**
   * 1. GET /api/v1/users/me (Headers: Authorization: Bearer <token>)
   */
  public async getMyProfile(authToken?: string): Promise<UserProfile> {
    const bearer = authToken || this.getToken();

    for (const baseUrl of API_BASE_CANDIDATES) {
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        };
        if (bearer) {
          headers['Authorization'] = `Bearer ${bearer}`;
        }

        const response = await fetch(`${baseUrl.replace(/\/$/, '')}/api/v1/users/me`, {
          method: 'GET',
          headers,
        });

        if (response.ok) {
          const data = await response.json();
          if (data) {
            this.currentUser = this.mapBackendUser(data);
            return this.currentUser;
          }
        }
      } catch (err) {
        // Try next candidate
      }
    }

    return this.currentUser;
  }

  /**
   * 2. PATCH /api/v1/users/me
   * Body: { "name": "...", "phone": "..." }
   */
  public async updateMyProfile(name: string, phone: string): Promise<UserProfile> {
    const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
    this.currentUser = {
      ...this.currentUser,
      name: name !== undefined && name !== '' ? name : this.currentUser.name,
      phone: cleanPhone,
      phoneNumber: cleanPhone,
    };

    if (typeof window !== 'undefined') {
      try {
        if (name) localStorage.setItem('railquick_user_name', name);
        if (cleanPhone) localStorage.setItem('railquick_user_phone', cleanPhone);
      } catch {}
    }

    const bearer = this.getToken();
    for (const baseUrl of API_BASE_CANDIDATES) {
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        };
        if (bearer) {
          headers['Authorization'] = `Bearer ${bearer}`;
        }

        const response = await fetch(`${baseUrl.replace(/\/$/, '')}/api/v1/users/me`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            name,
            full_name: name,
            phone: cleanPhone,
            phone_number: cleanPhone,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data) {
            this.currentUser = this.mapBackendUser(data);
            return this.currentUser;
          }
        }
      } catch (err) {
        // Fallback to updated in-memory state
      }
    }

    return this.currentUser;
  }

  /**
   * Login with Google (connects to /api/v1/auth/google)
   */
  public async loginWithGoogleToken(googleAccessToken: string = 'demo-google-token'): Promise<{
    user: UserProfile;
    token: string;
  }> {
    for (const baseUrl of API_BASE_CANDIDATES) {
      try {
        const response = await fetch(`${baseUrl.replace(/\/$/, '')}/api/v1/auth/google`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({ accessToken: googleAccessToken }),
        });

        if (response.ok) {
          const data: AuthResponse = await response.json();
          if (data?.user) {
            this.token = data.access_token || data.token || 'jwt-bearer-token';
            if (typeof window !== 'undefined' && this.token) {
              try {
                localStorage.setItem('railquick_token', this.token);
                localStorage.setItem('access_token', this.token);
              } catch {}
            }
            this.currentUser = this.mapBackendUser(data.user);
            return {
              user: this.currentUser,
              token: this.token,
            };
          }
        }
      } catch (err) {
        // Fallback
      }
    }

    this.token = this.getToken() || 'jwt-railquick-authenticated-token';
    return {
      user: this.currentUser,
      token: this.token,
    };
  }

  public getCurrentUser(): UserProfile {
    return this.currentUser;
  }

  public clearSession(): void {
    this.token = null;
    this.currentUser = {
      id: '',
      name: '',
      email: '',
      phone: '',
      phoneNumber: '',
      avatarUrl: '',
      authProvider: 'google',
      isVerified: false,
    };
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

        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('sb-') || key.toLowerCase().includes('supabase'))) {
            localStorage.removeItem(key);
          }
        }
      } catch {}
    }
  }

  private mapBackendUser(raw: any): UserProfile {
    const name = raw.name || raw.full_name || '';
    const email = raw.email || '';
    const phone = raw.phone || raw.phone_number || '';
    const avatarUrl = raw.avatar_url || raw.picture || '';

    if (typeof window !== 'undefined') {
      try {
        if (name) localStorage.setItem('railquick_user_name', name);
        if (email) localStorage.setItem('railquick_user_email', email);
        if (phone) localStorage.setItem('railquick_user_phone', phone);
        if (avatarUrl) localStorage.setItem('railquick_user_avatar', avatarUrl);
      } catch {}
    }

    return {
      id: raw.id ? String(raw.id) : 'usr-customer-id',
      name,
      email,
      phone,
      phoneNumber: phone,
      avatarUrl,
      authProvider: raw.auth_provider || 'google',
      isVerified: true,
      createdAt: raw.created_at,
    };
  }
}

export const authService = new AuthService();
export default authService;
