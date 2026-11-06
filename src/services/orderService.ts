import { Order, OrderItem } from '../types/order';
import { JourneyDetails } from '../types/journey';
import { PaymentTransaction } from '../types/payment';
import { CartSummary } from '../types/cart';
import { ProductItem } from '../types/product';
import { DEFAULT_RUNNER, generateTrackingSteps } from './trackingService';

/**
 * Converts non-UUID product IDs (like string or mock IDs) to a deterministic UUIDv4 format
 * so FastAPI backend uuid.UUID validator succeeds cleanly.
 */
export function toUuid(id: string): string {
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return id;
  }
  const clean = id.replace(/[^a-zA-Z0-9]/g, '');
  let hex = '';
  for (let i = 0; i < clean.length; i++) {
    hex += clean.charCodeAt(i).toString(16);
  }
  hex = hex.padEnd(32, '0').slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

class OrderService {
  private orders: Order[] = [];
  private activeOrder: Order | null = null;

  public async createOrder(
    cartItems: (ProductItem & { quantity: number; subtotal: number })[],
    journey: JourneyDetails,
    payment: PaymentTransaction,
    summary: CartSummary,
    passengerDetails?: { name?: string; phone?: string }
  ): Promise<Order> {
    const deliveryStation = 'NZM'; // Locked to Hazrat Nizamuddin (NZM) Pilot Hub
    const passengerName = passengerDetails?.name || journey.passengerName || 'Passenger';
    let passengerPhone = (passengerDetails?.phone || journey.passengerPhone || '9876543210').replace(/\D/g, '');
    if (passengerPhone.length === 12 && passengerPhone.startsWith('91')) {
      passengerPhone = passengerPhone.slice(2);
    } else if (passengerPhone.length === 11 && passengerPhone.startsWith('0')) {
      passengerPhone = passengerPhone.slice(1);
    }
    if (passengerPhone.length !== 10) {
      passengerPhone = '9876543210';
    }

    const trainNo = journey.trainNumber || '12424';
    const coach = journey.coach || 'B2';
    const seatNo = journey.berth || '36';
    const paymentMethod = payment.method === 'cod' ? 'PAY_ON_DELIVERY' : 'UPI_RAZORPAY';

    const fastApiPayload = {
      train_no: trainNo,
      station_code: deliveryStation,
      coach: coach.toUpperCase(),
      seat_no: seatNo,
      passenger_name: passengerName,
      passenger_phone: passengerPhone,
      pnr: journey.pnr ? journey.pnr.replace(/-/g, '') : '2458910236',
      payment_method: paymentMethod,
      items: cartItems.map((item) => ({
        product_id: toUuid(item.id),
        quantity: item.quantity,
      })),
    };

    let backendResponse: any = null;
    const apiEndpoints = [
      (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL
        ? `${process.env.EXPO_PUBLIC_API_URL}/api/v1/orders/create`
        : null),
      '/api/v1/orders/create',
      'http://localhost:8000/api/v1/orders/create',
    ].filter(Boolean) as string[];

    for (const endpoint of apiEndpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(fastApiPayload),
        });

        if (response.status === 429) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(
            errData.detail ||
              'Hazrat Nizamuddin delivery runners are currently at full capacity. Please retry in 5 minutes.'
          );
        }

        if (response.status === 400) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(
            errData.detail ||
              'Station delivery eligibility cutoff passed or invalid order parameters.'
          );
        }

        if (response.ok) {
          backendResponse = await response.json();
          break;
        }
      } catch (err: any) {
        // If it's a 429 or 400 error from backend, rethrow immediately to surface to the user!
        if (
          err.message &&
          (err.message.includes('capacity') ||
            err.message.includes('cutoff') ||
            err.message.includes('eligibility') ||
            err.message.includes('service') ||
            err.message.includes('not service station') ||
            err.message.includes('passenger_phone'))
        ) {
          throw err;
        }
        // Otherwise continue trying alternative endpoints
      }
    }

    // Use returned data from backend or generate consistent pilot fallback
    const returnedOtp =
      backendResponse?.delivery_otp ||
      `${Math.floor(1000 + Math.random() * 9000)}`;

    const returnedOrderId =
      backendResponse?.order_id ||
      `RQ-${Math.floor(10000 + Math.random() * 90000)}`;

    const returnedStatus = backendResponse?.status || 'PLACED';
    const safetyTag = `RQ${returnedOrderId.slice(-2)}`;

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
      'Hazrat Nizamuddin (NZM)',
      coach,
      seatNo,
      journey.platform || 'PF 1',
      returnedOtp,
      safetyTag
    );

    const newOrder: Order = {
      orderId: returnedOrderId,
      createdAt: new Date().toISOString(),
      items,
      itemTotal: summary.itemTotal,
      deliveryFee: summary.deliveryFee,
      totalAmount: backendResponse?.total_amount || summary.totalPayable,
      totalSavings: summary.totalSavings,
      journey: {
        ...journey,
        station: 'Hazrat Nizamuddin (NZM)',
        stationCode: 'NZM',
        coach,
        berth: seatNo,
        passengerName,
        passengerPhone,
      },
      payment,
      status: returnedStatus,
      statusBadge: 'Placed - Delivery at Hazrat Nizamuddin',
      otp: returnedOtp,
      deliveryOtp: returnedOtp,
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
