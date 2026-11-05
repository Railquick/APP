import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Platform, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import FeatureCard from './FeatureCard';
import GoogleSignInButton from './GoogleSignInButton';
import TrustBanner from './TrustBanner';
import TermsFooter from './TermsFooter';

interface WelcomePanelProps {
  delay?: number;
  onSignInSuccess?: () => void;
}

export const WelcomePanel: React.FC<WelcomePanelProps> = ({
  delay = 700,
  onSignInSuccess,
}) => {
  const { height, width } = useWindowDimensions();

  // Slide up entrance animation
  const translateY = useSharedValue(70);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withTiming(0, {
        duration: 850,
        easing: Easing.out(Easing.cubic),
      })
    );
    opacity.value = withDelay(
      delay,
      withTiming(1, {
        duration: 800,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    };
  });

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {/* Grey Drag Handle at Top Center */}
      <View style={styles.handleContainer}>
        <View style={styles.dragHandle} />
      </View>

      {/* Main Welcome Heading */}
      <View style={styles.headerSection}>
        <Text
          style={[
            styles.titleText,
            {
              fontFamily: Platform.select({
                ios: 'Georgia',
                android: 'serif',
                default: 'serif',
              }),
            },
          ]}
        >
          Welcome aboard!
        </Text>
        <Text style={styles.subtitleText}>
          Sign in to make your journey easier.
        </Text>
      </View>

      {/* Feature Highlights (3 Cards) */}
      <View style={styles.featuresRow}>
        <FeatureCard iconType="seat" label="Seat Delivery" delayIndex={0} />
        <FeatureCard iconType="stopwatch" label="Next Halt ETA" delayIndex={1} />
        <FeatureCard iconType="shield" label="IRCTC Verified" delayIndex={2} />
      </View>

      {/* Google Sign-in Button */}
      <GoogleSignInButton delay={1150} onSignInSuccess={onSignInSuccess} />

      {/* Trust & Safety Banner */}
      <TrustBanner delay={1350} />

      {/* Terms & Privacy Policy Footer */}
      <TermsFooter delay={1400} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 10,
    paddingHorizontal: 6,
    width: '100%',
    flex: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
    zIndex: 20,
  },
  handleContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 6,
  },
  dragHandle: {
    width: 44,
    height: 4.5,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
  },
  headerSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
  },
  titleText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subtitleText: {
    fontSize: 14.5,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 6,
  },
});

export default WelcomePanel;

