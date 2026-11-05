import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';

interface SuccessHeadlineBannerProps {
  orderId: string;
}

export const SuccessHeadlineBanner: React.FC<SuccessHeadlineBannerProps> = ({ orderId }) => {
  return (
    <View style={styles.card}>
      <View style={styles.leftGroup}>
        <View style={styles.checkIconBox}>
          <CheckCircle2 size={24} color="#88faa0" />
        </View>

        <View style={styles.textCol}>
          <Text style={styles.verifiedTag}>ORDER VERIFIED</Text>
          <Text style={styles.headline}>Order Placed Successfully!</Text>
          <Text style={styles.orderIdText}>Order #{orderId}</Text>
        </View>
      </View>

      <View style={styles.liveBadge}>
        <Text style={styles.liveBadgeText}>INSTANT LIVE</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#006b2f',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    shadowColor: '#006b2f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  checkIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textCol: {
    flex: 1,
    minWidth: 0,
  },
  verifiedTag: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#88faa0',
    letterSpacing: 0.5,
  },
  headline: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
    lineHeight: 20,
  },
  orderIdText: {
    fontSize: 11.5,
    color: '#6cdd86',
    marginTop: 2,
  },
  liveBadge: {
    backgroundColor: '#00873e',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    flexShrink: 0,
  },
  liveBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#f7fff3',
    letterSpacing: 0.3,
  },
});

export default SuccessHeadlineBanner;

