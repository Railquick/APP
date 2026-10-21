import { useEffect, useState } from 'react';
import { CartItem, Product } from '../types';

const CART_KEY = 'railquick.cart_items';
const EVENT_NAME = 'railquick:cart_change';

const DELIVERY_FEE_PAISE = 3000; // ₹30
const FREE_DELIVERY_THRESHOLD_PAISE = 49900; // ₹499

export function getStoredCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistCart(items: CartItem[]): void {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: items }));
  } catch (err) {
    console.warn('Failed to persist cart', err);
  }
}

export function addToCart(product: Product): void {
  const current = getStoredCart();
  const existingIndex = current.findIndex((item) => item.product.id === product.id);

  if (existingIndex >= 0) {
    current[existingIndex].quantity += 1;
  } else {
    current.push({ product, quantity: 1 });
  }

  persistCart([...current]);
}

export function updateCartQuantity(productId: string, quantity: number): void {
  const current = getStoredCart();
  if (quantity <= 0) {
    const filtered = current.filter((item) => item.product.id !== productId);
    persistCart(filtered);
    return;
  }

  const existing = current.find((item) => item.product.id === productId);
  if (existing) {
    existing.quantity = quantity;
    persistCart([...current]);
  }
}

export function removeFromCart(productId: string): void {
  const current = getStoredCart();
  persistCart(current.filter((item) => item.product.id !== productId));
}

export function clearCart(): void {
  persistCart([]);
}

export function calculateCartTotals(items: CartItem[]) {
  const subtotalPaise = items.reduce(
    (sum, item) => sum + item.product.price_paise * item.quantity,
    0,
  );
  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const deliveryFeePaise =
    items.length === 0 || subtotalPaise >= FREE_DELIVERY_THRESHOLD_PAISE ? 0 : DELIVERY_FEE_PAISE;
  const totalPaise = subtotalPaise + deliveryFeePaise;

  return {
    subtotalPaise,
    deliveryFeePaise,
    totalPaise,
    totalItemCount,
    freeDeliveryThresholdPaise: FREE_DELIVERY_THRESHOLD_PAISE,
  };
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(() => getStoredCart());

  useEffect(() => {
    const onUpdate = (e: Event) => {
      const custom = e as CustomEvent<CartItem[]>;
      setItems(custom.detail);
    };
    window.addEventListener(EVENT_NAME, onUpdate);
    return () => window.removeEventListener(EVENT_NAME, onUpdate);
  }, []);

  const totals = calculateCartTotals(items);

  return {
    items,
    totals,
    add: addToCart,
    updateQty: updateCartQuantity,
    remove: removeFromCart,
    clear: clearCart,
  };
}
