import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Train, Navigation } from 'lucide-react-native';
import { JourneyDetails } from '../../types/journey';

interface TrainHaltHeroCardProps {
  journey: JourneyDetails;
}

export const TrainHaltHeroCard: React.FC<TrainHaltHeroCardProps> = ({ journey }) => {
  return (
    <View style={styles.card}>
      {/* Train & Berth Header */}
      <View style={styles.topSection}>
        <View style={styles.trainGroup}>
          <View style={styles.trainIconBox}>
            <Train size={20} color="#006b2f" />
          </View>

          <View style={styles.trainTexts}>
            <Text style={styles.trainName} numberOfLines={1}>
              {journey.trainNumber} • {journey.trainName.replace(/^.*•\s*/, '')}
            </Text>
            <Text style={styles.pnrText}>PNR: {journey.pnr}</Text>
          </View>
        </View>

        <View style={styles.berthBadgeCol}>
          <View style={styles.berthBadge}>
            <Text style={styles.berthBadgeText}>
              Coach {journey.coach} • {journey.berth}
            </Text>
          </View>
          <Text style={styles.berthTypeText}>Window Berth</Text>
        </View>
      </View>

      {/* Station Halt Live Indicator */}
      <View style={styles.haltSection}>
        <View style={styles.haltLeft}>
          <Navigation size={20} color="#006b2f" style={styles.navIcon} />
          <View style={styles.haltTexts}>
            <View style={styles.stationTitleRow}>
              <Text style={styles.stationName}>{journey.station}</Text>
              <View style={styles.platformBadge}>
                <Text style={styles.platformText}>{journey.platform}</Text>
              </View>
            </View>

            <Text style={styles.arrivalText}>
              Train arrives in{' '}
              <Text style={styles.boldGreen}>{journey.scheduledArrivalMins} mins</Text>
              {' • '}Halt duration:{' '}
              <Text style={styles.boldDark}>{journey.haltDurationMins} mins</Text>
            </Text>
          </View>
        </View>

        <View style={styles.onTimeBadge}>
          <Text style={styles.onTimeText}>ON TIME</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#deecdf',
  },
  trainGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  trainIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#deecdf',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trainTexts: {
    flex: 1,
    minWidth: 0,
  },
  trainName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#121e16',
  },
  pnrText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3e4a3e',
    marginTop: 2,
  },
  berthBadgeCol: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  berthBadge: {
    backgroundColor: '#95f4aa',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  berthBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#005226',
  },
  berthTypeText: {
    fontSize: 10,
    color: '#3e4a3e',
    marginTop: 2,
  },
  haltSection: {
    backgroundColor: '#e3f2e5',
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  haltLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  navIcon: {
    marginTop: 2,
  },
  haltTexts: {
    flex: 1,
    minWidth: 0,
  },
  stationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stationName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#121e16',
  },
  platformBadge: {
    backgroundColor: '#d8e6d9',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  platformText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#3e4a3e',
  },
  arrivalText: {
    fontSize: 11.5,
    color: '#3e4a3e',
    marginTop: 2,
  },
  boldGreen: {
    fontWeight: '800',
    color: '#006b2f',
  },
  boldDark: {
    fontWeight: '700',
    color: '#121e16',
  },
  onTimeBadge: {
    backgroundColor: '#ffe08f',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
  },
  onTimeText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#241a00',
    letterSpacing: 0.5,
  },
});

export default TrainHaltHeroCard;

