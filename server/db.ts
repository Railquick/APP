import Database from 'better-sqlite3';
import { config } from './config.js';
import fs from 'node:fs';
import path from 'node:path';

// Ensure data directory exists
const dir = path.dirname(config.dbPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

export const db = new Database(config.dbPath);
db.pragma('journal_mode = WAL');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    price_paise INTEGER NOT NULL,
    mrp_paise INTEGER NOT NULL,
    in_stock INTEGER NOT NULL DEFAULT 1,
    image_url TEXT,
    unit TEXT NOT NULL,
    badge TEXT
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    order_ref TEXT UNIQUE NOT NULL,
    user_phone TEXT NOT NULL,
    passenger_name TEXT,
    pnr TEXT,
    train_number TEXT NOT NULL,
    train_name TEXT NOT NULL,
    journey_date TEXT NOT NULL,
    boarding_station TEXT NOT NULL,
    destination_station TEXT NOT NULL,
    delivery_station TEXT NOT NULL,
    coach TEXT NOT NULL,
    seat_berth TEXT NOT NULL,
    items_json TEXT NOT NULL,
    subtotal_paise INTEGER NOT NULL,
    delivery_fee_paise INTEGER NOT NULL,
    total_paise INTEGER NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'unpaid_test',
    order_status TEXT NOT NULL DEFAULT 'confirmed',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS area_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    area TEXT NOT NULL,
    phone TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

`);

// Seed essentials catalog if empty
const count = (db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number }).count;

if (count === 0) {
  const seedProducts = [
    // Medicines & First Aid
    {
      id: 'med-1',
      name: 'Crocin Pain Relief Tablet (10s)',
      category: 'medicines',
      description: 'Fast relief from headache, fever and body pain during journey',
      price_paise: 6500,
      mrp_paise: 7000,
      in_stock: 1,
      image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80',
      unit: '1 strip',
      badge: 'Essential',
    },
    {
      id: 'med-2',
      name: 'Digene Antacid Mint Fizz (200ml)',
      category: 'medicines',
      description: 'Instant relief from acidity, gas and stomach discomfort',
      price_paise: 14500,
      mrp_paise: 16000,
      in_stock: 1,
      image_url: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=300&auto=format&fit=crop&q=80',
      unit: '1 bottle',
      badge: null,
    },
    {
      id: 'med-3',
      name: 'Hansaplast Emergency Bandage Kit (10s)',
      category: 'medicines',
      description: 'Antiseptic plasters with gentle adhesive for travel cuts',
      price_paise: 4900,
      mrp_paise: 5500,
      in_stock: 1,
      image_url: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=300&auto=format&fit=crop&q=80',
      unit: '1 pack',
      badge: null,
    },
    {
      id: 'med-4',
      name: 'Eldoper Motion Sickness & Diarrhea Capsules',
      category: 'medicines',
      description: 'Travel relief for upset stomach and diarrhea',
      price_paise: 4200,
      mrp_paise: 4500,
      in_stock: 1,
      image_url: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300&auto=format&fit=crop&q=80',
      unit: '1 strip (10 caps)',
      badge: null,
    },
    {
      id: 'med-5',
      name: 'Vicks Inhaler for Stuffy Nose',
      category: 'medicines',
      description: 'Quick clearing of nasal congestion in AC coaches',
      price_paise: 6800,
      mrp_paise: 7500,
      in_stock: 1,
      image_url: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=300&auto=format&fit=crop&q=80',
      unit: '1 piece',
      badge: null,
    },
    {
      id: 'med-6',
      name: 'Dettol Instant Hand Sanitizer (50ml)',
      category: 'medicines',
      description: 'Kills 99.9% germs without water, travel-size bottle',
      price_paise: 3500,
      mrp_paise: 4000,
      in_stock: 1,
      image_url: 'https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=300&auto=format&fit=crop&q=80',
      unit: '50 ml',
      badge: null,
    },

    // Personal Hygiene
    {
      id: 'hyg-1',
      name: 'Dettol Multi-Use Disinfectant Wipes (30s)',
      category: 'hygiene',
      description: 'Sanitizing wet wipes for berth, seat handles and toilet seats',
      price_paise: 11000,
      mrp_paise: 12500,
      in_stock: 1,
      image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80',
      unit: '30 wipes',
      badge: 'Bestseller',
    },
    {
      id: 'hyg-2',
      name: 'PeeSafe Toilet Seat Sanitizer Spray (75ml)',
      category: 'hygiene',
      description: 'Instantly disinfects train toilet seats within 10 seconds',
      price_paise: 13500,
      mrp_paise: 15000,
      in_stock: 1,
      image_url: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=300&auto=format&fit=crop&q=80',
      unit: '75 ml spray',
      badge: 'Must Have',
    },
    {
      id: 'hyg-3',
      name: 'Stayfree Secure Sanitary Pads (6s, XL)',
      category: 'hygiene',
      description: 'Extra-large wings for comfortable leak-free overnight train journey',
      price_paise: 7500,
      mrp_paise: 8000,
      in_stock: 1,
      image_url: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=300&auto=format&fit=crop&q=80',
      unit: '6 pads',
      badge: null,
    },
    {
      id: 'hyg-4',
      name: 'Colgate Travel Dental Kit (Brush + 20g Paste)',
      category: 'hygiene',
      description: 'Compact foldable travel brush and mint toothpaste with cap',
      price_paise: 5000,
      mrp_paise: 6000,
      in_stock: 1,
      image_url: 'https://images.unsplash.com/photo-1559591937-e62fb330bc1f?w=300&auto=format&fit=crop&q=80',
      unit: '1 kit',
      badge: null,
    },
    {
      id: 'hyg-5',
      name: 'Paper Soap Travel Strips (30 Leaves)',
      category: 'hygiene',
      description: 'Pocket-sized fragrant dissolvable paper soap for train washbasins',
      price_paise: 3000,
      mrp_paise: 4000,
      in_stock: 1,
      image_url: 'https://images.unsplash.com/photo-1607006314177-3e6f7b1d9bf5?w=300&auto=format&fit=crop&q=80',
      unit: 'Pack of 2',
      badge: null,
    },

    // Electronics & Chargers
    {
      id: 'elec-1',
      name: 'Portronics 20W Fast Charger Adapter (Type-C + USB)',
      category: 'electronics',
      description: 'Compatible with 110V/220V railway coupe charging sockets',
      price_paise: 39900,
      mrp_paise: 59900,
      in_stock: 1,
      image_url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=300&auto=format&fit=crop&q=80',
      unit: '1 piece',
      badge: 'High Demand',
    },
    {
      id: 'elec-2',
      name: 'Braided Type-C to Type-C Cable (1.5 Meter)',
      category: 'electronics',
      description: 'Long heavy-duty braided cable reaching from wall socket to upper berth',
      price_paise: 19900,
      mrp_paise: 34900,
      in_stock: 1,
      image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&auto=format&fit=crop&q=80',
      unit: '1.5m cable',
      badge: null,
    },
    {
      id: 'elec-3',
      name: 'Braided USB to Lightning iPhone Cable (1.5 Meter)',
      category: 'electronics',
      description: 'MFi certified charging cable with reinforced train-grade joints',
      price_paise: 24900,
      mrp_paise: 49900,
      in_stock: 1,
      image_url: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=300&auto=format&fit=crop&q=80',
      unit: '1.5m cable',
      badge: null,
    },
    {
      id: 'elec-4',
      name: 'Noise Isolating In-Ear Earphones with Mic (3.5mm)',
      category: 'electronics',
      description: 'Blocks train track clatter and coach noise for sleep and calls',
      price_paise: 29900,
      mrp_paise: 49900,
      in_stock: 1,
      image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80',
      unit: '1 pair',
      badge: null,
    },
    {
      id: 'elec-5',
      name: '3-Pin Universal Indian Railway Plug Multi-Socket',
      category: 'electronics',
      description: 'Converts loose 2-pin/3-pin train power points to tight grip sockets',
      price_paise: 14900,
      mrp_paise: 20000,
      in_stock: 1,
      image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&auto=format&fit=crop&q=80',
      unit: '1 unit',
      badge: 'Solves Loose Socket',
    },

    // Baby Care
    {
      id: 'baby-1',
      name: 'Pampers All-Round Protection Diapers (M, 6 Count)',
      category: 'babycare',
      description: 'Ultra-absorbent pants preventing leaks during long station halts',
      price_paise: 16900,
      mrp_paise: 19900,
      in_stock: 1,
      image_url: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=300&auto=format&fit=crop&q=80',
      unit: 'Pack of 6',
      badge: null,
    },
    {
      id: 'baby-2',
      name: "Johnson's Baby Gentle Fragrance-Free Wipes (72s)",
      category: 'babycare',
      description: 'Mild water wipes safe for newborn skin, mouth and feeding bottles',
      price_paise: 14000,
      mrp_paise: 16500,
      in_stock: 1,
      image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80',
      unit: '72 wipes',
      badge: null,
    },
    {
      id: 'baby-3',
      name: 'Nestle Cerelac Wheat Apple Baby Cereal (300g)',
      category: 'babycare',
      description: 'Nutritious instant meal prepared with warm water on the train',
      price_paise: 22000,
      mrp_paise: 23500,
      in_stock: 1,
      image_url: 'https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=300&auto=format&fit=crop&q=80',
      unit: '300 g refill',
      badge: null,
    },
    {
      id: 'baby-4',
      name: 'Feeding Bottle with Anti-Colic Teat (150ml)',
      category: 'babycare',
      description: 'BPA-free travel feeding bottle with spill-proof lid',
      price_paise: 18000,
      mrp_paise: 22000,
      in_stock: 1,
      image_url: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=300&auto=format&fit=crop&q=80',
      unit: '150 ml bottle',
      badge: null,
    },

    // Comfort & Travel Kits
    {
      id: 'comf-1',
      name: 'Inflatable Ergonomic Neck Pillow with Eye Mask',
      category: 'comfort',
      description: 'Compact blow-up pillow for restful sleep on upper or side berths',
      price_paise: 22900,
      mrp_paise: 39900,
      in_stock: 1,
      image_url: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=300&auto=format&fit=crop&q=80',
      unit: '1 combo set',
      badge: 'Popular',
    },
    {
      id: 'comf-2',
      name: 'Silicone Sleeping Earplugs (Pair + Storage Case)',
      category: 'comfort',
      description: 'Reusable soft earplugs dampening train horn and co-passenger noise',
      price_paise: 9900,
      mrp_paise: 14900,
      in_stock: 1,
      image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80',
      unit: '1 pair',
      badge: null,
    },
    {
      id: 'comf-3',
      name: 'Disposable AC Berth Bed Sheet & Pillow Cover Kit',
      category: 'comfort',
      description: 'Ultra-hygienic breathable non-woven travel bedsheet & pillow cover',
      price_paise: 17900,
      mrp_paise: 24900,
      in_stock: 1,
      image_url: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=300&auto=format&fit=crop&q=80',
      unit: '1 bed kit',
      badge: 'Hygienic Choice',
    },
    {
      id: 'comf-4',
      name: 'Number Combination Luggage Wire Lock',
      category: 'comfort',
      description: 'Secure luggage under berth clamp with 3-digit resettable lock',
      price_paise: 15900,
      mrp_paise: 25000,
      in_stock: 1,
      image_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=300&auto=format&fit=crop&q=80',
      unit: '1 lock',
      badge: null,
    },
    {
      id: 'comf-5',
      name: 'Premium Sleep Blindfold Eye Mask with Contour',
      category: 'comfort',
      description: 'Total blackout eye mask allowing undisturbed sleep under coach aisle lights',
      price_paise: 11900,
      mrp_paise: 19900,
      in_stock: 1,
      image_url: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=300&auto=format&fit=crop&q=80',
      unit: '1 piece',
      badge: null,
    },
  ];

  const insert = db.prepare(`
    INSERT INTO products (id, name, category, description, price_paise, mrp_paise, in_stock, image_url, unit, badge)
    VALUES (@id, @name, @category, @description, @price_paise, @mrp_paise, @in_stock, @image_url, @unit, @badge)
  `);

  const insertMany = db.transaction((items) => {
    for (const item of items) insert.run(item);
  });

  insertMany(seedProducts);
  console.log(`[db] Seeded ${seedProducts.length} essentials products.`);
}
