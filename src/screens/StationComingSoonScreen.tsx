import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Bell,
  MapPin,
  Sparkles,
  Zap,
  ArrowRight,
  RefreshCw,
} from 'lucide-react-native';
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
  const { width, height } = useWindowDimensions();
  const { setJourney } = useJourney();

  const stationName = record?.station || 'Your Station';

  const handleNotifyMe = () => {
    Alert.alert(
      'Notification Set! 🔔',
      `We will notify you via WhatsApp & SMS as soon as RailQuick 5-minute berth delivery launches at ${stationName}!`,
      [{ text: 'Great, Thanks!' }]
    );
  };

  const handleSwitchToNzm = () => {
    // Set NZM demo in journey context
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

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* FULL BACKGROUND RUNNER ILLUSTRATION (Exact reference photo) */}
      <Image
        source={require('../assets/images/coming_soon_runner.jpg')}
        style={styles.backgroundImage}
        contentFit="cover"
      />

      {/* Subtle Top Gradient for Status Bar / Back Button contrast */}
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.85)', 'rgba(255, 255, 255, 0.2)', 'transparent']}
        style={[styles.topGradient, { height: insets.top + 70 }]}
      />

      {/* TOP BAR: Back button + Station pill */}
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 12) }]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onNavigateBack}
          style={styles.backButton}
        >
          <ArrowLeft size={20} color="#0F172A" strokeWidth={2.4} />
        </TouchableOpacity>

        <View style={styles.stationBadge}>
          <MapPin size={13} color="#EA580C" strokeWidth={2.4} />
          <Text style={styles.stationBadgeText} numberOfLines={1}>
            {stationName}
          </Text>
        </View>
      </View>

      {/* BOTTOM ELEVATED INTERACTION CARD */}
      <View style={[styles.bottomCardWrapper, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.bottomCard}>
          {/* Active Station Notice Tag */}
          <View style={styles.liveNoticeRow}>
            <View style={styles.livePulseDot} />
            <Text style={styles.liveNoticeText}>
              Currently Live at <Text style={styles.liveNoticeBold}>Hazrat Nizamuddin (NZM)</Text>
            </Text>
          </View>

          <Text style={styles.bottomCardTitle}>
            We're Expanding Rapidly! 🚀
          </Text>

          <Text style={styles.bottomCardDesc}>
            5-minute berth delivery is currently active at Hazrat Nizamuddin (NZM).
            Our runner fleet will soon be live at {stationName}!
          </Text>

          {/* Primary Action: Switch to NZM & Order */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleSwitchToNzm}
            style={styles.switchNzmBtn}
          >
            <View style={styles.btnIconCircle}>
              <Zap size={14} color="#159447" fill="#159447" />
            </View>
            <Text style={styles.switchNzmBtnText}>
              Switch to NZM & Explore Store
            </Text>
            <ArrowRight size={17} color="#FFFFFF" strokeWidth={2.6} />
          </TouchableOpacity>

          {/* Secondary Action: Notify Me */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleNotifyMe}
            style={styles.notifyBtn}
          >
            <Bell size={16} color="#159447" strokeWidth={2.2} />
            <Text style={styles.notifyBtnText}>Notify Me When Live</Text>
          </TouchableOpacity>

          {/* Tertiary Action: Change PNR */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onNavigateBack}
            style={styles.changePnrBtn}
          >
            <RefreshCw size={13} color="#64748B" strokeWidth={2} />
            <Text style={styles.changePnrBtnText}>Change PNR Number</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF5EA',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    maxWidth: 220,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  stationBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },

  // Bottom Card
  bottomCardWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 14,
  },
  bottomCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: 24,
    padding: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  liveNoticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#E7F8EE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  livePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#159447',
  },
  liveNoticeText: {
    fontSize: 11,
    color: '#334155',
    fontWeight: '600',
  },
  liveNoticeBold: {
    fontWeight: '800',
    color: '#159447',
  },
  bottomCardTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 4,
  },
  bottomCardDesc: {
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 14,
  },

  // Buttons
  switchNzmBtn: {
    backgroundColor: '#159447',
    borderRadius: 14,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    shadowColor: '#159447',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 10,
  },
  btnIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchNzmBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  notifyBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    borderRadius: 14,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  notifyBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#159447',
  },
  changePnrBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  changePnrBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
});

export default StationComingSoonScreen;
