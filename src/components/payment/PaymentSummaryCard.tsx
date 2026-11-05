import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ReceiptText, Zap } from 'lucide-react-native';
import { CartSummary } from '../../types/cart';

interface PaymentSummaryCardProps {
  summary: CartSummary;
}

export const PaymentSummaryCard: React.FC<PaymentSummaryCardProps> = ({ summary }) => {
  return (
    <View style={styles.card}>
      {/* Title */}
      <View style={styles.headerRow}>
        <ReceiptText size={18} color="#006d34" />
        <Text style={styles.title}>Payment Summary</Text>
      </View>

      <View style={styles.rowsContainer}>
        {/* Item Total */}
        <View style={styles.row}>
          <Text style={styles.rowLabel}>
            Item Total ({summary.totalCount} essentials)
          </Text>
          <Text style={styles.rowValue}>₹{summary.itemTotal}</Text>
        </View>

        {/* Berth Delivery Charges */}
        <View style={styles.row}>
          <View style={styles.labelWithIcon}>
            <Text style={styles.rowLabel}>Berth Delivery Charges</Text>
            <Zap size={14} color="#006b2f" fill="#006b2f" />
          </View>
          <Text style={styles.freeText}>FREE</Text>
        </View>

        {/* Platform Service Fee */}
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Platform Service Fee</Text>
          <Text style={styles.freeText}>FREE</Text>
        </View>

        {/* Total Payable Container */}
        <View style={styles.totalBox}>
          <View>
            <Text style={styles.totalLabel}>Total Payable</Text>
            <Text style={styles.cessLabel}>Inclusive of all train cess</Text>
          </View>

          <Text style={styles.totalPrice}>₹{summary.totalPayable}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 10,
  },
  title: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#121e16',
  },
  rowsContainer: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  labelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rowLabel: {
    fontSize: 13.5,
    color: '#3e4a3e',
  },
  rowValue: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#121e16',
  },
  freeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#006b2f',
  },
  totalBox: {
    marginTop: 6,
    backgroundColor: '#e9f7ea',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#121e16',
  },
  cessLabel: {
    fontSize: 10.5,
    color: '#3e4a3e',
    marginTop: 1,
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: '900',
    color: '#006b2f',
    letterSpacing: -0.5,
  },
});

export default PaymentSummaryCard;

