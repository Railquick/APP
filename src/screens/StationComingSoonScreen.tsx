import React, { useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronDown, Navigation } from 'lucide-react-native';
import { PnrDemoRecord, DEMO_PNR_RECORDS } from '../data/pnrDemoData';
import { useJourney } from '../context/JourneyContext';

interface StationComingSoonScreenProps {
  record?: PnrDemoRecord;
  onNavigateBack: () => void;
  onSwitchToNzm: () => void;
}

export const StationComingSoonScreen: React.FC<StationComingSoonScreenProps> = ({
  record,
  onNavigateBack,
  onSwitchToNzm,
}) => {
  const insets = useSafeAreaInsets();
  const { setJourney } = useJourney();
  const [requestSent, setRequestSent] = useState(false);
  const stationName = record?.station || 'Your Station';
  const stationDisplayName = stationName.replace(/\s*\([^)]*\)\s*$/, '');
  const stationCode = record?.stationCode || '';

  useEffect(() => {
    if (!requestSent) return;

    const timer = setTimeout(() => setRequestSent(false), 3000);
    return () => clearTimeout(timer);
  }, [requestSent]);

  const handleRequestArea = () => {
    setRequestSent(true);
  };

  const handleStationDetails = () => {
    Alert.alert(
      stationDisplayName,
      stationCode ? `Station code: ${stationCode}` : 'Station details'
    );
  };

  const handleHelp = () => {
    Alert.alert(
      'Need help?',
      'You can try another PNR or explore delivery at our live station.',
      [
        { text: 'Change PNR', onPress: onNavigateBack },
        { text: 'Explore live station', onPress: handleSwitchToNzm },
        { text: 'Close', style: 'cancel' },
      ]
    );
  };

  const handleSwitchToNzm = () => {
    const nzmRecord = DEMO_PNR_RECORDS[0];
    setJourney({
      pnr: nzmRecord.pnr,
      trainNumber: nzmRecord.trainNumber,
      trainName: nzmRecord.trainName,
      station: nzmRecord.station,
      stationCode: nzmRecord.stationCode,
      platform: nzmRecord.platform,
      coach: nzmRecord.coach,
      berth: nzmRecord.berth,
      berthType: nzmRecord.berthType,
      passengerName: nzmRecord.passengerName,
      passengerPhone: '9876543210',
      deliveryMinutes: nzmRecord.deliveryMinutes,
      haltMinutes: nzmRecord.haltMinutes,
      scheduledArrivalMins: nzmRecord.scheduledArrivalMins,
      haltDurationMins: nzmRecord.haltDurationMins,
      statusText: nzmRecord.statusText,
    });
    onSwitchToNzm();
  };

  const handleInstagramPress = async () => {
    try {
      await Linking.openURL('https://www.instagram.com/');
    } catch {
      Alert.alert('Unable to open Instagram', 'Please try again later.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <Image
        source={require('../assets/images/coming_soon_runner.jpg')}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        accessible
        accessibilityLabel={`Coming soon to ${stationName}`}
      />

      <View style={[styles.stationPanel, { top: insets.top + 10 }]}>
        <Text style={styles.headingText}>Unserviceable area</Text>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`Station details for ${stationDisplayName}`}
          activeOpacity={0.7}
          onPress={handleStationDetails}
          style={styles.stationDetailsRow}
        >
          <Navigation
            size={14}
            color="#4B5563"
            strokeWidth={2.5}
            style={styles.locationArrow}
          />
          <Text
            style={styles.stationName}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {stationCode
              ? `${stationDisplayName} (${stationCode})`
              : stationDisplayName}
          </Text>
          <ChevronDown size={16} color="#4B5563" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.footer,
          { bottom: Math.max(insets.bottom, 12) + 18 },
        ]}
      >
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Request RailQuick in your area"
          activeOpacity={0.85}
          onPress={handleRequestArea}
          style={styles.requestButton}
        >
          <Text style={styles.requestButtonText}>
            Request RailQuick in your area
          </Text>
        </TouchableOpacity>

        <View style={styles.footerLinks}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Need help?"
            activeOpacity={0.7}
            onPress={handleHelp}
            hitSlop={8}
          >
            <Text style={styles.linkText}>Need help?</Text>
          </TouchableOpacity>
          <Text style={styles.separator}>•</Text>
          <TouchableOpacity
            accessibilityRole="link"
            accessibilityLabel="Get updates on Instagram"
            activeOpacity={0.7}
            onPress={handleInstagramPress}
            hitSlop={8}
          >
            <Text style={styles.linkText}>Get updates on Instagram</Text>
          </TouchableOpacity>
        </View>
      </View>

      {requestSent && (
        <View
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          style={[
            styles.successToast,
            { bottom: Math.max(insets.bottom, 12) + 94 },
          ]}
        >
          <Text style={styles.successToastText}>
            ✓ Thanks for your interest at {stationName}!
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#FAF5EA',
  },
  stationPanel: {
    position: 'absolute',
    left: 16,
    right: 16,
  },
  headingText: {
    color: '#111827',
    fontSize: 23,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  stationDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  stationName: {
    flex: 1,
    color: '#4B5563',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0,
  },
  locationArrow: {
    transform: [{ rotate: '45deg' }],
  },
  footer: {
    position: 'absolute',
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  requestButton: {
    width: '100%',
    minHeight: 54,
    paddingHorizontal: 16,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#159F5A',
  },
  requestButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 12,
  },
  linkText: {
    color: '#1F2937',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  separator: {
    color: '#1F2937',
    fontSize: 13,
  },
  successToast: {
    position: 'absolute',
    left: 20,
    right: 20,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#087C45',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  successToastText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default StationComingSoonScreen;
