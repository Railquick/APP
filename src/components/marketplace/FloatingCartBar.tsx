import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Image } from 'expo-image';
import { ShoppingCart, ArrowRight } from 'lucide-react-native';
import { useCart } from '../../context/CartContext';
import { PRODUCTS } from '../../data/marketplaceData';

interface FloatingCartBarProps {
  bottomOffset?: number;
  onPress?: () => void;
}

// Map product id -> local image require
const LOCAL_IMAGES: Record<string, ReturnType<typeof require>> = {
  'prod-cable': require('../../assets/products/anker_charger.png'),
  'prod-anker': require('../../assets/products/anker_charger.png'),
  'prod-usb-hub': require('../../assets/products/usb_hub.png'),
  'prod-ors': require('../../assets/products/crocin_tablets.png'),
  'prod-crocin': require('../../assets/products/crocin_tablets.png'),
  'prod-vitamins': require('../../assets/products/daily_vitamins.png'),
  'prod-granola': require('../../assets/products/granola_bars.png'),
  'prod-lays': require('../../assets/products/lays_chips.png'),
  'prod-sanitary': require('../../assets/products/sanitary_pads.png'),
  'prod-cough': require('../../assets/products/cough_syrup.png'),
};

const LOGO = require('../../assets/products/logorailquick.png');

function getProductImage(productId: string): ReturnType<typeof require> | null {
  if (LOCAL_IMAGES[productId]) return LOCAL_IMAGES[productId];
  const product = PRODUCTS.find((p) => p.id === productId);
  if (product?.localImage) {
    if (LOCAL_IMAGES[productId]) return LOCAL_IMAGES[productId];
  }
  return null;
}

const MAX_SHOWN = 4;

export const FloatingCartBar: React.FC<FloatingCartBarProps> = ({
  bottomOffset = 68,
  onPress,
}) => {
  const { totalCount, totalPrice, items } = useCart();

  if (totalCount === 0) return null;

  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }
    Alert.alert(
      'Coach Order Summary',
      `${totalCount} items in cart totaling ₹${totalPrice}.\nReady for 5-Min Berth Delivery.`,
      [
        { text: 'Continue Shopping', style: 'cancel' },
        { text: 'Place Order', onPress: () => Alert.alert('Success', 'Order placed! Runner dispatched.') },
      ]
    );
  };

  // Build unique product slots for the image queue (one slot per distinct product)
  const uniqueItems = items.slice(0, MAX_SHOWN);
  const extraCount = items.length > MAX_SHOWN ? items.length - MAX_SHOWN : 0;

  return (
    <View style={[styles.wrapper, { bottom: bottomOffset }]} pointerEvents="box-none">
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={handlePress}
        style={styles.cartBar}
      >
        {/* LEFT: Product image stack queue */}
        <View style={styles.leftGroup}>
          <View style={styles.imageQueue}>
            {uniqueItems.map((item, index) => {
              const src = getProductImage(item.id);
              return (
                <View
                  key={item.id}
                  style={[
                    styles.avatarWrapper,
                    { marginLeft: index === 0 ? 0 : -10, zIndex: MAX_SHOWN - index },
                  ]}
                >
                  {src ? (
                    <Image
                      source={src}
                      style={styles.avatarImage}
                      contentFit="contain"
                    />
                  ) : (
                    <View style={styles.avatarFallback}>
                      <ShoppingCart size={13} color="#FFFFFF" strokeWidth={2} />
                    </View>
                  )}
                </View>
              );
            })}
            {extraCount > 0 && (
              <View style={[styles.avatarWrapper, styles.extraBadge, { marginLeft: -10 }]}>
                <Text style={styles.extraBadgeText}>+{extraCount}</Text>
              </View>
            )}
          </View>

          {/* Count + Total */}
          <View style={styles.textColumn}>
            <Text style={styles.itemCountText}>
              {totalCount} {totalCount === 1 ? 'ITEM' : 'ITEMS'}
            </Text>
            <Text style={styles.totalPriceText}>₹{totalPrice}</Text>
          </View>
        </View>

        {/* RIGHT: View Cart Button */}
        <View style={styles.viewCartButton}>
          <Text style={styles.viewCartText}>View Cart</Text>
          <ArrowRight size={16} color="#159447" strokeWidth={2.6} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const AVATAR_SIZE = 32;

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 14,
    right: 14,
    zIndex: 60,
  },
  cartBar: {
    backgroundColor: '#159447',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#159447',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.38,
    shadowRadius: 16,
    elevation: 10,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  imageQueue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 2,
    borderColor: '#159447',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: AVATAR_SIZE - 4,
    height: AVATAR_SIZE - 4,
  },
  avatarFallback: {
    width: AVATAR_SIZE - 4,
    height: AVATAR_SIZE - 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: (AVATAR_SIZE - 4) / 2,
  },
  extraBadge: {
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  extraBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  textColumn: {
    flexDirection: 'column',
  },
  itemCountText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D1FAE5',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  totalPriceText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 1,
  },
  viewCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  viewCartText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#159447',
  },
});

export default FloatingCartBar;

