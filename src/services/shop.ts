import { apiRequest } from './api';
import {
  DeliveryCheckResult,
  OrderConfirmation,
  Product,
  ProductCategory,
} from '../types';

export async function fetchProducts(
  category?: ProductCategory | 'all',
  query?: string,
  stationCode: string = 'NDLS'
): Promise<Product[]> {
  let supabaseProducts: Product[] = [];

  // Try fetching live inventory from Python FastAPI + Supabase backend
  try {
    const stn = (stationCode || 'NDLS').toUpperCase();
    const res = await apiRequest<{ success: boolean; products: any[] }>(`/api/v1/catalog/${stn}`);
    if (res?.success && Array.isArray(res.products) && res.products.length > 0) {
      supabaseProducts = res.products.map((item) => {
        let cat: ProductCategory = 'comfort';
        const rawCat = (item.category || '').toLowerCase();
        if (rawCat.includes('elect') || rawCat.includes('cable') || rawCat.includes('charg')) cat = 'electronics';
        else if (rawCat.includes('baby')) cat = 'babycare';
        else if (rawCat.includes('hygiene') || rawCat.includes('wipe') || rawCat.includes('essen')) cat = 'hygiene';
        else if (rawCat.includes('med')) cat = 'medicines';

        const pricePaise = Math.round((Number(item.price) || 50) * 100);
        return {
          id: item.product_id,
          name: item.title,
          category: cat,
          description: `Live stock at ${stn} platform hub`,
          price_paise: pricePaise,
          mrp_paise: Math.round(pricePaise * 1.2),
          in_stock: Number(item.stock) > 0 ? 1 : 0,
          image_url: item.image_url || 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=300&auto=format&fit=crop&q=80',
          unit: '1 unit',
          badge: 'Supabase Live',
        };
      });
    }
  } catch {
    // If FastAPI backend is not answering or offline, proceed with standard catalog
  }

  // Fetch full essentials catalog
  const params = new URLSearchParams();
  if (category && category !== 'all') params.set('category', category);
  if (query && query.trim()) params.set('q', query.trim());
  const qs = params.toString();

  const baseCatalog = await apiRequest<Product[]>(`/api/products${qs ? `?${qs}` : ''}`).catch(() => []);

  // Merge unique products (preferring live Supabase inventory for matching names)
  const combined = [...supabaseProducts];
  for (const p of baseCatalog) {
    if (!combined.some((item) => item.name.toLowerCase() === p.name.toLowerCase())) {
      combined.push(p);
    }
  }

  // Filter combined if category/query was set and Supabase products were added
  let filtered = combined;
  if (category && category !== 'all') {
    filtered = filtered.filter((p) => p.category === category);
  }
  if (query && query.trim()) {
    const q = query.trim().toLowerCase();
    filtered = filtered.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }

  return filtered;
}

export async function checkDeliverySupport(stationCode: string): Promise<DeliveryCheckResult> {
  return await apiRequest<DeliveryCheckResult>('/api/delivery/check', {
    method: 'POST',
    body: { stationCode },
  });
}

export interface CreateOrderPayload {
  userPhone: string;
  passengerName: string;
  pnr?: string;
  trainNumber: string;
  trainName: string;
  journeyDate: string;
  boardingStation: string;
  destinationStation: string;
  deliveryStation: string;
  coach: string;
  seatBerth: string;
  items: Array<{ productId: string; quantity: number }>;
}

export async function createOrder(payload: CreateOrderPayload): Promise<OrderConfirmation> {
  // If items have UUIDs from Supabase, try submitting to FastAPI orders router
  const hasUuid = payload.items.some((i) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(i.productId)
  );

  if (hasUuid) {
    try {
      const fastApiPayload = {
        train_no: payload.trainNumber,
        station_code: payload.deliveryStation,
        coach: payload.coach,
        seat_no: payload.seatBerth,
        items: payload.items.map((i) => ({ product_id: i.productId, quantity: i.quantity })),
      };

      const res = await apiRequest<any>('/api/v1/orders/create', {
        method: 'POST',
        body: fastApiPayload,
      });

      if (res?.success && res.order_id) {
        return {
          orderId: res.order_id,
          orderRef: `RQ-SUPA-${res.delivery_otp || Math.floor(1000 + Math.random() * 9000)}`,
          userPhone: payload.userPhone,
          passengerName: payload.passengerName,
          trainNumber: payload.trainNumber,
          trainName: payload.trainName,
          journeyDate: payload.journeyDate,
          deliveryStation: payload.deliveryStation,
          coach: payload.coach,
          seatBerth: payload.seatBerth,
          items: (res.items || []).map((it: any) => ({
            id: it.product_id,
            name: 'Supabase Essential Item',
            pricePaise: Math.round((it.price_at_purchase || 50) * 100),
            mrpPaise: Math.round((it.price_at_purchase || 50) * 120),
            unit: '1 pc',
            quantity: it.quantity,
            totalPaise: Math.round((it.price_at_purchase || 50) * it.quantity * 100),
          })),
          subtotalPaise: Math.round((res.total_amount || 0) * 100),
          deliveryFeePaise: 0,
          totalPaise: Math.round((res.total_amount || 0) * 100),
          paymentStatus: 'UNPAID_TEST (Live Supabase Order Placed)',
          orderStatus: res.status || 'CONFIRMED',
          createdAt: new Date().toISOString(),
        };
      }
    } catch (fastApiErr) {
      console.warn('FastAPI order creation error, falling back to core orders:', fastApiErr);
    }
  }

  // Core Order creation
  return await apiRequest<OrderConfirmation>('/api/orders', {
    method: 'POST',
    body: payload,
  });
}

export async function fetchOrder(orderRef: string): Promise<OrderConfirmation> {
  return await apiRequest<OrderConfirmation>(`/api/orders/${encodeURIComponent(orderRef)}`);
}
