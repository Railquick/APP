import React, { createContext, useContext, useState, useMemo } from 'react';
import { ProductItem } from '../types/product';
import { PRODUCTS } from '../data/marketplaceData';

export interface WishlistContextType {
  wishlistIds: string[];
  wishlistItems: ProductItem[];
  wishlistCount: number;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

// Initial demo wishlist items
const INITIAL_WISHLIST: string[] = ['prod-cable', 'prod-spotlight-gan', 'prod-granola'];

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlistIds, setWishlistIds] = useState<string[]>(INITIAL_WISHLIST);

  const productMap = useMemo(() => {
    const map = new Map<string, ProductItem>();
    PRODUCTS.forEach((p) => map.set(p.id, p));
    return map;
  }, []);

  const wishlistItems = useMemo(() => {
    return wishlistIds
      .map((id) => productMap.get(id))
      .filter(Boolean) as ProductItem[];
  }, [wishlistIds, productMap]);

  const wishlistCount = wishlistIds.length;

  const toggleWishlist = (productId: string) => {
    setWishlistIds((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => {
    return wishlistIds.includes(productId);
  };

  const removeFromWishlist = (productId: string) => {
    setWishlistIds((prev) => prev.filter((id) => id !== productId));
  };

  const clearWishlist = () => {
    setWishlistIds([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        wishlistItems,
        wishlistCount,
        toggleWishlist,
        isInWishlist,
        removeFromWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export default WishlistContext;

