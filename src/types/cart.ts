import { ProductItem } from './product';

export interface CartItem {
  productId: string;
  product: ProductItem;
  quantity: number;
  itemTotal: number;
}

export interface CartSummary {
  itemTotal: number;
  originalTotal: number;
  deliveryFee: number;
  originalDeliveryFee: number;
  isDeliveryFree: boolean;
  handlingFee: number;
  totalSavings: number;
  totalPayable: number;
  totalCount: number;
}

