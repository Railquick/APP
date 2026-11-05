import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Platform, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface HeroHeadlineProps {
  delay?: number;
}

export const HeroHeadline: React.FC<HeroHeadlineProps> = ({ delay = 200 }) => {
  const { width } = useWindowDimensions();

  // Responsive font size: 34px on smaller phones up to 38px on larger displays
  const fontSize = Math.min(Math.max(width * 0.088, 32), 38);
  const lineHeight = fontSize * 1.18;

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(24);

  useEffect(() => {
    const timer = setTimeout(() => {
      opacity.value = withTiming(1, {
        duration: 900,
        easing: Easing.out(Easing.cubic),
      });
      translateY.value = withTiming(0, {
        duration: 900,
        easing: Easing.out(Easing.cubic),
      });
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    };
  });

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Text
        style={[
          styles.headlineText,
          {
            fontSize,
            lineHeight,
            fontFamily: Platform.select({
              ios: 'Georgia',
              android: 'serif',
              default: 'serif',
            }),
          },
        ]}
      >
        Essentials Delivered on{'\n'}Your Seat.
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 22,
    marginTop: 14,
    marginBottom: 8,
    zIndex: 5,
  },
  headlineText: {
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: -0.4,
    textAlign: 'left',
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
});

export default HeroHeadline;

