export interface ProductItem {
  id: string;
  name: string;
  shortName?: string;
  category: string;
  price: number;
  mrp: number;
  weight: string;
  badge?: string;
  discountBadge?: string;
  deliveryTime: string;
  description: string;
  iconType: string;
  localImage?: any;
  imageUrl?: string;
  rating?: number;
  specs?: string;
  tags?: string[];
}

export interface CategoryInfo {
  id: string;
  name: string;
  icon: string;
  subtitle: string;
  itemCount: number;
  accentColor: string;
  bgColor: string;
  borderColor: string;
  layout: 'grid-2' | 'grid-3' | 'horizontal-list';
}

