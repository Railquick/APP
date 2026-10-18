import { Station, ProductItem } from '../types';

export const INITIAL_STATIONS: Station[] = [
  {
    id: 'unserviceable-pocket-a2',
    name: 'Pocket A 2',
    code: 'PKT-A2',
    city: 'New Delhi',
    isServiceable: false,
    pocketName: 'Pocket A 2',
    addressSnippet: 'A2/20, Po...',
    expectedLaunchDate: 'Launching Next Month'
  },
  {
    id: 'ndls-live',
    name: 'New Delhi Railway Station',
    code: 'NDLS',
    city: 'New Delhi',
    isServiceable: true,
    pocketName: 'Platform 1 - Paharganj Side',
    addressSnippet: 'Paharganj / Ajmeri Gate Side',
    platformCount: 16
  },
  {
    id: 'nzm-live',
    name: 'Hazrat Nizamuddin',
    code: 'NZM',
    city: 'New Delhi',
    isServiceable: true,
    pocketName: 'Platform 3 - Sarai Kale Khan',
    addressSnippet: 'Sarai Kale Khan Gate 2',
    platformCount: 8
  },
  {
    id: 'csmt-soon',
    name: 'Chhatrapati Shivaji Maharaj Terminus',
    code: 'CSMT',
    city: 'Mumbai',
    isServiceable: false,
    pocketName: 'Platform 8',
    addressSnippet: 'Fort, Mumbai',
    expectedLaunchDate: 'Coming in 2 weeks'
  },
  {
    id: 'hwh-soon',
    name: 'Howrah Junction',
    code: 'HWH',
    city: 'Kolkata',
    isServiceable: false,
    pocketName: 'Old Complex',
    addressSnippet: 'Station Rd, Howrah',
    expectedLaunchDate: 'Coming Soon'
  },
  {
    id: 'pnbe-soon',
    name: 'Patna Junction',
    code: 'PNBE',
    city: 'Patna',
    isServiceable: false,
    pocketName: 'Platform 1',
    addressSnippet: 'Station Roundabout, Patna',
    expectedLaunchDate: 'Coming Soon'
  }
];

export const MOCK_PRODUCTS: ProductItem[] = [
  {
    id: 'p1',
    name: 'Amul Kulhad Chai (Hot & Fresh)',
    category: 'Chai & Beverages',
    price: 25,
    originalPrice: 30,
    weightOrVolume: '150 ml',
    deliveryTimeMins: 8,
    imageUrl: '☕',
    tag: 'Bestseller',
    inStock: true
  },
  {
    id: 'p2',
    name: 'RailSpecial Veg Biryani with Raita',
    category: 'Hot Meals',
    price: 160,
    originalPrice: 199,
    weightOrVolume: '450 g',
    deliveryTimeMins: 12,
    imageUrl: '🍛',
    tag: 'Fresh & Hygienic',
    inStock: true
  },
  {
    id: 'p3',
    name: 'Rail Neer Packaged Drinking Water',
    category: 'Chai & Beverages',
    price: 15,
    weightOrVolume: '1 L',
    deliveryTimeMins: 5,
    imageUrl: '💧',
    inStock: true
  },
  {
    id: 'p4',
    name: "Haldiram's Bhujia Sev",
    category: 'Train Snacks',
    price: 45,
    weightOrVolume: '200 g',
    deliveryTimeMins: 8,
    imageUrl: '🥨',
    inStock: true
  },
  {
    id: 'p5',
    name: "Lay's Classic Salted Chips",
    category: 'Train Snacks',
    price: 20,
    weightOrVolume: '50 g',
    deliveryTimeMins: 8,
    imageUrl: '🥔',
    inStock: true
  },
  {
    id: 'p6',
    name: 'Coca-Cola Can Chilled',
    category: 'Chai & Beverages',
    price: 40,
    weightOrVolume: '300 ml',
    deliveryTimeMins: 8,
    imageUrl: '🥤',
    inStock: true
  },
  {
    id: 'p7',
    name: 'Dettol Disinfectant Wet Wipes',
    category: 'Travel Essentials',
    price: 75,
    weightOrVolume: '25 wipes',
    deliveryTimeMins: 10,
    imageUrl: '🧼',
    inStock: true
  },
  {
    id: 'p8',
    name: 'Pampers Baby Dry Pants (M)',
    category: 'Baby Care',
    price: 180,
    weightOrVolume: 'Pack of 10',
    deliveryTimeMins: 10,
    imageUrl: '👶',
    inStock: true
  }
];
