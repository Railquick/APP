import React from 'react';
import {
  StyleSheet,
  View,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Defs, RadialGradient, Stop, Circle } from 'react-native-svg';
import RailQuickHeader from '../components/RailQuickHeader';
import HeroHeadline from '../components/HeroHeadline';
import AnimatedProductShowcase from '../components/AnimatedProductShowcase';
import WelcomePanel from '../components/WelcomePanel';

interface WelcomeScreenProps {
  onSignInSuccess?: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSignInSuccess }) => {
  const { width, height } = useWindowDimensions();

  // Hero section occupies approximately 59-60% of screen height to guarantee
  // that the product image AND the category pill have ample breathing room,
  // while pushing the bottom Welcome Aboard card comfortably lower.
  const heroHeight = Math.max(Math.round(height * 0.61), 520);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= SECTION A: TOP HERO SECTION (GREEN) ================= */}
        <View style={[styles.heroSection, { height: heroHeight, width }]}>
          {/* Deep Emerald Green Gradient */}
          <LinearGradient
            colors={['#04522B', '#087C45', '#0E9456', '#12A565']}
            locations={[0, 0.35, 0.75, 1]}
            style={StyleSheet.absoluteFill}
          />

          {/* Abstract Curved Railway-Track and Glowing Depth SVG Patterns */}
          <Svg
            style={StyleSheet.absoluteFill}
            width={width}
            height={heroHeight}
            viewBox={`0 0 ${width} ${heroHeight}`}
          >
            <Defs>
              <RadialGradient
                id="heroGlow"
                cx="80%"
                cy="25%"
                rx="60%"
                ry="50%"
                fx="80%"
                fy="25%"
              >
                <Stop offset="0%" stopColor="#34D399" stopOpacity="0.22" />
                <Stop offset="100%" stopColor="#087C45" stopOpacity="0" />
              </RadialGradient>
              <RadialGradient
                id="cornerGlow"
                cx="15%"
                cy="70%"
                rx="50%"
                ry="45%"
                fx="15%"
                fy="70%"
              >
                <Stop offset="0%" stopColor="#10B981" stopOpacity="0.18" />
                <Stop offset="100%" stopColor="#087C45" stopOpacity="0" />
              </RadialGradient>
            </Defs>

            {/* Glowing orbs for depth */}
            <Circle cx={width * 0.85} cy={heroHeight * 0.25} r={width * 0.45} fill="url(#heroGlow)" />
            <Circle cx={width * 0.15} cy={heroHeight * 0.65} r={width * 0.35} fill="url(#cornerGlow)" />

            {/* Subtle Abstract Curved Railway Track Lines */}
            <Path
              d={`M -20,${heroHeight * 0.3} Q ${width * 0.45},${heroHeight * 0.12} ${width + 30},${heroHeight * 0.38}`}
              stroke="#FFFFFF"
              strokeWidth="1.2"
              strokeOpacity="0.12"
              fill="none"
            />
            <Path
              d={`M -20,${heroHeight * 0.34} Q ${width * 0.45},${heroHeight * 0.16} ${width + 30},${heroHeight * 0.42}`}
              stroke="#FFFFFF"
              strokeWidth="1.2"
              strokeOpacity="0.1"
              fill="none"
            />
            {/* Railroad Track Sleepers/Ties (Subtle dashed line) */}
            <Path
              d={`M -10,${heroHeight * 0.32} Q ${width * 0.45},${heroHeight * 0.14} ${width + 20},${heroHeight * 0.4}`}
              stroke="#A7F3D0"
              strokeWidth="3.5"
              strokeDasharray="2, 12"
              strokeOpacity="0.14"
              fill="none"
            />
          </Svg>

          {/* Safe Area wrapper for Top Header */}
          <SafeAreaView style={styles.safeHeaderArea} edges={['top', 'left', 'right']}>
            {/* Top Header: Logo Capsule & Station Express Pill Badge */}
            <RailQuickHeader delay={100} />

            {/* Main Headline */}
            <HeroHeadline delay={250} />

            {/* UNIQUE ANIMATED PRODUCT SHOWCASE (Central Attraction with Category Pill) */}
            <AnimatedProductShowcase startDelay={450} cycleDuration={3400} />
          </SafeAreaView>
        </View>

        {/* ================= SECTION B: BOTTOM WELCOME PANEL (WHITE) ================= */}
        <View style={styles.bottomSheetContainer}>
          <WelcomePanel delay={650} onSignInSuccess={onSignInSuccess} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#04522B',
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#04522B',
    justifyContent: 'flex-start',
  },
  heroSection: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#04522B',
  },
  safeHeaderArea: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 24, // Generous breathing space below category pill
  },
  bottomSheetContainer: {
    flex: 1,
    marginTop: -4, // Minimal overlap prevents pixel gaps while keeping card strictly below category text
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
  },
});

export default WelcomeScreen;
