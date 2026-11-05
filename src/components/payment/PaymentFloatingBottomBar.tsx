import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowRight, Check } from 'lucide-react-native';
import { PaymentMethodId } from '../../types/payment';

interface PaymentFloatingBottomBarProps {
  coach: string;
  berth: string;
  totalPayable: number;
  totalCount: number;
  selectedMethod: PaymentMethodId;
  isProcessing: boolean;
  isSuccess: boolean;
  onPayPress: () => void;
}

export const PaymentFloatingBottomBar: React.FC<PaymentFloatingBottomBarProps> = ({
  coach,
  berth,
  totalPayable,
  totalCount,
  selectedMethod,
  isProcessing,
  isSuccess,
  onPayPress,
}) => {
  const insets = useSafeAreaInsets();

  const buttonLabel =
    selectedMethod === 'razorpay' ? 'Pay & Place Order' : 'Confirm Berth Order';

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <View style={styles.contentRow}>
        {/* Left: Seat info & Price */}
        <View style={styles.leftInfo}>
          <Text style={styles.seatText}>
            COACH {coach} • BERTH {berth}
          </Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceText}>₹{totalPayable}</Text>
            <Text style={styles.itemsCountText}>{totalCount} items</Text>
          </View>
        </View>

        {/* Right: Action Button */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            isProcessing && styles.buttonProcessing,
            isSuccess && styles.buttonSuccess,
          ]}
          activeOpacity={0.88}
          disabled={isProcessing || isSuccess}
          onPress={onPayPress}
        >
          {isProcessing ? (
            <View style={styles.buttonInner}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.buttonText}>Connecting Runner...</Text>
            </View>
          ) : isSuccess ? (
            <View style={styles.buttonInner}>
              <Check size={18} color="#FFFFFF" strokeWidth={3} />
              <Text style={styles.buttonText}>Order Placed!</Text>
            </View>
          ) : (
            <View style={styles.buttonInner}>
              <Text style={styles.buttonText}>{buttonLabel}</Text>
              <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.6} />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: 'rgba(239, 253, 240, 0.95)',
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
  seatText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#3e4a3e',
    letterSpacing: 0.5,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 1,
  },
  priceText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#121e16',
  },
  itemsCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#006b2f',
  },
  actionButton: {
    backgroundColor: '#006b2f',
    borderRadius: 10,
    paddingHorizontal: 18,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#006b2f',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
    minWidth: 170,
  },
  buttonProcessing: {
    backgroundColor: '#00873e',
    opacity: 0.85,
  },
  buttonSuccess: {
    backgroundColor: '#00873e',
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
});

export default PaymentFloatingBottomBar;

