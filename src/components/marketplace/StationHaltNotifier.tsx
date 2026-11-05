import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock } from 'lucide-react-native';
import { JOURNEY_DETAILS } from '../../data/marketplaceData';

interface StationHaltNotifierProps {
  onDetailsPress?: () => void;
}

export const StationHaltNotifier: React.FC<StationHaltNotifierProps> = ({
  onDetailsPress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.leftRow}>
          <Clock size={16} color="#D97706" style={styles.icon} />
          <Text style={styles.text}>
            Scheduled arrival in <Text style={styles.boldText}>{JOURNEY_DETAILS.scheduledArrivalMins} mins</Text>
            {' • '}Halt duration: <Text style={styles.boldText}>{JOURNEY_DETAILS.haltDurationMins} mins</Text>
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onDetailsPress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.detailsText}>Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 4,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 8,
  },
  icon: {
    marginRight: 6,
  },
  text: {
    fontSize: 11.5,
    color: '#78350F',
    fontWeight: '500',
  },
  boldText: {
    fontWeight: '800',
    color: '#92400E',
  },
  detailsText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#92400E',
    textDecorationLine: 'underline',
  },
});

export default StationHaltNotifier;

