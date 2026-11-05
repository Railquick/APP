import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { Train, Bike } from 'lucide-react-native';

export const PromotionalHeroBanner: React.FC = () => {
  // Pinging dot animation for "Live Station Dark Store"
  const pingScale = useSharedValue(1);
  const pingOpacity = useSharedValue(0.8);

  useEffect(() => {
    pingScale.value = withRepeat(
      withSequence(
        withTiming(1.9, { duration: 1100, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 1100, easing: Easing.in(Easing.ease) })
      ),
      -1,
      false
    );
    pingOpacity.value = withRepeat(
      withSequence(
        withTiming(0.2, { duration: 1100 }),
        withTiming(0.9, { duration: 1100 })
      ),
      -1,
      false
    );
  }, []);

  const pingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pingScale.value }],
    opacity: pingOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#D4F6E1', '#E5FAEE', '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientCard}
      >
        {/* Left Content */}
        <View style={styles.contentBlock}>
          <View style={styles.badgeRow}>
            <View style={styles.expressBadge}>
              <Train size={11} color="#FFFFFF" />
              <Text style={styles.expressBadgeText}>BERTH EXPRESS DELIVERY</Text>
            </View>
          </View>

          <Text style={styles.headline}>
            5-Min Berth Delivery Guaranteed at Next Station Halt
          </Text>

          <Text style={styles.subtext}>
            Hand-delivered directly to Coach B2, Berth 36 while your train stops at Bhopal Jn.
          </Text>

          <View style={styles.liveStoreRow}>
            <View style={styles.liveStorePill}>
              <View style={styles.pingContainer}>
                <Animated.View style={[styles.pingCircle, pingStyle]} />
                <View style={styles.solidCircle} />
              </View>
              <Text style={styles.liveStoreText}>Live Station Dark Store</Text>
            </View>
          </View>
        </View>

        {/* Right Illustration: Electric delivery vehicle */}
        <View style={styles.illustrationArea}>
          <View style={styles.iconBox}>
            <Svg width="52" height="52" viewBox="0 0 24 24" fill="none">
              {/* Electric scooter / delivery moped SVG */}
              <Circle cx="5" cy="18" r="3" stroke="#159447" strokeWidth="2" />
              <Circle cx="19" cy="18" r="3" stroke="#159447" strokeWidth="2" />
              <Path
                d="M5 18h4l3-7h6l1 4"
                stroke="#159447"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M17 11V7a1 1 0 0 0-1-1h-2"
                stroke="#08763A"
                strokeWidth="2"
                strokeLinecap="round"
              />
              {/* Delivery Box */}
              <Rect
                x="8"
                y="6"
                width="6"
                height="5"
                rx="1"
                fill="#159447"
                stroke="#08763A"
                strokeWidth="1"
              />
            </Svg>

            {/* 5 MIN tag on top-right */}
            <View style={styles.minuteTag}>
              <Text style={styles.minuteTagText}>5 MIN</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 4,
  },
  gradientCard: {
    borderRadius: 20,
    borderWidth: 1.2,
    borderColor: '#C3EDD1',
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#159447',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  contentBlock: {
    flex: 1,
    paddingRight: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  expressBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#08763A',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  expressBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  headline: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 21,
    letterSpacing: -0.2,
  },
  subtext: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#475569',
    marginTop: 4,
    lineHeight: 16,
  },
  liveStoreRow: {
    marginTop: 8,
    flexDirection: 'row',
  },
  liveStorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
  },
  pingContainer: {
    width: 8,
    height: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pingCircle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  solidCircle: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#059669',
  },
  liveStoreText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#08763A',
  },
  illustrationArea: {
    width: 86,
    height: 86,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBox: {
    width: 76,
    height: 76,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  minuteTag: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  minuteTagText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});

export default PromotionalHeroBanner;

