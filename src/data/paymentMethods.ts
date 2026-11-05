import { PaymentMethod } from '../types/payment';

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'razorpay',
    title: 'Razorpay Instant Checkout',
    badge: '⚡ Fastest',
    badgeType: 'fastest',
    description:
      'Instant UPI (GPay, PhonePe, Paytm), Cards & NetBanking. Instant refund guarantee if train departs early.',
    chips: ['GPay', 'PhonePe', 'Paytm', 'BHIM', 'Cards'],
  },
  {
    id: 'cod',
    title: 'Pay at Berth (COD / Runner QR)',
    badge: 'Seat Delivery',
    badgeType: 'seat',
    description:
      "Hand exact cash or scan the delivery runner's live QR at Berth 36 during Kanpur Central halt.",
    chips: ['Cash to Runner', 'Scan on Arrival'],
  },
];

