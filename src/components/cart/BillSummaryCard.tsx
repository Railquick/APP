import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ReceiptText } from 'lucide-react-native';
import { CartSummary } from '../../types/cart';

interface BillSummaryCardProps {
  summary: CartSummary;
}

export const BillSummaryCard: React.FC<BillSummaryCardProps> = ({ summary }) => {
  return (
    <View style={styles.card}>
      {/* Title */}
      <View style={styles.headerRow}>
        <ReceiptText size={18} color="#006b2f" />
        <Text style={styles.title}>Bill Summary</Text>
      </View>

      <View style={styles.rowsContainer}>
        {/* Item Total */}
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Item Total</Text>
          <Text style={styles.rowValue}>₹{summary.itemTotal}</Text>
        </View>

        {/* Berth Delivery Fee */}
        <View style={styles.row}>
          <View style={styles.feeLabelGroup}>
            <Text style={styles.rowLabel}>Berth Delivery Fee</Text>
            <View style={styles.promoBadge}>
              <Text style={styles.promoBadgeText}>5-MIN HALT PROMO</Text>
            </View>
          </View>
          <View style={styles.feeValueGroup}>
            <Text style={styles.originalFee}>₹{summary.originalDeliveryFee}</Text>
            <Text style={styles.freeText}>FREE</Text>
          </View>
        </View>

        {/* Handling & Platform Taxes */}
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Handling & Platform Taxes</Text>
          <Text style={styles.freeText}>₹0</Text>
        </View>

        <View style={styles.divider} />

        {/* Total Amount & Savings */}
        <View style={styles.totalRow}>
          <View>
            <Text style={styles.totalLabel}>Total Amount</Text>
            {summary.totalSavings > 0 && (
              <Text style={styles.savingsText}>
                You saved ₹{summary.totalSavings} on this order
              </Text>
            )}
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
  rowLabel: {
    fontSize: 13.5,
    color: '#3e4a3e',
  },
  rowValue: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#121e16',
  },
  feeLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  promoBadge: {
    backgroundColor: '#ffe08f',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  promoBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#241a00',
  },
  feeValueGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  originalFee: {
    fontSize: 12,
    color: '#6e7a6d',
    textDecorationLine: 'line-through',
  },
  freeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#006b2f',
  },
  divider: {
    height: 1,
    backgroundColor: '#deecdf',
    marginVertical: 4,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  totalLabel: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#121e16',
  },
  savingsText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#006b2f',
    marginTop: 2,
  },
  totalPrice: {
    fontSize: 22,
    fontWeight: '900',
    color: '#121e16',
    letterSpacing: -0.5,
  },
});

export default BillSummaryCard;

