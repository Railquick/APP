export type PaymentMethodId = 'phonepe' | 'razorpay' | 'cod';

export type PaymentStatus = 'idle' | 'processing' | 'success' | 'failed';

export interface PaymentMethod {
  id: PaymentMethodId;
  title: string;
  badge?: string;
  badgeType?: 'fastest' | 'seat' | 'disabled';
  description: string;
  chips: string[];
  disabled?: boolean;
  disabledBadge?: string;
  disabledReason?: string;
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
