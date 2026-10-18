export type ScreenId = 'splash' | 'login' | 'coming-soon' | 'live-store';

export interface Station {
  id: string;
  name: string;
  code: string;
  city: string;
  isServiceable: boolean;
  pocketName?: string;
  addressSnippet: string;
  platformCount?: number;
  expectedLaunchDate?: string;
}

export interface UserProfile {
  phoneNumber: string;
  name?: string;
  isLoggedIn: boolean;
  defaultStation?: Station;
}

export interface AreaRequestPayload {
  stationName: string;
  stationCode?: string;
  platform?: string;
  trainNumber?: string;
  coachNumber?: string;
  phoneNumber: string;
  notifyOnWhatsApp: boolean;
  createdAt: string;
}

export interface ProductItem {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  weightOrVolume: string;
  deliveryTimeMins: number;
  imageUrl: string;
  tag?: string;
  inStock: boolean;
}

export interface CartItem {
  product: ProductItem;
  quantity: number;
}
