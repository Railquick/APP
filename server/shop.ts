import { Router } from 'express';
import { z } from 'zod';
import { db } from './db.js';
import { config } from './config.js';
import { HttpError, ok, route } from './http.js';
import crypto from 'node:crypto';

export const shopRouter = Router();

// 1. GET /api/products (Filter by category, search)
shopRouter.get(
  '/products',
  route(async (req, res) => {
    const category = typeof req.query.category === 'string' ? req.query.category.trim() : undefined;
    const q = typeof req.query.q === 'string' ? req.query.q.trim().toLowerCase() : undefined;

    let query = 'SELECT * FROM products WHERE in_stock = 1';
    const params: unknown[] = [];

    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }

    if (q) {
      query += ' AND (LOWER(name) LIKE ? OR LOWER(description) LIKE ?)';
      params.push(`%${q}%`, `%${q}%`);
    }

    query += ' ORDER BY id ASC';
    const rows = db.prepare(query).all(...params);
    ok(res, rows);
  }),
);

// 2. POST /api/delivery/check
const deliveryCheckSchema = z.object({
  stationCode: z.string().optional(),
  boardingStation: z.string().optional(),
  destinationStation: z.string().optional(),
});

shopRouter.post(
  '/delivery/check',
  route(async (req, res) => {
    const input = deliveryCheckSchema.parse(req.body);
    const station = (input.stationCode || input.boardingStation || input.destinationStation || '').trim().toUpperCase();

    const isSupported = config.deliveryStations.includes(station);

    ok(res, {
      supported: isSupported,
      stationChecked: station,
      supportedStations: config.deliveryStations,
      message: isSupported
        ? `RailQuick delivers directly to your seat at ${station}.`
        : `RailQuick currently operates delivery only at supported Delhi stations (${config.deliveryStations.join(', ')}). Your selected station (${station || 'Unknown'}) is outside our active delivery zone.`,
    });
  }),
);

// 3. POST /api/orders
const orderItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive().max(10),
});

const createOrderSchema = z.object({
  userPhone: z.string().regex(/^[6-9]\d{9}$/, 'Valid 10-digit mobile number required.'),
  passengerName: z.string().min(2, 'Passenger name required.').max(50),
  pnr: z.string().optional(),
  trainNumber: z.string().min(3).max(10),
  trainName: z.string().min(2),
  journeyDate: z.string().min(4),
  boardingStation: z.string().min(1),
  destinationStation: z.string().min(1),
  deliveryStation: z.string().min(1),
  coach: z.string().min(1, 'Coach is required (e.g. B2, S4, A1).'),
  seatBerth: z.string().min(1, 'Seat / Berth number is required.'),
  items: z.array(orderItemSchema).min(1, 'Cart cannot be empty.'),
});

shopRouter.post(
  '/orders',
  route(async (req, res) => {
    const parsed = createOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new HttpError('INVALID_INPUT', parsed.error.issues[0]?.message || 'Invalid order data.');
    }

    const data = parsed.data;
    const deliveryStationUpper = data.deliveryStation.trim().toUpperCase();

    // Check delivery eligibility against supported stations
    const isDelhiStation =
      config.deliveryStations.includes(deliveryStationUpper) ||
      config.deliveryStations.some(
        (stn) =>
          data.boardingStation.toUpperCase().includes(stn) ||
          data.destinationStation.toUpperCase().includes(stn) ||
          deliveryStationUpper.includes(stn),
      );

    if (!isDelhiStation) {
      throw new HttpError(
        'UNSUPPORTED_DELIVERY',
        `Delivery is not available for station ${deliveryStationUpper}. RailQuick is in testing phase for Delhi stations (${config.deliveryStations.join(', ')}).`,
        { supportedStations: config.deliveryStations },
      );
    }

    // Verify all products and calculate exact price on server
    const productIds = data.items.map((i) => i.productId);
    const placeholders = productIds.map(() => '?').join(',');
    const products = db
      .prepare(`SELECT * FROM products WHERE id IN (${placeholders}) AND in_stock = 1`)
      .all(...productIds) as Array<{ id: string; name: string; price_paise: number; mrp_paise: number; unit: string }>;

    if (products.length !== productIds.length) {
      throw new HttpError('CONFLICT', 'One or more items in your cart are currently out of stock or unavailable.');
    }

    const productMap = new Map(products.map((p) => [p.id, p]));
    let subtotalPaise = 0;

    const populatedItems = data.items.map((item) => {
      const prod = productMap.get(item.productId)!;
      const lineTotal = prod.price_paise * item.quantity;
      subtotalPaise += lineTotal;
      return {
        id: prod.id,
        name: prod.name,
        pricePaise: prod.price_paise,
        mrpPaise: prod.mrp_paise,
        unit: prod.unit,
        quantity: item.quantity,
        totalPaise: lineTotal,
      };
    });

    const deliveryFeePaise = subtotalPaise >= config.freeDeliveryAbovePaise ? 0 : config.deliveryFeePaise;
    const totalPaise = subtotalPaise + deliveryFeePaise;

    const orderRef = `RQ-${Math.floor(100000 + Math.random() * 900000)}`;
    const orderId = crypto.randomUUID();

    const insert = db.prepare(`
      INSERT INTO orders (
        id, order_ref, user_phone, passenger_name, pnr, train_number, train_name,
        journey_date, boarding_station, destination_station, delivery_station,
        coach, seat_berth, items_json, subtotal_paise, delivery_fee_paise, total_paise,
        payment_status, order_status
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        'unpaid_test', 'confirmed'
      )
    `);

    insert.run(
      orderId,
      orderRef,
      data.userPhone,
      data.passengerName,
      data.pnr || null,
      data.trainNumber,
      data.trainName,
      data.journeyDate,
      data.boardingStation,
      data.destinationStation,
      deliveryStationUpper,
      data.coach.toUpperCase(),
      data.seatBerth,
      JSON.stringify(populatedItems),
      subtotalPaise,
      deliveryFeePaise,
      totalPaise,
    );

    ok(
      res,
      {
        orderId,
        orderRef,
        userPhone: data.userPhone,
        passengerName: data.passengerName,
        trainNumber: data.trainNumber,
        trainName: data.trainName,
        journeyDate: data.journeyDate,
        deliveryStation: deliveryStationUpper,
        coach: data.coach.toUpperCase(),
        seatBerth: data.seatBerth,
        items: populatedItems,
        subtotalPaise,
        deliveryFeePaise,
        totalPaise,
        paymentStatus: 'unpaid_test (Testing Checkout - No Payment Taken)',
        orderStatus: 'confirmed',
        createdAt: new Date().toISOString(),
      },
      201,
    );
  }),
);

// 4. GET /api/orders/:ref
shopRouter.get(
  '/orders/:ref',
  route(async (req, res) => {
    const ref = req.params.ref;
    const row = db.prepare('SELECT * FROM orders WHERE order_ref = ? OR id = ?').get(ref, ref) as any;
    if (!row) {
      throw new HttpError('NOT_FOUND', 'Order not found.');
    }

    ok(res, {
      ...row,
      items: JSON.parse(row.items_json),
    });
  }),
);
