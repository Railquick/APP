import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Headset, Store } from 'lucide-react-native';
import {
  SupportHelpModal,
} from '../common/SupportHelpButton';
import { SUPPORT_CONFIG } from '../../config/constants';

interface TrackingBottomActionsProps {
  onBackToHome: () => void;
  station: string;
  runnerName?: string;
  orderId?: string;
  coach?: string;
  berth?: string;
}

export const TrackingBottomActions: React.FC<TrackingBottomActionsProps> = ({
  onBackToHome,
  station,
  runnerName,
  orderId,
  coach,
  berth,
}) => {
  const [helpModalVisible, setHelpModalVisible] = useState(false);

  return (
    <>
      <View style={styles.container}>
        {/* Help / Contact Station Ops & Runner */}
        <TouchableOpacity
          style={styles.helpButton}
          activeOpacity={0.85}
          onPress={() => setHelpModalVisible(true)}
        >
          <Headset size={18} color="#006b2f" />
          <Text style={styles.helpText}>Need Help? Contact NZM Station Ops</Text>
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

      <SupportHelpModal
        visible={helpModalVisible}
        onClose={() => setHelpModalVisible(false)}
        stationName={station || SUPPORT_CONFIG.STATION_NAME}
        runnerName={runnerName}
        orderId={orderId}
        coach={coach}
        berth={berth}
      />
    </>
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
