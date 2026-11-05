import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

interface TrustBannerProps {
  delay?: number;
}

export const TrustBanner: React.FC<TrustBannerProps> = ({ delay = 1400 }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(12);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) })
    );
    translateY.value = withDelay(
      delay,
      withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) })
    );
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    };
  });

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={styles.banner}>
        <View style={styles.iconWrapper}>
          <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <Path
              d="M 12,2 L 20,5.5 V 11.5 C 20,16.5 16.5,21 12,22 C 7.5,21 4,16.5 4,11.5 V 5.5 Z"
              fill="#087C45"
            />
            <Path
              d="M 9,12 L 11,14 L 15,9.5"
              stroke="#FFFFFF"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>
        <Text style={styles.bannerText}>
          IRCTC Station Express Partner • 5-Min Seat Drop • Verified Safety
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 6,
    marginBottom: 10,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  iconWrapper: {
    marginRight: 6,
  },
  bannerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#087C45',
    textAlign: 'center',
    letterSpacing: -0.1,
    flexShrink: 1,
  },
});

export default TrustBanner;

