import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ShieldCheck, UserCheck, IndianRupee } from 'lucide-react-native';

interface BerthDeliveryPromiseProps {
  station: string;
}

export const BerthDeliveryPromise: React.FC<BerthDeliveryPromiseProps> = ({ station }) => {
  return (
    <View style={styles.card}>
      {/* Title */}
      <View style={styles.headerRow}>
        <ShieldCheck size={20} color="#006d34" />
        <Text style={styles.title}>Berth Delivery Promise</Text>
      </View>

      {/* Point 1: Delivery to berth */}
      <View style={styles.pointRow}>
        <View style={styles.iconCircle}>
          <UserCheck size={16} color="#007237" />
        </View>
        <Text style={styles.pointText}>
          Runner will deliver directly to your berth before the train departs from{' '}
          <Text style={styles.boldStation}>{station}</Text>.
        </Text>
      </View>

      {/* Point 2: Guarantee */}
      <View style={styles.guaranteeBox}>
        <View style={styles.goldCircle}>
          <IndianRupee size={14} color="#503d00" strokeWidth={2.5} />
        </View>
        <Text style={styles.guaranteeText}>
          <Text style={styles.goldBold}>100% money back guarantee</Text> if runner
          misses coach. Auto-refund within 10 mins.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    gap: 12,
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
  },
  title: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#121e16',
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(149, 244, 170, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  pointText: {
    fontSize: 13,
    color: '#3e4a3e',
    flex: 1,
    lineHeight: 18,
  },
  boldStation: {
    fontWeight: '700',
    color: '#121e16',
  },
  guaranteeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(233, 247, 234, 0.7)',
    borderRadius: 10,
    padding: 10,
  },
  goldCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#ffe08f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guaranteeText: {
    fontSize: 12,
    color: '#121e16',
    flex: 1,
    lineHeight: 16,
    fontWeight: '500',
  },
  goldBold: {
    fontWeight: '800',
    color: '#755b00',
  },
});

export default BerthDeliveryPromise;

