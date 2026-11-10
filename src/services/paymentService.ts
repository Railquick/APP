import { PaymentMethodId, PaymentTransaction } from '../types/payment';
import { API_BASE_URL } from '../config/constants';

class PaymentService {
  private isProcessing: boolean = false;

  /**
   * Calls FastAPI backend to initiate PhonePe standard payment session.
   * Encodes payment payload, requests payment redirect URL from /api/v1/payments/initiate-phonepe.
   */
  public async initiatePhonePePayment(
    orderId: string,
    amount: number
  ): Promise<string> {
    const origin =
      typeof window !== 'undefined' && window.location.origin
        ? window.location.origin
        : 'https://railquick-one.vercel.app';
    const redirectUrl = `${origin}/orders/tracking?order_id=${encodeURIComponent(orderId)}`;

    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('railquick_token') ||
          localStorage.getItem('access_token') ||
          localStorage.getItem('token')
        : null;

    const requestPayload = {
      order_id: orderId,
      amount: amount,
      redirect_url: redirectUrl,
    };

    const endpoints = [
      `${API_BASE_URL.replace(/\/$/, '')}/api/v1/payments/initiate-phonepe`,
      '/api/v1/payments/initiate-phonepe',
      'https://railquick-backend.onrender.com/api/v1/payments/initiate-phonepe',

    ];

    let lastError: any = null;

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(requestPayload),
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data.success && data.payment_url) {
            return data.payment_url;
          }
          if (data && data.payment_url) {
            return data.payment_url;
          }
          throw new Error(data.message || 'PhonePe payment URL not received from server');
        }

        const errJson = await response.json().catch(() => ({}));
        const errMsg =
          errJson.detail ||
          errJson.message ||
          `PhonePe initiation failed with status ${response.status}`;
        lastError = new Error(errMsg);
      } catch (err: any) {
        lastError = err;
        // If it's a specific backend validation error, rethrow immediately
        if (
          err.message &&
          !err.message.includes('fetch') &&
          !err.message.includes('network') &&
          !err.message.includes('Failed to fetch')
        ) {
          throw err;
        }
      }
    }

    throw (
      lastError ||
      new Error('Could not initiate PhonePe payment session. Please check your network and retry.')
    );
  }

  /**
   * Internal transaction generator for order record persistence.
   */
  public async processPayment(
    orderId: string,
    amount: number,
    method: PaymentMethodId
  ): Promise<PaymentTransaction> {
    if (this.isProcessing) {
      throw new Error('A payment is already currently processing.');
    }

    if (amount <= 0) {
      throw new Error('Payable amount must be greater than zero.');
    }

    this.isProcessing = true;

    try {
      const transactionId =
        method === 'phonepe'
          ? `pay_ppe_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`
          : method === 'razorpay'
          ? `pay_rzp_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`
          : `cod_auth_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

      const methodTitle =
        method === 'phonepe'
          ? 'PhonePe / UPI / Cards'
          : method === 'razorpay'
          ? 'UPI • Razorpay'
          : 'Pay at Berth (Cash / QR)';

      const transaction: PaymentTransaction = {
        transactionId,
        orderId,
        amount,
        method,
        methodTitle,
        status: 'success',
        timestamp: new Date().toISOString(),
      };

      return transaction;
    } finally {
      this.isProcessing = false;
    }
  }

  public getIsProcessing(): boolean {
    return this.isProcessing;
  }
}

export const paymentService = new PaymentService();
export default paymentService;
