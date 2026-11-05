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
  Ellipse,
  Line,
} from 'react-native-svg';

interface AnimatedBusProps {
  /**
   * Width of the bus in points (default: ~70)
   */
  width?: number;
  /**
   * Height of the bus in points (default: ~52)
   */
  height?: number;
  /**
   * Tilt angle in degrees (default: -12 to match reference perspective)
   */
  tiltAngle?: number;
  /**
   * Whether to animate wheel rotation (default: true)
   */
  isMoving?: boolean;
}

export const AnimatedBus: React.FC<AnimatedBusProps> = ({
  width = 70,
  height = 52,
  tiltAngle = -12,
  isMoving = true,
}) => {
  // Wheel rotation angle in degrees (0 -> 360)
  const wheelRotation = useSharedValue(0);

  // Subtle road/suspension vibration
  const suspensionBob = useSharedValue(0);

  useEffect(() => {
    if (isMoving) {
      // Continuous 360-degree wheel rotation
      wheelRotation.value = withRepeat(
        withTiming(360, {
          duration: 480,
          easing: Easing.linear,
        }),
        -1,
        false
      );

      // Subtle suspension oscillation
      suspensionBob.value = withRepeat(
        withSequence(
          withTiming(-0.6, { duration: 160, easing: Easing.inOut(Easing.quad) }),
          withTiming(0.6, { duration: 160, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        true
      );
    }
  }, [isMoving]);

  // Style for the bus body
  const bodyAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${tiltAngle}deg` },
        { translateY: suspensionBob.value },
      ],
    };
  });

  // Animated style for rotating wheels
  const wheelAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${wheelRotation.value}deg` }],
    };
  });

  // Proportional sizing for wheels overlay
  // SVG original viewBox is 76 x 56
  const scale = width / 76;
  const wheelDiameter = 13.5 * scale;

  // Wheel positions relative to SVG viewBox (Front: (50, 42), Rear: (18, 42))
  const rearWheelLeft = (18 * scale) - (wheelDiameter / 2);
  const rearWheelTop = (42 * scale) - (wheelDiameter / 2);
  const frontWheelLeft = (50 * scale) - (wheelDiameter / 2);
  const frontWheelTop = (42 * scale) - (wheelDiameter / 2);

  return (
    <Animated.View
      style={[styles.container, { width, height }, bodyAnimatedStyle]}
      accessibilityRole="image"
      accessibilityLabel="Small Red Passenger Bus"
    >
      <Svg viewBox="0 0 76 56" width="100%" height="100%">
        <Defs>
          {/* Vibrant Red Body Gradient */}
          <LinearGradient id="busRed" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#EF4444" />
            <Stop offset="100%" stopColor="#DC2626" />
          </LinearGradient>

          {/* Roof Cap White Accent */}
          <LinearGradient id="busRoof" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#FFFFFF" />
            <Stop offset="100%" stopColor="#F1F5F9" />
          </LinearGradient>

          {/* Sky Blue Glass */}
          <LinearGradient id="busGlass" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#E0F2FE" />
            <Stop offset="100%" stopColor="#7DD3FC" />
          </LinearGradient>
        </Defs>

        {/* ================= MAIN BUS BODY ================= */}
        <Path
          d="M 4,14 C 4,10 7,8 11,8 L 64,8 C 67,8 70,11 71,15 L 72,30 C 72,36 71,42 66,42 L 58,42 C 57,37 54,35 50,35 C 46,35 43,37 42,42 L 26,42 C 25,37 22,35 18,35 C 14,35 11,37 10,42 L 7,42 C 5,42 4,40 4,38 Z"
          fill="url(#busRed)"
        />

        {/* Roof Cap Accent */}
        <Path d="M 8,8 L 66,8 C 68,8 69,9 69,11 L 7,11 C 7,9 8,8 8,8 Z" fill="url(#busRoof)" />

        {/* Front Windshield */}
        <Path d="M 55,14 L 68,14 C 69,14 70,15 70,17 L 70,25 L 55,25 Z" fill="url(#busGlass)" />

        {/* Side Passenger Windows */}
        <Rect x="39" y="14" width="13" height="11" rx="1.5" fill="url(#busGlass)" />
        <Rect x="23" y="14" width="13" height="11" rx="1.5" fill="url(#busGlass)" />
        <Rect x="7" y="14" width="13" height="11" rx="1.5" fill="url(#busGlass)" />

        {/* Clean White Window Pillar Dividers */}
        <Line x1="21" y1="13" x2="21" y2="26" stroke="#FFFFFF" strokeWidth="2.2" />
        <Line x1="37" y1="13" x2="37" y2="26" stroke="#FFFFFF" strokeWidth="2.2" />
        <Line x1="53" y1="13" x2="53" y2="26" stroke="#FFFFFF" strokeWidth="2.2" />

        {/* Lower Bumper / Skirt */}
        <Path d="M 4,36 L 72,36 L 72,39 L 4,39 Z" fill="#1E293B" opacity={0.65} />

        {/* Front Headlight */}
        <Ellipse cx="71" cy="32" rx="1.5" ry="2.5" fill="#FEF08A" />
        <Ellipse cx="71" cy="32" rx="0.8" ry="1.5" fill="#FFFFFF" />
      </Svg>

      {/* ================= REAR WHEEL (ROTATING) ================= */}
      <Animated.View
        style={[
          styles.wheel,
          {
            left: rearWheelLeft,
            top: rearWheelTop,
            width: wheelDiameter,
            height: wheelDiameter,
          },
          wheelAnimatedStyle,
        ]}
      >
        <BusWheelGraphic diameter={wheelDiameter} />
      </Animated.View>

      {/* ================= FRONT WHEEL (ROTATING) ================= */}
      <Animated.View
        style={[
          styles.wheel,
          {
            left: frontWheelLeft,
            top: frontWheelTop,
            width: wheelDiameter,
            height: wheelDiameter,
          },
          wheelAnimatedStyle,
        ]}
      >
        <BusWheelGraphic diameter={wheelDiameter} />
      </Animated.View>
    </Animated.View>
  );
};

const BusWheelGraphic: React.FC<{ diameter: number }> = ({ diameter }) => {
  return (
    <Svg viewBox="0 0 14 14" width={diameter} height={diameter}>
      <Circle cx="7" cy="7" r="6.5" fill="#1F2937" />
      <Circle cx="7" cy="7" r="4.2" fill="#E5E7EB" />
      <Line x1="3.5" y1="7" x2="10.5" y2="7" stroke="#9CA3AF" strokeWidth="1.2" />
      <Line x1="7" y1="3.5" x2="7" y2="10.5" stroke="#9CA3AF" strokeWidth="1.2" />
      <Circle cx="7" cy="7" r="1.8" fill="#4B5563" />
      <Circle cx="7" cy="7" r="0.8" fill="#111827" />
    </Svg>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheel: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AnimatedBus;

