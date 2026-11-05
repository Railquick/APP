import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface TermsFooterProps {
  delay?: number;
}

export const TermsFooter: React.FC<TermsFooterProps> = ({ delay = 1450 }) => {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) })
    );
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const handleTermsPress = () => {
    Alert.alert(
      'Terms of Service',
      'RailQuick Terms of Service:\n\n1. Real-time seat delivery is coordinated via train PNR and station schedules.\n2. Items are verified by IRCTC Station Express partners.\n3. Safe contactless delivery at your designated coach and berth.',
      [{ text: 'Close' }]
    );
  };

  const handlePrivacyPress = () => {
    Alert.alert(
      'Privacy Policy',
      'RailQuick Privacy Commitment:\n\nWe prioritize passenger privacy and never sell or share your journey itinerary or personal contact details with third-party advertisers.',
      [{ text: 'Close' }]
    );
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Text style={styles.baseText}>
        By continuing, you agree to our{' '}
        <Text style={styles.linkText} onPress={handleTermsPress}>
          Terms
        </Text>
        {' & '}
        <Text style={styles.linkText} onPress={handlePrivacyPress}>
          Privacy Policy
        </Text>
        .
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  baseText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  linkText: {
    color: '#087C45',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});

export default TermsFooter;

