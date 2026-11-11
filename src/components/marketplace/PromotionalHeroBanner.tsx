import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Zap, Clock } from 'lucide-react-native';
import { JOURNEY_DETAILS } from '../../data/marketplaceData';

interface PromotionalHeroBannerProps {
  onPress?: () => void;
}

export const PromotionalHeroBanner: React.FC<PromotionalHeroBannerProps> = ({
  onPress,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={onPress}
        style={styles.cardWrapper}
      >
        {/* Background Vande Bharat High-Res Image */}
        <Image
          source={require('../../assets/images/vande_bharat_banner.jpg')}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={200}
        />

        {/* Rich Dark Emerald Gradient Overlay for High Contrast */}
        <LinearGradient
          colors={[
            'rgba(0, 0, 0, 0.25)',
            'rgba(5, 20, 12, 0.45)',
            'rgba(4, 20, 12, 0.94)',
          ]}
          locations={[0, 0.4, 0.95]}
          style={styles.gradientOverlay}
        >
          {/* Top Bar: Express Delivery & Station Badge */}
          <View style={styles.topRow}>
            <View style={styles.expressBadge}>
              <Zap size={11} color="#FFFFFF" fill="#FFFFFF" />
              <Text style={styles.expressBadgeText}>EXPRESS DELIVERY</Text>
            </View>

            <View style={styles.stationBadge}>
              <Text style={styles.stationBadgeText}>
                {JOURNEY_DETAILS.station || 'Bhopal Jn'}
              </Text>
            </View>
          </View>

          {/* Bottom Content Area */}
          <View style={styles.bottomRow}>
            {/* Left Column: Train Name, Headline & Halt Info */}
            <View style={styles.leftInfoCol}>
              <Text style={styles.trainTag}></Text>
              <Text style={styles.headline}>Rapid In-Berth Delivery</Text>

              <View style={styles.haltDetailRow}>
                <Clock size={13} color="#F59E0B" strokeWidth={2.4} />
                <Text style={styles.haltDetailText}>
                  {JOURNEY_DETAILS.haltMinutes || 10} Mins Halt • Coach{' '}
                  {JOURNEY_DETAILS.coach}, Berth {JOURNEY_DETAILS.berth}
                </Text>
              </View>
            </View>

            {/* Right Column: Dark Store 5 MIN Frosted Badge */}
            <View style={styles.darkStoreBadge}>
              <Text style={styles.darkStoreLabel}>DARK STORE</Text>
              <Text style={styles.darkStoreTime}>5 MIN</Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 4,
  },
  cardWrapper: {
    height: 195,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.2,
    borderColor: 'rgba(52, 211, 153, 0.4)',
    shadowColor: '#052012',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 4,
    position: 'relative',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFill,
    paddingHorizontal: 15,
    paddingVertical: 14,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expressBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4.5,
    backgroundColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 20,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 2,
  },
  expressBadgeText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  stationBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    paddingHorizontal: 11,
    paddingVertical: 4.5,
    borderRadius: 20,
  },
  stationBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  leftInfoCol: {
    flex: 1,
    paddingRight: 10,
  },
  trainTag: {
    color: '#6EE7B7',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  headline: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '900',
    letterSpacing: -0.3,
    marginTop: 2,
    marginBottom: 5,
  },
  haltDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  haltDetailText: {
    color: '#F1F5F9',
    fontSize: 11.5,
    fontWeight: '600',
  },
  darkStoreBadge: {
    backgroundColor: 'rgba(12, 22, 16, 0.88)',
    borderWidth: 1.2,
    borderColor: 'rgba(52, 211, 153, 0.45)',
    borderRadius: 14,
    paddingHorizontal: 13,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  darkStoreLabel: {
    color: '#6EE7B7',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  darkStoreTime: {
    color: '#FFFFFF',
    fontSize: 16.5,
    fontWeight: '900',
    marginTop: 1,
  },
});

export default PromotionalHeroBanner;
