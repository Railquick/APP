import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { MapPin, Zap } from 'lucide-react-native';

interface RunnerLiveStatusCardProps {
  coach: string;
  station: string;
}

export const RunnerLiveStatusCard: React.FC<RunnerLiveStatusCardProps> = ({
  coach,
  station,
}) => {
  // Soft pulsing opacity for the live dot
  const pulse = useRef(new Animated.Value(1)).current;
  // Progress bar fill from ~65% (runner at platform, waiting)
  const progressAnim = useRef(new Animated.Value(0.65)).current;

  useEffect(() => {
    // Pulse the live dot
    const pulsing = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.3,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    pulsing.start();

    // Slowly creep the progress bar toward 75% to show "almost there"
    Animated.timing(progressAnim, {
      toValue: 0.75,
      duration: 4000,
      useNativeDriver: false,
    }).start();

    return () => pulsing.stop();
  }, []);

  const stationShort = station.replace(/\s*\([^)]*\)\s*$/, '');

  return (
    <View style={styles.card}>
      {/* Header row */}
      <View style={styles.headerRow}>
        <Animated.View style={[styles.liveDot, { opacity: pulse }]} />
        <Text style={styles.headerLabel}>RUNNER LIVE STATUS</Text>
        <View style={styles.onTimeBadge}>
          <Zap size={10} color="#065f46" fill="#065f46" />
          <Text style={styles.onTimeText}>On Schedule</Text>
        </View>
      </View>

      {/* Progress track */}
      <View style={styles.progressSection}>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
          {/* Runner marker dot on the track */}
          <Animated.View
            style={[
              styles.runnerMarker,
              {
                left: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '96%'],
                }),
              },
            ]}
          >
            <View style={styles.runnerMarkerInner} />
          </Animated.View>
        </View>

        {/* Track labels */}
        <View style={styles.trackLabels}>
          <View style={styles.trackLabelStart}>
            <MapPin size={11} color="#6B7280" />
            <Text style={styles.trackLabelText}>Station</Text>
          </View>
          <Text style={styles.trackLabelText}>Platform</Text>
          <View style={styles.trackLabelEnd}>
            <Text style={styles.trackLabelText}>Coach {coach}</Text>
          </View>
        </View>
      </View>

      {/* Status steps */}
      <View style={styles.stepsCol}>
        {/* Step 1 — Active */}
        <View style={styles.stepRow}>
          <View style={[styles.stepNode, styles.stepNodeActive]}>
            <View style={styles.stepNodeDot} />
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>
              Runner at platform —{' '}
              <Text style={styles.stepTitleAccent}>outside Coach {coach}</Text>
            </Text>
            <Text style={styles.stepSub}>
              Standing by at the coach door. Will board the moment the train
              halts at {stationShort}.
            </Text>
          </View>
        </View>

        <View style={styles.stepConnector} />

        {/* Step 2 — Upcoming */}
        <View style={styles.stepRow}>
          <View style={[styles.stepNode, styles.stepNodeUpcoming]} />
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, styles.stepTitleUpcoming]}>
              Sprinting to Berth {coach}
            </Text>
            <Text style={styles.stepSub}>
              Runner boards and delivers directly to your seat within the halt
              window.
            </Text>
          </View>
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
    gap: 14,
    borderWidth: 1.5,
    borderColor: '#d1fae5',
    shadowColor: '#006b2f',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16a34a',
  },
  headerLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#065f46',
    letterSpacing: 0.6,
    flex: 1,
  },
  onTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#d1fae5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  onTimeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#065f46',
  },
  progressSection: {
    gap: 6,
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#16a34a',
    borderRadius: 3,
  },
  runnerMarker: {
    position: 'absolute',
    top: -4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
    marginLeft: -7,
  },
  runnerMarkerInner: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#16a34a',
  },
  trackLabels: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trackLabelStart: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  trackLabelEnd: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  trackLabelText: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
  },
  stepsCol: {
    gap: 0,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  stepNode: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginTop: 2,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNodeActive: {
    backgroundColor: '#16a34a',
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 3,
  },
  stepNodeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  stepNodeUpcoming: {
    backgroundColor: '#E5E7EB',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
  },
  stepConnector: {
    width: 1.5,
    height: 10,
    backgroundColor: '#E5E7EB',
    marginLeft: 7,
  },
  stepContent: {
    flex: 1,
    paddingBottom: 4,
  },
  stepTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 17,
  },
  stepTitleAccent: {
    color: '#16a34a',
    fontWeight: '800',
  },
  stepTitleUpcoming: {
    color: '#6B7280',
    fontWeight: '600',
  },
  stepSub: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 15,
    marginTop: 2,
  },
});

export default RunnerLiveStatusCard;
