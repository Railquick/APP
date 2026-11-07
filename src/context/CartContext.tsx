import React, { createContext, useContext, useState, useMemo } from 'react';
import { PRODUCTS } from '../data/marketplaceData';
import { ProductItem } from '../types/product';
import { CartItem, CartSummary } from '../types/cart';

export interface CartContextType {
  cart: Record<string, number>; // productId -> quantity
  items: (ProductItem & { quantity: number; subtotal: number })[];
  totalCount: number;
  totalPrice: number;
  originalTotal: number;
  deliveryFee: number;
  originalDeliveryFee: number;
  handlingFee: number;
  totalSavings: number;
  totalPayable: number;
  addToCart: (productId: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  addItemsToCart: (itemsToAdd: { id: string; quantity: number }[]) => void;
  clearCart: () => void;
  getItemQuantity: (productId: string) => number;
  summary: CartSummary;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Initial state matching reference HTML & screenshot: 3 items totaling ₹189
// 149 (cable) + 20 (ORS) + 20 (Lays) = 189
const INITIAL_CART: Record<string, number> = {
  'prod-cable': 1,
  'prod-ors': 1,
  'prod-lays': 1,
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Record<string, number>>(INITIAL_CART);

  const productMap = useMemo(() => {
    const map = new Map<string, ProductItem>();
    PRODUCTS.forEach((p) => map.set(p.id, p));
    return map;
  }, []);

  const items = useMemo(() => {
    return Object.entries(cart)
      .map(([id, qty]) => {
        const product = productMap.get(id);
        if (!product || qty <= 0) return null;
        return {
          ...product,
          quantity: qty,
          subtotal: product.price * qty,
        };
      })
      .filter(Boolean) as (ProductItem & { quantity: number; subtotal: number })[];
  }, [cart, productMap]);

  const totalCount = useMemo(() => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  }, [cart]);

  const totalPrice = useMemo(() => {
    return items.reduce((sum, item) => sum + item.subtotal, 0);
  }, [items]);

  const originalTotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.mrp * item.quantity, 0);
  }, [items]);

  const originalDeliveryFee = 45;
  const deliveryFee = 0; // FREE with 5-MIN HALT PROMO
  const handlingFee = 0;

  const totalSavings = useMemo(() => {
    const itemDiscount = Math.max(0, originalTotal - totalPrice);
    const deliveryDiscount = originalDeliveryFee - deliveryFee;
    return itemDiscount + deliveryDiscount;
  }, [originalTotal, totalPrice]);

  const totalPayable = useMemo(() => {
    return totalPrice + deliveryFee + handlingFee;
  }, [totalPrice]);

  const addToCart = (productId: string) => {
    setCart((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1,
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => {
      const current = prev[productId] || 0;
      if (current <= 1) {
        const next = { ...prev };
        delete next[productId];
        return next;
      }
      return {
        ...prev,
        [productId]: current - 1,
      };
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setCart((prev) => {
      if (quantity <= 0) {
        const next = { ...prev };
        delete next[productId];
        return next;
      }
      return {
        ...prev,
        [productId]: quantity,
      };
    });
  };

  const addItemsToCart = (itemsToAdd: { id: string; quantity: number }[]) => {
    setCart((prev) => {
      const next = { ...prev };
      itemsToAdd.forEach((item) => {
        next[item.id] = (next[item.id] || 0) + item.quantity;
      });
      return next;
    });
  };

  const clearCart = () => {
    setCart({});
  };

  const getItemQuantity = (productId: string) => {
    return cart[productId] || 0;
  };

  const summary: CartSummary = useMemo(
    () => ({
      itemTotal: totalPrice,
      originalTotal,
      deliveryFee,
      originalDeliveryFee,
      isDeliveryFree: true,
      handlingFee,
      totalSavings,
      totalPayable,
      totalCount,
    }),
    [totalPrice, originalTotal, totalSavings, totalPayable, totalCount]
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        items,
        totalCount,
        totalPrice,
        originalTotal,
        deliveryFee,
        originalDeliveryFee,
        handlingFee,
        totalSavings,
        totalPayable,
        addToCart,
        removeFromCart,
        updateQuantity,
        addItemsToCart,
        clearCart,
        getItemQuantity,
        summary,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
