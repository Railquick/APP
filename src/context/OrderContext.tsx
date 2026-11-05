import React, { createContext, useContext, useState, useEffect } from 'react';
import { Order } from '../types/order';
import { PaymentMethodId } from '../types/payment';
import { useCart } from './CartContext';
import { useJourney } from './JourneyContext';
import { paymentService } from '../services/paymentService';
import { orderService } from '../services/orderService';

export interface OrderContextType {
  activeOrder: Order | null;
  orders: Order[];
  isPlacingOrder: boolean;
  orderError: string | null;
  placeOrder: (paymentMethod: PaymentMethodId) => Promise<Order>;
  setActiveOrder: (order: Order | null) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { items, summary, clearCart } = useCart();
  const { journey } = useJourney();

  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isPlacingOrder, setIsPlacingOrder] = useState<boolean>(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  // If there is an initial demo order or when order is placed
  useEffect(() => {
    // If no order exists yet, we can create a default demo order for testing tracking screen directly if needed
    if (!activeOrder && orders.length === 0) {
      // Keep null until user places order or views existing
    }
  }, []);

  const placeOrder = async (paymentMethod: PaymentMethodId): Promise<Order> => {
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

      // 2. Only on verified payment success, create order
      const newOrder = orderService.createOrder(
        items,
        journey,
        transaction,
        summary
      );

      // 3. Clear active cart after successful order creation
      clearCart();

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

