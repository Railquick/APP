import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ShoppingBag, ChevronDown } from 'lucide-react-native';
import { OrderItem } from '../../types/order';

interface OrderSummaryAccordionProps {
  items: OrderItem[];
  totalAmount: number;
  paymentMethodTitle: string;
}

export const OrderSummaryAccordion: React.FC<OrderSummaryAccordionProps> = ({
  items,
  totalAmount,
  paymentMethodTitle,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  return (
    <View style={styles.card}>
      {/* Header Button */}
      <TouchableOpacity
        style={styles.headerBtn}
        activeOpacity={0.7}
        onPress={() => setIsExpanded((prev) => !prev)}
      >
        <View style={styles.headerLeft}>
          <View style={styles.iconCircle}>
            <ShoppingBag size={18} color="#006b2f" />
          </View>
          <View>
            <Text style={styles.headerTitle}>{items.length} Items in Order</Text>
            <Text style={styles.headerSubtitle}>
              Paid ₹{totalAmount} via {paymentMethodTitle}
            </Text>
          </View>
        </View>

        <ChevronDown
          size={20}
          color="#3e4a3e"
          style={{
            transform: [{ rotate: isExpanded ? '180deg' : '0deg' }],
          }}
        />
      </TouchableOpacity>

      {/* Collapsible Content */}
      {isExpanded && (
        <View style={styles.contentBox}>
          <View style={styles.itemsWrapper}>
            {items.map((item, idx) => (
              <View key={item.id || idx} style={styles.itemRow}>
                <Text style={styles.itemTitle} numberOfLines={1}>
                  {item.quantity}x {item.name}
                </Text>
                <Text style={styles.itemPrice}>₹{item.subtotal || item.price * item.quantity}</Text>
              </View>
            ))}

            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Paid</Text>
              <Text style={styles.totalPrice}>₹{totalAmount}</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  headerBtn: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e3f2e5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#121e16',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#3e4a3e',
    marginTop: 2,
  },
  contentBox: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  itemsWrapper: {
    backgroundColor: '#e9f7ea',
    borderRadius: 10,
    padding: 12,
    gap: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#121e16',
    flex: 1,
    paddingRight: 8,
  },
  itemPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3e4a3e',
  },
  divider: {
    height: 1,
    backgroundColor: '#deecdf',
    marginVertical: 2,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  totalLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#121e16',
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: '900',
    color: '#006b2f',
  },
});

export default OrderSummaryAccordion;

