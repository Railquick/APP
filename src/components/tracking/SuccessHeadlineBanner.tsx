import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CheckCircle2, ShieldCheck } from 'lucide-react-native';

interface SuccessHeadlineBannerProps {
  orderId: string;
  statusBadge?: string;
  deliveryOtp?: string;
}

export const SuccessHeadlineBanner: React.FC<SuccessHeadlineBannerProps> = ({
  orderId,
  statusBadge = 'Placed - Delivery at Hazrat Nizamuddin',
  deliveryOtp,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.leftGroup}>
        <View style={styles.checkIconBox}>
          <CheckCircle2 size={24} color="#88faa0" />
        </View>

        <View style={styles.textCol}>
          <View style={styles.badgeRow}>
            <View style={styles.statusPill}>
              <ShieldCheck size={11} color="#005226" />
              <Text style={styles.statusPillText}>{statusBadge}</Text>
            </View>
          </View>
          <Text style={styles.headline}>Order Placed Successfully!</Text>
          <Text style={styles.orderIdText}>Order #{orderId}</Text>
        </View>
      </View>

      {deliveryOtp ? (
        <View style={styles.otpPill}>
          <Text style={styles.otpLabel}>DELIVERY OTP</Text>
          <Text style={styles.otpValue}>{deliveryOtp}</Text>
        </View>
      ) : (
        <View style={styles.liveBadge}>
          <Text style={styles.liveBadgeText}>NZM PILOT HUB</Text>
        </View>
      )}
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
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  statusPill: {
    backgroundColor: '#88faa0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusPillText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#005226',
    letterSpacing: 0.2,
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
  otpPill: {
    backgroundColor: '#ffe08f',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  otpLabel: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#503d00',
    letterSpacing: 0.5,
  },
  otpValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#241a00',
    letterSpacing: 1.5,
    marginTop: 1,
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
