import { UserProfile, AuthResponse } from '../types/auth';

const API_BASE_CANDIDATES = [
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL
    ? process.env.EXPO_PUBLIC_API_URL
    : null),
  'http://localhost:8000',
  'http://10.0.2.2:8000', // Android emulator localhost mapping
].filter(Boolean) as string[];

export const DEFAULT_REAL_USER: UserProfile = {
  id: 'usr-ayush-uuid-001',
  name: 'Ayush Mishra',
  email: 'ayush@gmail.com',
  phone: '9876543210',
  phoneNumber: '9876543210',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=faces&q=80',
  authProvider: 'google',
  isVerified: true,
};

class AuthService {
  private currentUser: UserProfile = DEFAULT_REAL_USER;
  private token: string | null = 'demo-railquick-jwt-bearer-token';

  /**
   * 1. GET /api/v1/users/me (Headers: Authorization: Bearer <token>)
   */
  public async getMyProfile(authToken?: string): Promise<UserProfile> {
    const bearer = authToken || this.token;

    for (const baseUrl of API_BASE_CANDIDATES) {
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (bearer) {
          headers['Authorization'] = `Bearer ${bearer}`;
        }

        const response = await fetch(`${baseUrl}/api/v1/users/me`, {
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
   * 2. PUT /api/v1/users/me
   * Body: { "name": "...", "phone": "..." }
   */
  public async updateMyProfile(name: string, phone: string): Promise<UserProfile> {
    this.currentUser = {
      ...this.currentUser,
      name,
      phone,
      phoneNumber: phone,
    };

    const bearer = this.token;
    for (const baseUrl of API_BASE_CANDIDATES) {
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (bearer) {
          headers['Authorization'] = `Bearer ${bearer}`;
        }

        const response = await fetch(`${baseUrl}/api/v1/users/me`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            name,
            phone,
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
        const response = await fetch(`${baseUrl}/api/v1/auth/google`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ accessToken: googleAccessToken }),
        });

        if (response.ok) {
          const data: AuthResponse = await response.json();
          if (data?.user) {
            this.token = data.access_token || data.token || 'jwt-bearer-token';
            this.currentUser = this.mapBackendUser(data.user);
            return {
              user: this.currentUser,
              token: this.token || 'jwt-bearer-token',
            };
          }
        }
      } catch (err) {
        // Fallback
      }
    }

    this.token = 'jwt-railquick-authenticated-token';
    return {
      user: this.currentUser,
      token: this.token,
    };
  }

  public getCurrentUser(): UserProfile {
    return this.currentUser;
  }

  public getToken(): string | null {
    return this.token;
  }

  public clearSession(): void {
    this.token = null;
    this.currentUser = DEFAULT_REAL_USER;
  }

  private mapBackendUser(raw: any): UserProfile {
    const name = raw.name || raw.full_name || 'Ayush Mishra';
    const email = raw.email || 'ayush@gmail.com';
    const phone = raw.phone || raw.phone_number || '9876543210';
    const avatarUrl =
      raw.avatar_url ||
      raw.picture ||
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=faces&q=80';

    return {
      id: raw.id ? String(raw.id) : 'usr-ayush-uuid-001',
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
