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

const LAYS_IMG = require('../assets/products/lays_chips.png');

interface AnimatedLaysProps {
  width?: number;
  height?: number;
  tiltAngle?: number;
  isMoving?: boolean;
}

export const AnimatedLays: React.FC<AnimatedLaysProps> = ({
  width = 44,
  height = 58,
  tiltAngle = -10,
  isMoving = true,
}) => {
  // Subtle vertical floating/gliding motion
  const bobbing = useSharedValue(0);

  useEffect(() => {
    if (isMoving) {
      bobbing.value = withRepeat(
        withSequence(
          withTiming(1.6, { duration: 240, easing: Easing.inOut(Easing.quad) }),
          withTiming(-1.6, { duration: 240, easing: Easing.inOut(Easing.quad) })
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
      accessibilityLabel="Lays Potato Chips Item"
    >
      <Image
        source={LAYS_IMG}
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

export default AnimatedLays;

