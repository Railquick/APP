import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { ShoppingBag, ArrowRight } from 'lucide-react-native';
import { useCart } from '../../context/CartContext';

interface FloatingCartBarProps {
  bottomOffset?: number;
  onPress?: () => void;
}

export const FloatingCartBar: React.FC<FloatingCartBarProps> = ({
  bottomOffset = 68,
  onPress,
}) => {
  const { totalCount, totalPrice } = useCart();

  if (totalCount === 0) return null;

  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }

    Alert.alert(
      'Coach Order Summary',
      `${totalCount} items in cart totaling ₹${totalPrice}.\nReady for 5-Min Berth Delivery at Bhopal Jn (Coach B2, Berth 36).`,
      [
        { text: 'Continue Shopping', style: 'cancel' },
        { text: 'Place Order', onPress: () => Alert.alert('Success', 'Order placed! Runner dispatched.') },
      ]
    );
  };

  return (
    <View style={[styles.wrapper, { bottom: bottomOffset }]} pointerEvents="box-none">
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={handlePress}
        style={styles.cartBar}
      >
        {/* Left Side: Shopping Bag + Count & Total */}
        <View style={styles.leftGroup}>
          <View style={styles.iconBox}>
            <ShoppingBag size={20} color="#FFFFFF" strokeWidth={2.4} />
          </View>

          <View style={styles.textColumn}>
            <Text style={styles.itemCountText}>
              {totalCount} {totalCount === 1 ? 'ITEM' : 'ITEMS'}
            </Text>
            <Text style={styles.totalPriceText}>₹{totalPrice}</Text>
          </View>
        </View>

        {/* Right Side: View Cart Button */}
        <View style={styles.viewCartButton}>
          <Text style={styles.viewCartText}>View Cart</Text>
          <ArrowRight size={16} color="#159447" strokeWidth={2.6} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

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
    paddingVertical: 11,
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
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textColumn: {
    flexDirection: 'column',
  },
  itemCountText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#D1FAE5',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  totalPriceText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 1,
  },
  viewCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
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

