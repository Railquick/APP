import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowRight } from 'lucide-react-native';

interface CartFloatingBottomBarProps {
  coach: string;
  berth: string;
  totalPayable: number;
  onProceed: () => void;
  onViewBreakup?: () => void;
}

export const CartFloatingBottomBar: React.FC<CartFloatingBottomBarProps> = ({
  coach,
  berth,
  totalPayable,
  onProceed,
  onViewBreakup,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <View style={styles.contentRow}>
        {/* Left: Seat info & Price */}
        <View style={styles.leftInfo}>
          <View style={styles.seatRow}>
            <View style={styles.pulseDot} />
            <Text style={styles.seatText}>
              Coach {coach} • Berth {berth}
            </Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceText}>₹{totalPayable}</Text>
            {onViewBreakup && (
              <TouchableOpacity
                onPress={onViewBreakup}
                activeOpacity={0.7}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Text style={styles.viewBreakupText}>VIEW BREAKUP</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Right: Proceed to Payment Button */}
        <TouchableOpacity
          style={styles.proceedButton}
          activeOpacity={0.88}
          onPress={onProceed}
        >
          <Text style={styles.proceedButtonText}>Proceed to Payment</Text>
          <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.6} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderTopWidth: 1,
    borderTopColor: '#deecdf',
    paddingHorizontal: 16,
    paddingTop: 10,
    shadowColor: '#17231B',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
  },
  leftInfo: {
    flex: 1,
    minWidth: 0,
  },
  seatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#006b2f',
  },
  seatText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3e4a3e',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginTop: 2,
  },
  priceText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#121e16',
  },
  viewBreakupText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#006b2f',
    letterSpacing: 0.3,
  },
  proceedButton: {
    backgroundColor: '#006b2f',
    borderRadius: 10,
    paddingHorizontal: 18,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#006b2f',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  proceedButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default CartFloatingBottomBar;

