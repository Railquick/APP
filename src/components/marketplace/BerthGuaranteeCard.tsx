import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ShieldCheck } from 'lucide-react-native';

export const BerthGuaranteeCard: React.FC = () => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#E7F8EE', '#FFFFFF', '#E7F8EE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.card}
      >
        <View style={styles.iconContainer}>
          <ShieldCheck size={22} color="#FFFFFF" strokeWidth={2.4} />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>RailQuick Berth Guarantee</Text>
          <Text style={styles.description}>
            If the runner misses your coach before the train departs, instant 100% refund is initiated automatically.
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 14,
    marginTop: 18,
    marginBottom: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: '#C3EDD1',
    gap: 12,
    shadowColor: '#159447',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#159447',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#159447',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  description: {
    fontSize: 11,
    fontWeight: '500',
    color: '#475569',
    marginTop: 3,
    lineHeight: 15,
  },
});

export default BerthGuaranteeCard;

