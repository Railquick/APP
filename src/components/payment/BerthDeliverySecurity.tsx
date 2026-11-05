import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';

export const BerthDeliverySecurity: React.FC = () => {
  return (
    <View style={styles.card}>
      <View style={styles.iconCircle}>
        <ShieldCheck size={20} color="#006d34" strokeWidth={2.4} />
      </View>

      <View style={styles.textCol}>
        <Text style={styles.title}>Berth Delivery Security</Text>
        <Text style={styles.description}>
          Verified IRCTC station runners with photo ID and instant 4-digit OTP
          handover at your coach seat.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#e9f7ea',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#95f4aa',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textCol: {
    flex: 1,
  },
  title: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#121e16',
  },
  description: {
    fontSize: 11.5,
    color: '#3e4a3e',
    lineHeight: 16,
    marginTop: 2,
  },
});

export default BerthDeliverySecurity;

