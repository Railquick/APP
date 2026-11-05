import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Check, PersonStanding, KeyRound } from 'lucide-react-native';
import { TrackingStep } from '../../types/order';

interface StationFulfillmentTimelineProps {
  steps: TrackingStep[];
  otp: string;
}

export const StationFulfillmentTimeline: React.FC<StationFulfillmentTimelineProps> = ({
  steps,
  otp,
}) => {
  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <PersonStanding size={20} color="#006b2f" />
          <Text style={styles.title}>Station Fulfillment</Text>
        </View>

        <View style={styles.sprintBadge}>
          <View style={styles.greenDot} />
          <Text style={styles.sprintText}>Sprint Active • On Schedule</Text>
        </View>
      </View>

      {/* Timeline List */}
      <View style={styles.timelineWrapper}>
        {/* Continuous vertical line */}
        <View style={styles.verticalLine} />

        {steps.map((step, idx) => {
          const isCompleted = step.status === 'completed';
          const isActive = step.status === 'active';
          const isUpcoming = step.status === 'upcoming';

          return (
            <View
              key={step.id}
              style={[
                styles.stepRow,
                isActive && styles.activeStepBox,
              ]}
            >
              {/* Step Node Icon */}
              <View
                style={[
                  styles.nodeCircle,
                  isCompleted && styles.nodeCompleted,
                  isActive && styles.nodeActive,
                  isUpcoming && styles.nodeUpcoming,
                ]}
              >
                {isCompleted && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                {isActive && (
                  <PersonStanding size={14} color="#503d00" strokeWidth={2.5} />
                )}
                {isUpcoming && <KeyRound size={11} color="#6e7a6d" />}
              </View>

              {/* Step Content */}
              <View style={styles.stepContent}>
                <View style={styles.stepTitleRow}>
                  <Text
                    style={[
                      styles.stepTitle,
                      isActive && styles.stepTitleActive,
                    ]}
                  >
                    {step.title}
                  </Text>

                  {step.time && <Text style={styles.stepTime}>{step.time}</Text>}

                  {step.badge && (
                    <View style={styles.timeAwayBadge}>
                      <Text style={styles.timeAwayText}>{step.badge}</Text>
                    </View>
                  )}

                  {isUpcoming && <Text style={styles.upcomingTag}>Upcoming</Text>}
                </View>

                <Text style={styles.stepSubtitle}>{step.subtitle}</Text>

                {/* Direct Receipt OTP if Handover step */}
                {step.otp && (
                  <View style={styles.otpBox}>
                    <Text style={styles.otpLabel}>DIRECT RECEIPT OTP:</Text>
                    <Text style={styles.otpDigits}>{step.otp || otp}</Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    flexWrap: 'wrap',
    gap: 6,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#121e16',
  },
  sprintBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#98f7ad',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 999,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#006b2f',
  },
  sprintText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#005226',
  },
  timelineWrapper: {
    position: 'relative',
    paddingLeft: 28,
    gap: 16,
  },
  verticalLine: {
    position: 'absolute',
    left: 11,
    top: 10,
    bottom: 24,
    width: 2,
    backgroundColor: '#deecdf',
  },
  stepRow: {
    position: 'relative',
  },
  activeStepBox: {
    backgroundColor: 'rgba(255, 224, 143, 0.28)',
    borderRadius: 10,
    padding: 8,
    marginLeft: -8,
    paddingLeft: 8,
  },
  nodeCircle: {
    position: 'absolute',
    left: -28,
    top: 2,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  nodeCompleted: {
    backgroundColor: '#006b2f',
  },
  nodeActive: {
    backgroundColor: '#cea730',
  },
  nodeUpcoming: {
    backgroundColor: '#deecdf',
  },
  stepContent: {
    flex: 1,
  },
  stepTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 4,
  },
  stepTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#121e16',
  },
  stepTitleActive: {
    color: '#755b00',
    fontWeight: '800',
  },
  stepTime: {
    fontSize: 11,
    color: '#3e4a3e',
    fontWeight: '500',
  },
  timeAwayBadge: {
    backgroundColor: '#755b00',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  timeAwayText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#ffffff',
  },
  upcomingTag: {
    fontSize: 11,
    color: '#6e7a6d',
    fontWeight: '500',
  },
  stepSubtitle: {
    fontSize: 11.5,
    color: '#3e4a3e',
    lineHeight: 16,
    marginTop: 2,
  },
  otpBox: {
    marginTop: 8,
    backgroundColor: '#deecdf',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  otpLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#3e4a3e',
    letterSpacing: 0.5,
  },
  otpDigits: {
    fontSize: 18,
    fontWeight: '900',
    color: '#006b2f',
    letterSpacing: 3,
  },
});

export default StationFulfillmentTimeline;

