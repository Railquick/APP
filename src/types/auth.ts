export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  phoneNumber?: string;
  avatarUrl?: string;
  authProvider?: string;
  isVerified?: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  access_token?: string;
  token?: string;
  token_type?: string;
  user: {
    id: string;
    email: string;
    name?: string;
    avatar_url?: string;
    phone?: string;
    phone_number?: string;
    auth_provider?: string;
    [key: string]: any;
  };
}

