import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';

interface StepProgressHeaderProps {
  currentStep: 1 | 2 | 3;
}

export const StepProgressHeader: React.FC<StepProgressHeaderProps> = ({ currentStep }) => {
  // Screen 1: Seat & Cart (Step 1 active)
  if (currentStep === 1) {
    return (
      <View style={styles.container}>
        <View style={styles.stepRow}>
          {/* Step 1: Active */}
          <View style={styles.stepGroup}>
            <View style={[styles.circle, styles.circleActive]}>
              <Text style={styles.circleTextActive}>1</Text>
            </View>
            <Text style={[styles.label, styles.labelActive]} numberOfLines={1}>
              Seat & Cart
            </Text>
          </View>

          <View style={styles.line} />

          {/* Step 2: Inactive */}
          <View style={[styles.stepGroup, styles.opacityLow]}>
            <View style={[styles.circle, styles.circleInactive]}>
              <Text style={styles.circleTextInactive}>2</Text>
            </View>
            <Text style={styles.label} numberOfLines={1}>
              Payment
            </Text>
          </View>

          <View style={styles.line} />

          {/* Step 3: Inactive */}
          <View style={[styles.stepGroup, styles.opacityLow]}>
            <View style={[styles.circle, styles.circleInactive]}>
              <Text style={styles.circleTextInactive}>3</Text>
            </View>
            <Text style={styles.label} numberOfLines={1}>
              Live Track
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // Screen 2: Payment (Step 1 completed, Step 2 active)
  if (currentStep === 2) {
    return (
      <View style={styles.container}>
        <View style={styles.stepRow}>
          {/* Step 1: Completed */}
          <View style={styles.stepGroup}>
            <View style={[styles.circle, styles.circleActive]}>
              <Check size={13} color="#FFFFFF" strokeWidth={3} />
            </View>
            <Text style={[styles.label, styles.labelActive]} numberOfLines={1}>
              1 Cart
            </Text>
          </View>

          <View style={[styles.line, styles.lineActive]} />

          {/* Step 2: Active */}
          <View style={styles.stepGroup}>
            <View style={[styles.circle, styles.circleActive]}>
              <Text style={styles.circleTextActive}>2</Text>
            </View>
            <Text style={[styles.label, styles.labelActive]} numberOfLines={1}>
              2 Payment
            </Text>
          </View>

          <View style={styles.line} />

          {/* Step 3: Inactive */}
          <View style={[styles.stepGroup, styles.opacityLow]}>
            <View style={[styles.circle, styles.circleInactive]}>
              <Text style={styles.circleTextInactive}>3</Text>
            </View>
            <Text style={styles.label} numberOfLines={1}>
              3 Tracking
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // Screen 3: Live Tracking (Step 1 and 2 completed, Step 3 active)
  return (
    <View style={styles.container}>
      <View style={styles.stepRow}>
        {/* Step 1: Completed */}
        <View style={styles.stepGroup}>
          <View style={[styles.circle, styles.circleActive]}>
            <Check size={13} color="#FFFFFF" strokeWidth={3} />
          </View>
          <Text style={[styles.label, styles.labelCrossed]} numberOfLines={1}>
            1 Cart
          </Text>
        </View>

        <View style={[styles.line, styles.lineActive]} />

        {/* Step 2: Completed */}
        <View style={styles.stepGroup}>
          <View style={[styles.circle, styles.circleActive]}>
            <Check size={13} color="#FFFFFF" strokeWidth={3} />
          </View>
          <Text style={[styles.label, styles.labelCrossed]} numberOfLines={1}>
            2 Paid
          </Text>
        </View>

        <View style={[styles.line, styles.lineActive]} />

        {/* Step 3: Active Live Tracking */}
        <View style={styles.stepGroup}>
          <View style={[styles.circle, styles.circlePulse]}>
            <Text style={styles.circleTextActive}>3</Text>
          </View>
          <Text style={[styles.label, styles.labelActive]} numberOfLines={1}>
            3 Live Tracking
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
  },
  stepGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleActive: {
    backgroundColor: '#006b2f',
    shadowColor: '#006b2f',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 2,
  },
  circlePulse: {
    backgroundColor: '#006b2f',
    borderWidth: 2,
    borderColor: '#88faa0',
    shadowColor: '#006b2f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  circleInactive: {
    backgroundColor: '#deecdf',
  },
  circleTextActive: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  circleTextInactive: {
    color: '#3e4a3e',
    fontSize: 11,
    fontWeight: '700',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3e4a3e',
  },
  labelActive: {
    color: '#006b2f',
    fontWeight: '700',
  },
  labelCrossed: {
    color: '#6e7a6d',
    textDecorationLine: 'line-through',
  },
  line: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(110, 122, 109, 0.25)',
    marginHorizontal: 6,
    borderRadius: 1,
  },
  lineActive: {
    backgroundColor: '#006b2f',
  },
  opacityLow: {
    opacity: 0.6,
  },
});

export default StepProgressHeader;

