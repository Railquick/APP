import { UserProfile } from '../types';

export interface GoogleAuthResponse {
  user: UserProfile;
  token: string;
}

// Ready for your backend integration!
// When you give the backend API URL, simply replace this mock with:
// const res = await fetch(`${BACKEND_URL}/api/auth/google`, { method: 'POST', body: JSON.stringify({ token }) });
export const authService = {
  async loginWithGoogle(): Promise<GoogleAuthResponse> {
    // Simulated Google OAuth response
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          user: {
            name: 'Kartik Guleria',
            email: 'kartik.guleria@gmail.com',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kartik',
            phoneNumber: '+91 98765 43210',
            isLoggedIn: true,
          },
          token: 'mock-jwt-token-railquick-auth-xyz',
        });
      }, 350);
    });
  },

  async loginWithPhone(phoneNumber: string): Promise<UserProfile> {
    return {
      name: 'Train Passenger',
      email: `${phoneNumber}@railquick.in`,
      phoneNumber: `+91 ${phoneNumber}`,
      isLoggedIn: true,
    };
  },
};
