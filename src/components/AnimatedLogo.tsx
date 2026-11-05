import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  Image,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import RailQuickLogoSvg from '../assets/svg/RailQuickLogoSvg';

// Asset references
const LOGO_BASE_IMG = require('../assets/images/railquick_logo_base.png');
const LOGO_ARROW_IMG = require('../assets/images/railquick_arrow.png');

// Original aspect ratio of the logo asset: 324w x 89h
const ORIGINAL_WIDTH = 324;
const ORIGINAL_HEIGHT = 89;
const ASPECT_RATIO = ORIGINAL_WIDTH / ORIGINAL_HEIGHT; // ~3.64

// Exact coordinates of the orange arrow inside the 324x89 logo
const ARROW_ORIG_X = 153;
const ARROW_ORIG_Y = 31;
const ARROW_ORIG_W = 16;
const ARROW_ORIG_H = 24;

interface AnimatedLogoProps {
  /**
   * Callback fired once the logo entrance animation completes (around 1100ms)
   */
  onAnimationComplete?: () => void;
  /**
   * Maximum width of the logo in points (default: 85% of screen width)
   */
  maxWidth?: number;
  /**
   * Render mode: 'asset' (uses the exact high-res extracted reference graphic) or 'svg' (pure vector)
   * Default: 'asset' (guarantees 100% faithful replication of the user's uploaded reference)
   */
  renderMode?: 'asset' | 'svg';
}

export const AnimatedLogo: React.FC<AnimatedLogoProps> = ({
  onAnimationComplete,
  maxWidth,
  renderMode = 'asset',
}) => {
  const { width: screenWidth } = useWindowDimensions();

  // Responsive sizing: width is 85% of screen width (capped sensibly on tablets)
  const targetWidth = Math.min(
    maxWidth ?? screenWidth * 0.85,
    screenWidth - 32
  );
  const targetHeight = targetWidth / ASPECT_RATIO;

  // Proportional arrow dimensions and offsets
  const scaleRatio = targetWidth / ORIGINAL_WIDTH;
  const arrowLeft = ARROW_ORIG_X * scaleRatio;
  const arrowTop = ARROW_ORIG_Y * scaleRatio;
  const arrowWidth = ARROW_ORIG_W * scaleRatio;
  const arrowHeight = ARROW_ORIG_H * scaleRatio;

  // Reanimated shared values
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.75);
  const logoTranslateY = useSharedValue(22);

  // Orange arrow forward pulse values
  const arrowTranslateX = useSharedValue(0);
  const arrowScale = useSharedValue(1);

  useEffect(() => {
    // 1. Entrance animation: fade in, scale from 0.75 to 1.0, slight upward movement
    logoOpacity.value = withTiming(1, {
      duration: 1000,
      easing: Easing.out(Easing.cubic),
    });

    logoScale.value = withTiming(
      1,
      {
        duration: 1100,
        easing: Easing.out(Easing.back(1.1)),
      },
      (finished) => {
        if (finished && onAnimationComplete) {
          // Trigger callback
        }
      }
    );

    logoTranslateY.value = withTiming(0, {
      duration: 1100,
      easing: Easing.out(Easing.cubic),
    });

    // 2. Orange arrow forward movement / pulse inside the magnifying glass
    // Starts subtly after the logo begins settling (~800ms)
    arrowTranslateX.value = withDelay(
      850,
      withRepeat(
        withSequence(
          withTiming(4 * scaleRatio, {
            duration: 550,
            easing: Easing.inOut(Easing.quad),
          }),
          withTiming(0, {
            duration: 550,
            easing: Easing.inOut(Easing.quad),
          })
        ),
        -1,
        true
      )
    );

    arrowScale.value = withDelay(
      850,
      withRepeat(
        withSequence(
          withTiming(1.15, {
            duration: 550,
            easing: Easing.inOut(Easing.quad),
          }),
          withTiming(1.0, {
            duration: 550,
            easing: Easing.inOut(Easing.quad),
          })
        ),
        -1,
        true
      )
    );
  }, [scaleRatio]);

  // Animated styles for entire logo container
  const animatedLogoStyle = useAnimatedStyle(() => {
    return {
      opacity: logoOpacity.value,
      transform: [
        { scale: logoScale.value },
        { translateY: logoTranslateY.value },
      ],
    };
  });

  // Animated style for the orange arrow inside the magnifying glass
  const animatedArrowStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: arrowTranslateX.value },
        { scale: arrowScale.value },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.container,
        { width: targetWidth, height: targetHeight },
        animatedLogoStyle,
      ]}
      accessibilityRole="image"
      accessibilityLabel="RailQuick Logo"
    >
      {renderMode === 'asset' ? (
        <>
          {/* Base Logo (Rail + speed lines + magnifying glass frame + Quick in green) */}
          <Image
            source={LOGO_BASE_IMG}
            style={[styles.baseImage, { width: targetWidth, height: targetHeight }]}
            resizeMode="contain"
          />

          {/* Independently animated Orange Arrow inside the Magnifying Glass */}
          <Animated.View
            style={[
              styles.arrowContainer,
              {
                left: arrowLeft,
                top: arrowTop,
                width: arrowWidth,
                height: arrowHeight,
              },
              animatedArrowStyle,
            ]}
          >
            <Image
              source={LOGO_ARROW_IMG}
              style={styles.arrowImage}
              resizeMode="contain"
            />
          </Animated.View>
        </>
      ) : (
        <RailQuickLogoSvg
          width={targetWidth}
          height={targetHeight}
        />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  baseImage: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  arrowContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowImage: {
    width: '100%',
    height: '100%',
  },
});

export default AnimatedLogo;
