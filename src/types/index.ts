export type ScreenId = 'splash' | 'login' | 'coming-soon' | 'live-store';

export interface TrainRoute {
  id: string;
  trainNumber: string;
  trainName: string;
  route: string;
  origin: string;
  destination: string;
  isServiceable: boolean;
  statusBadge: string;
  coach?: string;
  berth?: string;
  expectedLaunchDate?: string;
}

export interface Station {
  id: string;
  name: string;
  code: string;
  city: string;
  isServiceable: boolean;
  pocketName?: string;
  addressSnippet: string;
  trainName?: string;
  trainNumber?: string;
  platformCount?: number;
  expectedLaunchDate?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
  phoneNumber?: string;
  isLoggedIn: boolean;
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
