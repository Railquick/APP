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
  G,
} from 'react-native-svg';

interface AnimatedAutoProps {
  /**
   * Width of the auto in points (default: ~64)
   */
  width?: number;
  /**
   * Height of the auto in points (default: ~50)
   */
  height?: number;
  /**
   * Tilt angle in degrees (default: -4 to match reference perspective)
   */
  tiltAngle?: number;
  /**
   * Whether to animate wheel rotation (default: true)
   */
  isMoving?: boolean;
}

export const AnimatedAuto: React.FC<AnimatedAutoProps> = ({
  width = 64,
  height = 50,
  tiltAngle = -4,
  isMoving = true,
}) => {
  // Wheel rotation angle in degrees (0 -> 360)
  const wheelRotation = useSharedValue(0);

  // Subtle suspension/road bobbing
  const suspensionBob = useSharedValue(0);

  useEffect(() => {
    if (isMoving) {
      // Continuous 360-degree wheel rotation synced with forward cruising speed
      wheelRotation.value = withRepeat(
        withTiming(360, {
          duration: 480,
          easing: Easing.linear,
        }),
        -1,
        false
      );

      // Subtle engine & road bump vibration
      suspensionBob.value = withRepeat(
        withSequence(
          withTiming(-0.8, { duration: 150, easing: Easing.inOut(Easing.quad) }),
          withTiming(0.8, { duration: 150, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        true
      );
    }
  }, [isMoving]);

  // Style for the vehicle body
  const bodyAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${tiltAngle}deg` },
        { translateY: suspensionBob.value },
      ],
    };
  });

  // Separate animated styles for rotating wheels
  const wheelAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${wheelRotation.value}deg` }],
    };
  });

  // Proportional sizing for wheels overlay
  // SVG original viewBox is 70 x 56
  const scale = width / 70;
  const wheelDiameter = 13.5 * scale;

  // Wheel positions relative to SVG viewBox (Front: (54, 43), Rear: (18, 43))
  const rearWheelLeft = (18 * scale) - (wheelDiameter / 2);
  const rearWheelTop = (43 * scale) - (wheelDiameter / 2);
  const frontWheelLeft = (54 * scale) - (wheelDiameter / 2);
  const frontWheelTop = (43 * scale) - (wheelDiameter / 2);

  return (
    <Animated.View
      style={[styles.container, { width, height }, bodyAnimatedStyle]}
      accessibilityRole="image"
      accessibilityLabel="Indian Yellow Auto-Rickshaw"
    >
      {/* Auto Body SVG (without wheels, which are overlaid with independent rotation) */}
      <Svg viewBox="0 0 70 56" width="100%" height="100%">
        <Defs>
          {/* Golden Yellow Body Gradient */}
          <LinearGradient id="autoYellow" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#FBBF24" />
            <Stop offset="100%" stopColor="#D97706" />
          </LinearGradient>

          {/* Charcoal Canopy Roof */}
          <LinearGradient id="autoRoof" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#374151" />
            <Stop offset="100%" stopColor="#1F2937" />
          </LinearGradient>

          {/* Pale Cyan Windshield */}
          <LinearGradient id="autoGlass" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#E0F2FE" />
            <Stop offset="100%" stopColor="#BAE6FD" />
          </LinearGradient>
        </Defs>

        {/* ================= CANOPY / ROOF ================= */}
        <Path
          d="M 6,18 C 6,10 14,5 34,4 C 50,4 60,7 64,18 C 64,19 63,20 61,20 L 7,20 C 6,20 6,19 6,18 Z"
          fill="url(#autoRoof)"
        />
        {/* Rear Canopy Slant */}
        <Path d="M 6,18 L 6,30 L 12,30 L 10,20 Z" fill="url(#autoRoof)" />

        {/* Cabin Interior (Dark) */}
        <Path d="M 10,20 L 60,20 L 58,34 L 10,34 Z" fill="#111827" />
        {/* Passenger Seat Cushion */}
        <Rect x="12" y="27" width="14" height="6" rx="1.5" fill="#374151" />
        {/* Steering column / handle */}
        <Line x1="46" y1="30" x2="52" y2="24" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />

        {/* Windshield Glass */}
        <Path d="M 48,7 L 63,18 L 61,22 L 48,22 Z" fill="url(#autoGlass)" opacity={0.92} />
        {/* Windshield Pillar Frame */}
        <Line x1="48" y1="6" x2="63" y2="18" stroke="#1F2937" strokeWidth="1.6" strokeLinecap="round" />

        {/* ================= CHASSIS / LOWER BODY (YELLOW) ================= */}
        <Path
          d="M 8,30 L 62,30 C 64,30 65,32 65,35 L 63,40 C 62,42 59,43 56,43 L 48,43 C 47,38 43,36 39,36 C 35,36 32,38 31,43 L 26,43 C 25,38 21,36 17,36 C 13,36 10,38 9,43 L 8,43 C 7,43 6,42 6,40 L 6,32 C 6,31 7,30 8,30 Z"
          fill="url(#autoYellow)"
        />
        {/* Green Accent Stripe */}
        <Path d="M 6,34 L 64,34 L 63,37 L 6,37 Z" fill="#15803D" opacity={0.88} />

        {/* Headlight */}
        <Ellipse cx="63.5" cy="33" rx="1.5" ry="2.5" fill="#FEF08A" />
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
        <WheelGraphic diameter={wheelDiameter} />
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
        <WheelGraphic diameter={wheelDiameter} />
      </Animated.View>
    </Animated.View>
  );
};

/**
 * Reusable crisp rotating Wheel SVG graphic
 */
const WheelGraphic: React.FC<{ diameter: number }> = ({ diameter }) => {
  return (
    <Svg viewBox="0 0 14 14" width={diameter} height={diameter}>
      {/* Outer Rubber Tire */}
      <Circle cx="7" cy="7" r="6.5" fill="#1F2937" />
      {/* Silver Rim */}
      <Circle cx="7" cy="7" r="4.2" fill="#E5E7EB" />
      {/* Rotating Spokes */}
      <Line x1="3.5" y1="7" x2="10.5" y2="7" stroke="#9CA3AF" strokeWidth="1.2" />
      <Line x1="7" y1="3.5" x2="7" y2="10.5" stroke="#9CA3AF" strokeWidth="1.2" />
      {/* Center Axle Hub */}
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

export default AnimatedAuto;

