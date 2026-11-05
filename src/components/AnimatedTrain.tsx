import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Path,
  Rect,
  Circle,
  G,
} from 'react-native-svg';

interface AnimatedTrainProps {
  /**
   * Width of the train in points (default: ~190)
   */
  width?: number;
  /**
   * Height of the train in points (default: ~55)
   */
  height?: number;
  /**
   * Optional tilt angle in degrees to match the reference illustration (e.g. -14)
   * Default is -12 to mirror the dynamic angle in the reference screenshot
   */
  tiltAngle?: number;
  /**
   * Enable subtle track vibration / glide motion
   */
  enableTrackMotion?: boolean;
}

export const AnimatedTrain: React.FC<AnimatedTrainProps> = ({
  width = 195,
  height = 54,
  tiltAngle = -12,
  enableTrackMotion = true,
}) => {
  // Subtle vertical track vibration to simulate gliding on rails
  const trackVibration = useSharedValue(0);

  useEffect(() => {
    if (enableTrackMotion) {
      trackVibration.value = withRepeat(
        withSequence(
          withTiming(-0.6, { duration: 160, easing: Easing.inOut(Easing.quad) }),
          withTiming(0.6, { duration: 160, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        true
      );
    }
  }, [enableTrackMotion]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${tiltAngle}deg` },
        { translateY: trackVibration.value },
      ],
    };
  });

  return (
    <Animated.View
      style={[styles.container, { width, height }, animatedStyle]}
      accessibilityRole="image"
      accessibilityLabel="Modern Blue and White Passenger Train"
    >
      <Svg viewBox="0 0 200 55" width="100%" height="100%">
        <Defs>
          {/* Aerodynamic White Train Body Gradient */}
          <LinearGradient id="trainFuselage" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#FFFFFF" />
            <Stop offset="65%" stopColor="#F8FAFC" />
            <Stop offset="100%" stopColor="#E2E8F0" />
          </LinearGradient>

          {/* Signature Royal Blue Passenger Stripe */}
          <LinearGradient id="trainBlueStripe" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#1E5BB8" />
            <Stop offset="100%" stopColor="#17478C" />
          </LinearGradient>

          {/* Cyan Tinted Window Glass */}
          <LinearGradient id="trainGlass" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#BAE6FD" />
            <Stop offset="100%" stopColor="#7DD3FC" />
          </LinearGradient>

          {/* Deep Navy Skirt */}
          <LinearGradient id="trainNavySkirt" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#0E3166" />
            <Stop offset="100%" stopColor="#081D3D" />
          </LinearGradient>
        </Defs>

        {/* ================= COACH 3 (REAR CAR) ================= */}
        <G id="coach3">
          {/* White Fuselage */}
          <Path
            d="M 2,16 L 38,16 C 39,16 40,17 40,18 L 40,44 L 2,44 C 1,44 0,43 0,42 L 0,18 C 0,17 1,16 2,16 Z"
            fill="url(#trainFuselage)"
          />
          {/* Blue Stripe */}
          <Rect x="0" y="22" width="40" height="12" fill="url(#trainBlueStripe)" />
          {/* Passenger Windows */}
          <Rect x="6" y="24" width="13" height="7.5" rx="1.5" fill="url(#trainGlass)" />
          <Rect x="23" y="24" width="13" height="7.5" rx="1.5" fill="url(#trainGlass)" />
          {/* Dark Navy Lower Skirt */}
          <Rect x="0" y="42" width="40" height="4" fill="url(#trainNavySkirt)" />
          <Rect x="0" y="46" width="40" height="3" fill="#1E293B" />
        </G>

        {/* Gangway Accordion Connector 1 */}
        <Rect x="40" y="19" width="4" height="25" rx="1" fill="#334155" />
        <Rect x="41" y="21" width="2" height="21" fill="#1E293B" />

        {/* ================= COACH 2 (MIDDLE CAR) ================= */}
        <G id="coach2" transform="translate(44, 0)">
          {/* White Fuselage */}
          <Rect x="0" y="16" width="56" height="28" rx="2" fill="url(#trainFuselage)" />
          {/* Blue Stripe */}
          <Rect x="0" y="22" width="56" height="12" fill="url(#trainBlueStripe)" />
          {/* Passenger Windows */}
          <Rect x="6" y="24" width="19" height="7.5" rx="1.5" fill="url(#trainGlass)" />
          <Rect x="31" y="24" width="19" height="7.5" rx="1.5" fill="url(#trainGlass)" />
          {/* Dark Navy Lower Skirt */}
          <Rect x="0" y="42" width="56" height="4" fill="url(#trainNavySkirt)" />
          <Rect x="0" y="46" width="56" height="3" fill="#1E293B" />
        </G>

        {/* Gangway Accordion Connector 2 */}
        <Rect x="100" y="19" width="4" height="25" rx="1" fill="#334155" />
        <Rect x="101" y="21" width="2" height="21" fill="#1E293B" />

        {/* ================= COACH 1 (FRONT CAB / LOCOMOTIVE) ================= */}
        <G id="coach1" transform="translate(104, 0)">
          {/* Aerodynamic Streamlined Nose Fuselage */}
          <Path
            d="M 0,16 L 54,16 C 68,16 82,23 92,34 L 92,44 L 0,44 Z"
            fill="url(#trainFuselage)"
          />

          {/* Blue Stripe continuing into the aerodynamic nose curve */}
          <Path
            d="M 0,22 L 53,22 C 63,22 74,27 82,34 L 85,38 L 0,38 Z"
            fill="url(#trainBlueStripe)"
          />

          {/* Front Slanted Windshield Frame & Glass */}
          <Path
            d="M 57,23 C 65,24 72,28 77,33 L 56,33 Z"
            fill="#1E293B"
          />
          <Path
            d="M 59,25 C 65,26 70,29 74,32 L 58,32 Z"
            fill="url(#trainGlass)"
          />

          {/* Passenger Windows */}
          <Rect x="8" y="24" width="18" height="7.5" rx="1.5" fill="url(#trainGlass)" />
          <Rect x="32" y="24" width="18" height="7.5" rx="1.5" fill="url(#trainGlass)" />

          {/* Signature Orange Accent Stripe on the Aerodynamic Nose */}
          <Path
            d="M 74,37 L 88,37 C 86,39.5 83,41 80,41 L 70,41 Z"
            fill="#F97316"
          />

          {/* Dark Navy Lower Skirt */}
          <Path
            d="M 0,42 L 87,42 C 89,43 90,44 91,44 L 0,44 Z"
            fill="url(#trainNavySkirt)"
          />
          <Rect x="0" y="44" width="85" height="3" fill="#1E293B" />

          {/* Front LED Headlight */}
          <Circle cx="88.5" cy="38" r="1.8" fill="#FEF08A" />
          <Circle cx="88.5" cy="38" r="0.9" fill="#FFFFFF" />
        </G>
      </Svg>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AnimatedTrain;

