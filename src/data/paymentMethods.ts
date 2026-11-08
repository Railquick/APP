import { PaymentMethod } from '../types/payment';

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'phonepe',
    title: 'PhonePe / UPI / Cards',
    badge: '⚡ Instant & Safe',
    badgeType: 'fastest',
    description:
      'Pay securely via PhonePe, Google Pay, Paytm, UPI Apps, Credit/Debit Cards, or NetBanking with instant berth delivery confirmation.',
    chips: ['PhonePe', 'GPay', 'Paytm', 'UPI', 'Cards'],
    disabled: false,
  },
  {
    id: 'cod',
    title: 'Pay at Berth (COD / Runner QR)',
    badge: 'Unavailable during 5-Min Halt',
    badgeType: 'disabled',
    disabled: true,
    disabledBadge: 'Unavailable during 5-Min Halt',
    disabledReason:
      'Cash / QR collection on berth is disabled for the Hazrat Nizamuddin (NZM) pilot. Due to the rapid 5-minute halt window, pre-paid orders guarantee zero-delay berth handover.',
    description:
      'Prepaid only for NZM station. Cash on berth disabled to guarantee quick handover.',
    chips: ['Prepaid Only for Fast Berth Handover'],
  },
];
