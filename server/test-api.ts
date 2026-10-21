import assert from 'node:assert';
import {
  todayIST,
  formatDDMMYYYY,
  addDays,
  parseDDMMYYYY,
  liveTrackingRange,
  inRange,
} from '../shared/dates.js';
import { db } from './db.js';
import { config } from './config.js';

async function runTests() {
  console.log('🧪 Starting RailQuick automated verification suite...\n');

  // 1. Date logic & range enforcement tests
  console.log('Test 1: IST Date helpers & tracking range');
  const today = todayIST();
  assert(today.y >= 2024, 'Year must be valid');
  assert(today.m >= 1 && today.m <= 12, 'Month must be 1-12');
  assert(today.d >= 1 && today.d <= 31, 'Day must be 1-31');

  const range = liveTrackingRange();
  assert(inRange(today, range), 'Today must be within live tracking range');
  assert(inRange(addDays(today, -5), range), '5 days ago must be within live tracking range');
  assert(!inRange(addDays(today, -6), range), '6 days ago must NOT be in live tracking range');
  assert(!inRange(addDays(today, 1), range), 'Tomorrow must NOT be in live tracking range');

  const formatted = formatDDMMYYYY(today);
  const parsed = parseDDMMYYYY(formatted);
  assert.deepStrictEqual(parsed, today, 'Format and parse must round-trip');
  console.log('  ✅ Date validation & range tests passed.');

  // 2. Database & Product catalog test
  console.log('Test 2: Database and products catalog');
  const products = db.prepare('SELECT * FROM products').all() as any[];
  assert(products.length >= 20, 'At least 20 seeded essentials products must exist');
  
  const categories = new Set(products.map((p) => p.category));
  assert(categories.has('medicines'), 'Medicines category must exist');
  assert(categories.has('hygiene'), 'Hygiene category must exist');
  assert(categories.has('electronics'), 'Electronics category must exist');
  assert(categories.has('babycare'), 'Baby care category must exist');
  assert(categories.has('comfort'), 'Comfort category must exist');
  console.log(`  ✅ Database contains ${products.length} products across 5 essential categories.`);

  // 3. Delivery Stations Rule
  console.log('Test 3: Delivery station rules');
  assert(config.deliveryStations.includes('NDLS'), 'NDLS must be a supported station');
  assert(config.deliveryStations.includes('NZM'), 'NZM must be a supported station');
  assert(!config.deliveryStations.includes('HWH'), 'HWH should not be in Delhi pilot');
  console.log('  ✅ Delivery station configuration verified.');

  // 4. Test Orders creation and SQLite storage
  console.log('Test 4: Order creation & verification');
  const testOrderRef = `RQ-TEST-${Date.now().toString().slice(-6)}`;
  const sampleItems = [
    { id: products[0].id, name: products[0].name, quantity: 2, pricePaise: products[0].price_paise, totalPaise: products[0].price_paise * 2 }
  ];
  const subtotal = sampleItems[0].totalPaise;
  const deliveryFee = subtotal >= config.freeDeliveryAbovePaise ? 0 : config.deliveryFeePaise;
  const total = subtotal + deliveryFee;

  db.prepare(`
    INSERT INTO orders (
      id, order_ref, user_phone, passenger_name, train_number, train_name,
      journey_date, boarding_station, destination_station, delivery_station,
      coach, seat_berth, items_json, subtotal_paise, delivery_fee_paise, total_paise
    ) VALUES (
      'test-order-id', ?, '9876543210', 'Test Passenger', '12987', 'Sampurn Kranti',
      'Today', 'NDLS', 'BCT', 'NDLS', 'B5', '22', ?, ?, ?, ?
    )
  `).run(testOrderRef, JSON.stringify(sampleItems), subtotal, deliveryFee, total);

  const saved = db.prepare('SELECT * FROM orders WHERE order_ref = ?').get(testOrderRef) as any;
  assert(saved, 'Saved order must be retrievable');
  assert.strictEqual(saved.order_ref, testOrderRef);
  assert.strictEqual(saved.coach, 'B5');
  assert.strictEqual(saved.total_paise, total);

  // Clean up test order
  db.prepare('DELETE FROM orders WHERE id = ?').run('test-order-id');
  console.log('  ✅ Order persistence and totals calculation passed.');

  console.log('\n🎉 ALL CORE LOGIC AND DATABASE TESTS PASSED!\n');
}

runTests().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
