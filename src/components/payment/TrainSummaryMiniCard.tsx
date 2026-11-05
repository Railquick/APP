import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Train, Timer } from 'lucide-react-native';
import { JourneyDetails } from '../../types/journey';

interface TrainSummaryMiniCardProps {
  journey: JourneyDetails;
  totalCount: number;
  totalPayable: number;
}

export const TrainSummaryMiniCard: React.FC<TrainSummaryMiniCardProps> = ({
  journey,
  totalCount,
  totalPayable,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.contentRow}>
        {/* Left: Train Icon & Journey info */}
        <View style={styles.leftGroup}>
          <View style={styles.trainIconBox}>
            <Train size={22} color="#005226" />
          </View>

          <View style={styles.infoCol}>
            <View style={styles.titleRow}>
              <Text style={styles.trainTitle} numberOfLines={1}>
                #{journey.trainNumber} {journey.trainName.replace(/^.*•\s*/, '')}
              </Text>
              <View style={styles.berthBadge}>
                <Text style={styles.berthBadgeText}>
                  {journey.coach} • Berth {journey.berth}
                </Text>
              </View>
            </View>

            <Text style={styles.stationText} numberOfLines={1}>
              Next:{' '}
              <Text style={styles.stationBold}>{journey.station}</Text>
            </Text>
          </View>
        </View>

        {/* Right: Halt Timer & Items summary */}
        <View style={styles.rightGroup}>
          <View style={styles.haltBadge}>
            <Timer size={12} color="#241a00" />
            <Text style={styles.haltText}>{journey.haltDurationMins}m halt</Text>
          </View>

          <Text style={styles.itemsSummary}>
            {totalCount} Items • ₹{totalPayable}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  trainIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#95f4aa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCol: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  trainTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#121e16',
  },
  berthBadge: {
    backgroundColor: '#00873e',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
  },
  berthBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#f7fff3',
  },
  stationText: {
    fontSize: 11.5,
    color: '#3e4a3e',
    marginTop: 2,
  },
  stationBold: {
    fontWeight: '700',
    color: '#121e16',
  },
  rightGroup: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  haltBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ffe08f',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  haltText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#241a00',
  },
  itemsSummary: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3e4a3e',
    marginTop: 4,
  },
});

export default TrainSummaryMiniCard;

