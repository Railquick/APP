export type ProductEntranceStyle =
  | 'bounce_rotate'
  | 'slide_up_scale'
  | 'zoom_fade'
  | 'slide_side_spring'
  | 'upward_glow';

export interface ProductItem {
  id: string;
  name: string;
  category: 'Snacks' | 'Electronics' | 'Healthcare' | 'Personal Care' | 'Nutrition';
  description: string;
  priceTag: string;
  deliveryEta: string;
  image: any;
  entranceStyle: ProductEntranceStyle;
  spotlightColor: string;
}

export const FEATURED_PRODUCTS: ProductItem[] = [
  {
    id: 'prod-1',
    name: "Lay's Classic Sea Salt",
    category: 'Snacks',
    description: 'Crispy golden potato chips',
    priceTag: '₹20',
    deliveryEta: '',
    image: require('../assets/products/lays_chips.png'),
    entranceStyle: 'bounce_rotate',
    spotlightColor: 'rgba(251, 191, 36, 0.28)', // Warm golden glow
  },
  {
    id: 'prod-2',
    name: 'Anker 65W GaN Fast Charger',
    category: 'Electronics',
    description: 'Ultra-fast dual USB-C adapter',
    priceTag: '₹1,499',
    deliveryEta: '',
    image: require('../assets/products/anker_charger.png'),
    entranceStyle: 'slide_side_spring',
    spotlightColor: 'rgba(56, 189, 248, 0.28)', // Tech cyan glow
  },
  {
    id: 'prod-3',
    name: 'Crocin Paracetamol 500mg',
    category: 'Healthcare',
    description: 'Fast relief for fever & headache',
    priceTag: '₹35',
    deliveryEta: '',
    image: require('../assets/products/crocin_tablets.png'),
    entranceStyle: 'upward_glow',
    spotlightColor: 'rgba(96, 165, 250, 0.28)', // Medical blue glow
  },
  {
    id: 'prod-4',
    name: 'Nature Valley Granola Bars',
    category: 'Nutrition',
    description: 'Crunchy Oats & Honey energy snack',
    priceTag: '₹60',
    deliveryEta: '',
    image: require('../assets/products/granola_bars.png'),
    entranceStyle: 'bounce_rotate',
    spotlightColor: 'rgba(245, 158, 11, 0.28)', // Amber snack glow
  },
  {
    id: 'prod-5',
    name: 'UGREEN 6-in-1 USB-C Hub',
    category: 'Electronics',
    description: 'Braided 4K HDMI & USB 3.0 dock',
    priceTag: '₹2,199',
    deliveryEta: '',
    image: require('../assets/products/usb_hub.png'),
    entranceStyle: 'slide_side_spring',
    spotlightColor: 'rgba(148, 163, 184, 0.25)', // Silver/slate glow
  },
  {
    id: 'prod-6',
    name: 'Stayfree Secure Hygiene Pack',
    category: 'Personal Care',
    description: 'Comfort cottony soft pads',
    priceTag: '₹85',
    deliveryEta: '',
    image: require('../assets/products/sanitary_pads.png'),
    entranceStyle: 'zoom_fade',
    spotlightColor: 'rgba(52, 211, 153, 0.28)', // Mint hygiene glow
  },
  {
    id: 'prod-7',
    name: 'Herbal Cough Relief Syrup',
    category: 'Healthcare',
    description: 'Non-drowsy soothing throat relief',
    priceTag: '₹95',
    deliveryEta: '',
    image: require('../assets/products/cough_syrup.png'),
    entranceStyle: 'upward_glow',
    spotlightColor: 'rgba(234, 88, 12, 0.25)', // Herbal amber glow
  },
  {
    id: 'prod-8',
    name: 'Daily Multivitamin Essentials',
    category: 'Healthcare',
    description: 'Immunity & energy booster tablets',
    priceTag: '₹349',
    deliveryEta: '',
    image: require('../assets/products/daily_vitamins.png'),
    entranceStyle: 'slide_up_scale',
    spotlightColor: 'rgba(250, 204, 21, 0.28)', // Vitamin yellow glow
  },
];

