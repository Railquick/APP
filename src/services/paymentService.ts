import { PaymentMethodId, PaymentTransaction } from '../types/payment';

class PaymentService {
  private isProcessing: boolean = false;

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
      // Simulate realistic payment gateway / bank processing roundtrip
      await new Promise((resolve) => setTimeout(resolve, 1100));

      const transactionId =
        method === 'razorpay'
          ? `pay_rzp_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`
          : `cod_auth_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

      const methodTitle =
        method === 'razorpay' ? 'UPI • Razorpay' : 'Pay at Berth (Cash / QR)';

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

