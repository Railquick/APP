import React, { useEffect } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import AnimatedTrain from './AnimatedTrain';
import AnimatedCharger from './AnimatedCharger';
import AnimatedLays from './AnimatedLays';

interface TransportationConvoyProps {
  /**
   * Delay in ms before items start entering the screen (default: 500ms)
   */
  startDelay?: number;
  /**
   * Duration in ms for the convoy to travel across the screen (default: 6800ms)
   */
  travelDuration?: number;
  /**
   * Pause interval in ms before re-entering from the left edge (default: 600ms)
   */
  loopInterval?: number;
  /**
   * Vertical position of the track (e.g., around 60-65% of screen height)
   */
  trackTop?: number;
  /**
   * Tilt angle in degrees for the train illustration (default: -12)
   */
  trainTilt?: number;
}

export const TransportationConvoy: React.FC<TransportationConvoyProps> = ({
  startDelay = 500,
  travelDuration = 6800,
  loopInterval = 600,
  trackTop,
  trainTilt = -12,
}) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // Responsive dimensions for Train, Charger, and Lay's
  const trainWidth = Math.min(screenWidth * 0.48, 205);
  const trainHeight = trainWidth * (55 / 200);

  const chargerWidth = Math.min(screenWidth * 0.14, 52);
  const chargerHeight = chargerWidth;

  const laysWidth = Math.min(screenWidth * 0.12, 44);
  const laysHeight = laysWidth * (58 / 44);

  // Spacing between moving items
  const gapTrainCharger = Math.min(screenWidth * 0.10, 40);
  const gapChargerLays = Math.min(screenWidth * 0.08, 34);

  // Total convoy span from train front to Lay's tail
  const convoySpan = trainWidth + gapTrainCharger + chargerWidth + gapChargerLays + laysWidth;

  // Total travel distance: from off-screen left to completely past off-screen right
  const totalDistance = screenWidth + convoySpan + 50;

  // Single shared convoy progress driving UI-thread smooth movement
  const convoyProgress = useSharedValue(0);

  useEffect(() => {
    // 1. Logo appears first.
    // 2. After ~500ms, the train enters from the left edge, followed by Charger and Lay's.
    // 3. Items travel across the screen and loop seamlessly.
    convoyProgress.value = withDelay(
      startDelay,
      withRepeat(
        withSequence(
          withTiming(totalDistance, {
            duration: travelDuration,
            easing: Easing.linear,
          }),
          withDelay(
            loopInterval,
            withTiming(0, {
              duration: 0,
            })
          )
        ),
        -1,
        false
      )
    );
  }, [totalDistance, startDelay, travelDuration, loopInterval]);

  // Position formulas ensuring train leads, charger follows, and lays follows:
  // Train front is at: convoyProgress
  // Train left edge: convoyProgress - trainWidth
  const trainAnimatedStyle = useAnimatedStyle(() => {
    const x = convoyProgress.value - trainWidth;
    return {
      transform: [{ translateX: x }],
    };
  });

  // Charger is positioned behind train with gapTrainCharger
  const chargerAnimatedStyle = useAnimatedStyle(() => {
    const x = convoyProgress.value - trainWidth - gapTrainCharger - chargerWidth;
    return {
      transform: [{ translateX: x }],
    };
  });

  // Lay's is positioned behind charger with gapChargerLays
  const laysAnimatedStyle = useAnimatedStyle(() => {
    const x = convoyProgress.value - convoySpan;
    return {
      transform: [{ translateX: x }],
    };
  });

  // Default track vertical position: 61% of screen height
  const containerTop = trackTop ?? screenHeight * 0.61;

  return (
    <View
      style={[
        styles.trackContainer,
        {
          top: containerTop,
          height: Math.max(trainHeight, chargerHeight, laysHeight) + 20,
        },
      ]}
      pointerEvents="none"
    >
      {/* 1. TRAIN (Leading vehicle, largest element - remains identical) */}
      <Animated.View
        style={[
          styles.itemWrapper,
          {
            width: trainWidth,
            height: trainHeight,
            zIndex: 3,
          },
          trainAnimatedStyle,
        ]}
      >
        <AnimatedTrain
          width={trainWidth}
          height={trainHeight}
          tiltAngle={trainTilt}
        />
      </Animated.View>

      {/* 2. CHARGER (Follows train) */}
      <Animated.View
        style={[
          styles.itemWrapper,
          {
            width: chargerWidth,
            height: chargerHeight,
            top: 2,
            zIndex: 2,
          },
          chargerAnimatedStyle,
        ]}
      >
        <AnimatedCharger
          width={chargerWidth}
          height={chargerHeight}
          tiltAngle={-8}
          isMoving={true}
        />
      </Animated.View>

      {/* 3. LAY'S CHIPS (Follows charger) */}
      <Animated.View
        style={[
          styles.itemWrapper,
          {
            width: laysWidth,
            height: laysHeight,
            top: -2,
            zIndex: 1,
          },
          laysAnimatedStyle,
        ]}
      >
        <AnimatedLays
          width={laysWidth}
          height={laysHeight}
          tiltAngle={-10}
          isMoving={true}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  trackContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    justifyContent: 'center',
    overflow: 'visible',
  },
  itemWrapper: {
    position: 'absolute',
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default TransportationConvoy;
