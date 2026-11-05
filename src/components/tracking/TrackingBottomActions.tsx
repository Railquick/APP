import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Headset, Store } from 'lucide-react-native';

interface TrackingBottomActionsProps {
  onBackToHome: () => void;
  station: string;
}

export const TrackingBottomActions: React.FC<TrackingBottomActionsProps> = ({
  onBackToHome,
  station,
}) => {
  const handleNeedHelp = () => {
    Alert.alert(
      'Station Help & Support',
      `RailQuick 24/7 Platform Assistance for ${station}.\nHelpline: 1800-RAIL-QUICK\nIRCTC Station Master Control: Platform 1 & 2`,
      [{ text: 'Dismiss' }]
    );
  };

  return (
    <View style={styles.container}>
      {/* Help / Contact Station Master */}
      <TouchableOpacity
        style={styles.helpButton}
        activeOpacity={0.85}
        onPress={handleNeedHelp}
      >
        <Headset size={18} color="#ba1a1a" />
        <Text style={styles.helpText}>Need Help / Contact Station Master</Text>
      </TouchableOpacity>

      {/* Back to Home Store */}
      <TouchableOpacity
        style={styles.homeButton}
        activeOpacity={0.88}
        onPress={onBackToHome}
      >
        <Store size={18} color="#FFFFFF" />
        <Text style={styles.homeText}>Back to Home Store</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 10,
    marginTop: 6,
    marginBottom: 24,
  },
  helpButton: {
    height: 48,
    borderRadius: 10,
    backgroundColor: '#deecdf',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  helpText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#121e16',
  },
  homeButton: {
    height: 48,
    borderRadius: 10,
    backgroundColor: '#006b2f',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#006b2f',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  homeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default TrackingBottomActions;

