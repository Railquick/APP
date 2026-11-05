import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path, Rect, Circle, Line } from 'react-native-svg';

export type FeatureIconType = 'seat' | 'stopwatch' | 'shield';

interface FeatureCardProps {
  iconType: FeatureIconType;
  label: string;
  delayIndex?: number;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  iconType,
  label,
  delayIndex = 0,
}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(16);

  useEffect(() => {
    const delay = 900 + delayIndex * 100;
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) })
    );
    translateY.value = withDelay(
      delay,
      withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) })
    );
  }, [delayIndex]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    };
  });

  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      <View style={styles.iconContainer}>
        {iconType === 'seat' && <SeatDeliveryIcon />}
        {iconType === 'stopwatch' && <StopwatchIcon />}
        {iconType === 'shield' && <ShieldCheckIcon />}
      </View>
      <Text style={styles.labelText}>{label}</Text>
    </Animated.View>
  );
};

const SeatDeliveryIcon = () => (
  <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    {/* Passenger Train Seat & Delivery package */}
    <Path
      d="M 5,4 C 5,2.9 5.9,2 7,2 L 13,2 C 14.1,2 15,2.9 15,4 L 15,12 L 6,12 C 5.4,12 5,11.6 5,11 Z"
      stroke="#087C45"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M 4,12 L 17,12 C 18.1,12 19,12.9 19,14 L 19,16 L 4,16 C 3.4,16 3,15.6 3,15 L 3,13 C 3,12.4 3.4,12 4,12 Z"
      fill="#087C45"
      opacity={0.15}
      stroke="#087C45"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <Line x1="6" y1="16" x2="6" y2="21" stroke="#087C45" strokeWidth="2" strokeLinecap="round" />
    <Line x1="16" y1="16" x2="16" y2="21" stroke="#087C45" strokeWidth="2" strokeLinecap="round" />
    {/* Small box delivery badge */}
    <Rect
      x="8"
      y="6"
      width="6"
      height="5"
      rx="1"
      stroke="#087C45"
      strokeWidth="1.5"
      fill="#E8F5E9"
    />
  </Svg>
);

const StopwatchIcon = () => (
  <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="14" r="8" stroke="#087C45" strokeWidth="2" />
    <Path d="M 12,10 L 12,14 L 15,14" stroke="#087C45" strokeWidth="2" strokeLinecap="round" />
    <Line x1="12" y1="2" x2="12" y2="4" stroke="#087C45" strokeWidth="2" strokeLinecap="round" />
    <Line x1="10" y1="2" x2="14" y2="2" stroke="#087C45" strokeWidth="2" strokeLinecap="round" />
    <Line x1="18.5" y1="6.5" x2="19.5" y2="5.5" stroke="#087C45" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const ShieldCheckIcon = () => (
  <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <Path
      d="M 12,2 L 20,5.5 V 11.5 C 20,16.5 16.5,21 12,22 C 7.5,21 4,16.5 4,11.5 V 5.5 Z"
      stroke="#087C45"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="#087C45"
      fillOpacity={0.12}
    />
    <Path
      d="M 9,12 L 11,14 L 15,9.5"
      stroke="#087C45"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#E8F5E9',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#D1FAE5',
    shadowColor: '#087C45',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  iconContainer: {
    marginBottom: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#087C45',
    textAlign: 'center',
    letterSpacing: -0.1,
  },
});

export default FeatureCard;

