import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path, Circle, Rect, Line, G } from 'react-native-svg';

interface RailQuickHeaderProps {
  /**
   * Optional custom opacity or entrance delay
   */
  delay?: number;
}

export const RailQuickHeader: React.FC<RailQuickHeaderProps> = ({
  delay = 0,
}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-10);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      opacity.value = withTiming(1, {
        duration: 800,
        easing: Easing.out(Easing.cubic),
      });
      translateY.value = withTiming(0, {
        duration: 800,
        easing: Easing.out(Easing.cubic),
      });
    }, delay);

    return () => clearTimeout(timeout);
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    };
  });

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {/* Left: RailQuick Logo inside translucent capsule */}
      <View style={styles.logoCapsule}>
        <View style={styles.logoRow}>
          <Text style={styles.railText}>Rail</Text>
          <View style={styles.magnifier}>
            <Svg width="18" height="18" viewBox="0 0 20 20">
              {/* Outer ring */}
              <Circle
                cx="9"
                cy="9"
                r="6.5"
                stroke="#FFFFFF"
                strokeWidth="2.2"
                fill="none"
              />
              {/* Handle */}
              <Line
                x1="13.5"
                y1="13.5"
                x2="17.5"
                y2="17.5"
                stroke="#FFFFFF"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              {/* Orange forward arrow inside magnifying glass */}
              <Path
                d="M 7.5,6.5 L 11,9 L 7.5,11.5"
                stroke="#F97316"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </Svg>
          </View>
          <Text style={styles.quickText}>uick</Text>
        </View>
      </View>

      {/* Right: Station Express badge inside translucent pill */}
      <View style={styles.badgePill}>
        <Svg width="15" height="15" viewBox="0 0 24 24" style={styles.badgeIcon}>
          {/* Train / Station Icon */}
          <Rect
            x="4"
            y="3"
            width="16"
            height="15"
            rx="3"
            stroke="#FFFFFF"
            strokeWidth="2"
            fill="none"
          />
          <Line x1="4" y1="10" x2="20" y2="10" stroke="#FFFFFF" strokeWidth="2" />
          <Circle cx="8.5" cy="14.5" r="1.5" fill="#FFFFFF" />
          <Circle cx="15.5" cy="14.5" r="1.5" fill="#FFFFFF" />
          <Line
            x1="7"
            y1="18"
            x2="4"
            y2="21"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <Line
            x1="17"
            y1="18"
            x2="20"
            y2="21"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </Svg>
        <Text style={styles.badgeText}>Station Express</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 12,
    zIndex: 10,
  },
  logoCapsule: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  railText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  magnifier: {
    marginHorizontal: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickText: {
    color: '#34D399',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  badgeIcon: {
    marginRight: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});

export default RailQuickHeader;

