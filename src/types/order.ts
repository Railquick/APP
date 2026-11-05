import { JourneyDetails } from './journey';
import { PaymentTransaction } from './payment';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  mrp: number;
  weight?: string;
  subtotal: number;
}

export type TrackingStatus =
  | 'confirmed'
  | 'packed'
  | 'sprinting'
  | 'delivered'
  | 'PLACED'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'OUT_FOR_DELIVERY'
  | 'CANCELLED';

export interface TrackingStep {
  id: string;
  title: string;
  subtitle: string;
  time?: string;
  status: 'completed' | 'active' | 'upcoming';
  badge?: string;
  otp?: string;
}

export interface RunnerInfo {
  name: string;
  title: string;
  rating: number;
  totalDeliveries: number;
  uniformTag: string;
  phone: string;
  avatarUrl?: string;
}

export interface Order {
  orderId: string;
  createdAt: string;
  items: OrderItem[];
  itemTotal: number;
  deliveryFee: number;
  totalAmount: number;
  totalSavings: number;
  journey: JourneyDetails;
  payment: PaymentTransaction;
  status: TrackingStatus | string;
  statusBadge?: string;
  otp: string;
  deliveryOtp?: string;
  runner: RunnerInfo;
  trackingSteps: TrackingStep[];
  safetyTag: string;
}
