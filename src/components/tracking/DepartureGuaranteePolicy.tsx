import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';

interface DepartureGuaranteePolicyProps {
  coach: string;
  station: string;
}

export const DepartureGuaranteePolicy: React.FC<DepartureGuaranteePolicyProps> = ({
  coach,
  station,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.iconCircle}>
        <ShieldCheck size={18} color="#006d34" strokeWidth={2.4} />
      </View>

      <View style={styles.textCol}>
        <Text style={styles.title}>RailQuick 100% Departure Guarantee</Text>
        <Text style={styles.description}>
          If our runner misses Coach {coach} before train departure from {station},
          an instant automatic refund will be credited to your account within 60 seconds.
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
    alignItems: 'flex-start',
    gap: 12,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#95f4aa',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  textCol: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
    color: '#121e16',
  },
  description: {
    fontSize: 11.5,
    color: '#3e4a3e',
    lineHeight: 16,
    marginTop: 2,
  },
});

export default DepartureGuaranteePolicy;

