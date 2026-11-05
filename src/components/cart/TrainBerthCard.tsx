import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Train, MapPin, Zap } from 'lucide-react-native';
import { JourneyDetails } from '../../types/journey';

interface TrainBerthCardProps {
  journey: JourneyDetails;
}

export const TrainBerthCard: React.FC<TrainBerthCardProps> = ({ journey }) => {
  return (
    <View style={styles.card}>
      {/* Top row: Train Name, PNR & Confirmed Badge */}
      <View style={styles.topRow}>
        <View style={styles.trainInfo}>
          <View style={styles.trainTitleRow}>
            <Train size={17} color="#ffe08f" />
            <Text style={styles.trainTitle} numberOfLines={1}>
              {journey.trainName.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.pnrText}>
            PNR: <Text style={styles.pnrHighlight}>{journey.pnr}</Text>
          </Text>
        </View>

        <View style={styles.confirmedBadge}>
          <Text style={styles.confirmedBadgeText}>
            {journey.statusText || 'CONFIRMED BERTH'}
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
            <MapPin size={13} color="#ffe08f" />
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
        <Zap size={16} color="#ffe08f" style={styles.boltIcon} />
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
    backgroundColor: '#006b2f',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#006b2f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,
    position: 'relative',
    overflow: 'hidden',
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
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  pnrText: {
    fontSize: 12,
    color: '#6cdd86',
    marginTop: 3,
  },
  pnrHighlight: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  confirmedBadge: {
    backgroundColor: '#95f4aa',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  confirmedBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#005226',
    letterSpacing: 0.2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(136, 250, 160, 0.25)',
    marginBottom: 10,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 10,
  },
  gridBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  gridLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#6cdd86',
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
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 1,
  },
  stationTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 3,
  },
  stationSubtitle: {
    fontSize: 11,
    color: '#ffe08f',
    fontWeight: '700',
    marginTop: 1,
  },
  haltBanner: {
    marginTop: 10,
    backgroundColor: 'rgba(0, 135, 62, 0.85)',
    borderRadius: 9,
    paddingVertical: 6,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  boltIcon: {
    flexShrink: 0,
  },
  haltBannerText: {
    fontSize: 11.5,
    color: '#FFFFFF',
    flex: 1,
    lineHeight: 16,
  },
  coachHighlight: {
    fontWeight: '800',
    color: '#ffe08f',
  },
});

export default TrainBerthCard;

