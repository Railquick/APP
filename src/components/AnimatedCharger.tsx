import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Image } from 'expo-image';

const CHARGER_IMG = require('../assets/products/anker_charger.png');

interface AnimatedChargerProps {
  width?: number;
  height?: number;
  tiltAngle?: number;
  isMoving?: boolean;
}

export const AnimatedCharger: React.FC<AnimatedChargerProps> = ({
  width = 52,
  height = 52,
  tiltAngle = -8,
  isMoving = true,
}) => {
  // Subtle vertical floating/gliding motion
  const bobbing = useSharedValue(0);

  useEffect(() => {
    if (isMoving) {
      bobbing.value = withRepeat(
        withSequence(
          withTiming(-1.8, { duration: 220, easing: Easing.inOut(Easing.quad) }),
          withTiming(1.8, { duration: 220, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        true
      );
    }
  }, [isMoving]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${tiltAngle}deg` },
        { translateY: bobbing.value },
      ],
    };
  });

  return (
    <Animated.View
      style={[styles.container, { width, height }, animatedStyle]}
      accessibilityRole="image"
      accessibilityLabel="Fast Charger Item"
    >
      <Image
        source={CHARGER_IMG}
        style={styles.image}
        contentFit="contain"
        priority="high"
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default AnimatedCharger;

