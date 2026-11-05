import { Order, OrderItem } from '../types/order';
import { JourneyDetails } from '../types/journey';
import { PaymentTransaction } from '../types/payment';
import { CartSummary } from '../types/cart';
import { ProductItem } from '../types/product';
import { DEFAULT_RUNNER, generateTrackingSteps } from './trackingService';

class OrderService {
  private orders: Order[] = [];
  private activeOrder: Order | null = null;

  public createOrder(
    cartItems: (ProductItem & { quantity: number; subtotal: number })[],
    journey: JourneyDetails,
    payment: PaymentTransaction,
    summary: CartSummary
  ): Order {
    // Generate realistic order id like #RQ-88219
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const orderId = `RQ-${randomDigits}`;
    const safetyTag = `RQ${orderId.slice(-2)}`;
    // Realistic 4-digit OTP like 4829
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;

    const items: OrderItem[] = cartItems.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      mrp: item.mrp,
      weight: item.weight,
      subtotal: item.subtotal,
    }));

    const trackingSteps = generateTrackingSteps(
      journey.station,
      journey.coach,
      journey.berth,
      journey.platform,
      otp,
      safetyTag
    );

    const newOrder: Order = {
      orderId,
      createdAt: new Date().toISOString(),
      items,
      itemTotal: summary.itemTotal,
      deliveryFee: summary.deliveryFee,
      totalAmount: summary.totalPayable,
      totalSavings: summary.totalSavings,
      journey,
      payment,
      status: 'sprinting',
      otp,
      runner: DEFAULT_RUNNER,
      trackingSteps,
      safetyTag,
    };

    this.orders.unshift(newOrder);
    this.activeOrder = newOrder;

    return newOrder;
  }

  public getActiveOrder(): Order | null {
    return this.activeOrder;
  }

  public getOrders(): Order[] {
    return this.orders;
  }

  public getOrderById(orderId: string): Order | undefined {
    return this.orders.find((o) => o.orderId === orderId);
  }
}

export const orderService = new OrderService();
export default orderService;

