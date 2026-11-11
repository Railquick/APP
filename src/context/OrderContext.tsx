import React, { createContext, useContext, useState, useEffect } from 'react';
import { Order } from '../types/order';
import { PaymentMethodId } from '../types/payment';
import { useCart } from './CartContext';
import { useJourney } from './JourneyContext';
import { paymentService } from '../services/paymentService';
import { orderService } from '../services/orderService';
import { INITIAL_RUNNING_ORDER, INITIAL_PAST_ORDERS } from '../data/demoOrdersData';

export interface PlaceOrderOptions {
  shouldClearCart?: boolean;
}

export interface OrderContextType {
  activeOrder: Order | null;
  orders: Order[];
  isPlacingOrder: boolean;
  orderError: string | null;
  placeOrder: (
    paymentMethod: PaymentMethodId,
    passengerDetails?: { name?: string; phone?: string },
    options?: PlaceOrderOptions
  ) => Promise<Order>;
  setActiveOrder: (order: Order | null) => void;
  getRunningOrders: () => Order[];
  getPastOrders: () => Order[];
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { items, summary, clearCart } = useCart();
  const { journey } = useJourney();

  const [activeOrder, setActiveOrder] = useState<Order | null>(INITIAL_RUNNING_ORDER);
  const [orders, setOrders] = useState<Order[]>([
    INITIAL_RUNNING_ORDER,
    ...INITIAL_PAST_ORDERS,
  ]);
  const [isPlacingOrder, setIsPlacingOrder] = useState<boolean>(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  const getRunningOrders = (): Order[] => {
    return orders.filter(
      (o) =>
        o.status !== 'DELIVERED' &&
        o.status !== 'delivered' &&
        o.status !== 'CANCELLED'
    );
  };

  const getPastOrders = (): Order[] => {
    return orders.filter(
      (o) =>
        o.status === 'DELIVERED' ||
        o.status === 'delivered' ||
        o.status === 'CANCELLED'
    );
  };

  const placeOrder = async (
    paymentMethod: PaymentMethodId,
    passengerDetails?: { name?: string; phone?: string },
    options?: PlaceOrderOptions
  ): Promise<Order> => {
    if (items.length === 0) {
      throw new Error('Your cart is empty. Please add items before checking out.');
    }

    setIsPlacingOrder(true);
    setOrderError(null);

    try {
      const tempOrderId = `RQ-${Math.floor(10000 + Math.random() * 90000)}`;

      // 1. Process payment via service abstraction
      const transaction = await paymentService.processPayment(
        tempOrderId,
        summary.totalPayable,
        paymentMethod
      );

      // 2. Only on verified payment success, create order in backend
      const newOrder = await orderService.createOrder(
        items,
        journey,
        transaction,
        summary,
        passengerDetails
      );

      // 3. Clear active cart ONLY if explicitly requested (defaults to false)
      // For online payment gateways (PhonePe), the cart is cleared only after gateway URL is obtained!
      if (options?.shouldClearCart) {
        clearCart();
      }

      // 4. Update order state
      setActiveOrder(newOrder);
      setOrders(orderService.getOrders());

      return newOrder;
    } catch (err: any) {
      const msg = err?.message || 'Payment processing failed. Please try again.';
      setOrderError(msg);
      throw err;
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <OrderContext.Provider
      value={{
        activeOrder,
        orders,
        isPlacingOrder,
        orderError,
        placeOrder,
        setActiveOrder,
        getRunningOrders,
        getPastOrders,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = (): OrderContextType => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};

export default OrderContext;
