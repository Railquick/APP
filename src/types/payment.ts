export type PaymentMethodId = 'razorpay' | 'cod';

export type PaymentStatus = 'idle' | 'processing' | 'success' | 'failed';

export interface PaymentMethod {
  id: PaymentMethodId;
  title: string;
  badge?: string;
  badgeType?: 'fastest' | 'seat';
  description: string;
  chips: string[];
}

export interface PaymentTransaction {
  transactionId: string;
  orderId: string;
  amount: number;
  method: PaymentMethodId;
  methodTitle: string;
  status: PaymentStatus;
  timestamp: string;
}

