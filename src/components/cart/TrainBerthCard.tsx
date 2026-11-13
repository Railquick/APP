import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Train, MapPin, Zap } from 'lucide-react-native';
import { JourneyDetails } from '../../types/journey';

interface TrainBerthCardProps {
  journey: JourneyDetails;
}

export const TrainBerthCard: React.FC<TrainBerthCardProps> = ({ journey }) => {
  return (
    <View style={styles.card}>
      {/* Background image */}
      <Image
        source={require('../../assets/cards/Cart.png')}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        accessibilityIgnoresInvertColors
      />
      {/* Stronger dark overlay so text is always readable */}
      <View style={styles.overlay} />

      {/* Top row: Train Name & PNR — no badge */}
      <View style={styles.topRow}>
        <View style={styles.trainInfo}>
          <View style={styles.trainTitleRow}>
            <Train size={17} color="#FFD580" />
            <Text style={styles.trainTitle} numberOfLines={1}>
              {journey.trainName.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.pnrText}>
            PNR: <Text style={styles.pnrHighlight}>{journey.pnr}</Text>
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Berth Grid: Assigned Seat & Next Station */}
      <View style={styles.gridRow}>
        {/* Left: Assigned Seat */}
        <View style={styles.gridBox}>
          <Text style={styles.gridLabel}>ASSIGNED SEAT</Text>
          <Text style={styles.seatTitle} numberOfLines={1}>
            Coach {journey.coach} • Berth {journey.berth}
          </Text>
          <Text style={styles.seatSubtitle} numberOfLines={1}>
            {journey.berthType}
          </Text>
        </View>

        {/* Right: Next Station */}
        <View style={styles.gridBox}>
          <View style={styles.stationLabelRow}>
            <MapPin size={13} color="#FFD580" />
            <Text style={styles.gridLabel}>NEXT STATION</Text>
          </View>
          <Text style={styles.stationTitle} numberOfLines={1}>
            {journey.station}
          </Text>
          <Text style={styles.stationSubtitle} numberOfLines={1}>
            {journey.platform} • In {journey.scheduledArrivalMins} mins
          </Text>
        </View>
      </View>

      {/* Live Halt Micro-Banner */}
      <View style={styles.haltBanner}>
        <Zap size={16} color="#FFD580" style={styles.boltIcon} />
        <Text style={styles.haltBannerText}>
          Darkstore runner enters{' '}
          <Text style={styles.coachHighlight}>Coach {journey.coach}</Text> right as
          train halts!
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 5,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 160,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 20, 10, 0.72)',
    borderRadius: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
  trainInfo: {
    flex: 1,
    paddingRight: 8,
  },
  trainTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trainTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  pnrText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
  },
  pnrHighlight: {
    fontWeight: '700',
    color: '#FFD580',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginBottom: 10,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 10,
  },
  gridBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  gridLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#FFD580',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  stationLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seatTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 3,
  },
  seatSubtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  stationTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 3,
  },
  stationSubtitle: {
    fontSize: 11,
    color: '#FFD580',
    fontWeight: '700',
    marginTop: 2,
  },
  haltBanner: {
    marginTop: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 9,
    paddingVertical: 7,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,213,128,0.3)',
  },
  boltIcon: {
    flexShrink: 0,
  },
  haltBannerText: {
    fontSize: 11.5,
    color: 'rgba(255,255,255,0.9)',
    flex: 1,
    lineHeight: 16,
  },
  coachHighlight: {
    fontWeight: '800',
    color: '#FFD580',
  },
});

export default TrainBerthCard;

