import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AnimatedLogo from '../components/AnimatedLogo';
import TransportationConvoy from '../components/TransportationConvoy';

interface SplashScreenProps {
  /**
   * Optional callback when splash screen animation or initial flow completes
   */
  onSplashFinished?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onSplashFinished,
}) => {
  const { width, height } = useWindowDimensions();

  // Vertical layout guidelines:
  // Logo positioned slightly above vertical midpoint (around 42-45% of height)
  // Transportation animation positioned below logo (around 62-65% of height)
  const logoTopPosition = height * 0.42;
  const convoyTopPosition = height * 0.62;

  return (
    <View style={styles.container}>
      {/* Native Status Bar configuration: dark icons on pure white background */}
      <StatusBar style="dark" />

      {/* 1. RailQuick Logo Container */}
      <View
        style={[
          styles.logoWrapper,
          {
            top: logoTopPosition,
          },
        ]}
      >
        <AnimatedLogo
          maxWidth={Math.min(width * 0.85, 340)}
          onAnimationComplete={onSplashFinished}
        />
      </View>

      {/* 2. Transportation Animation (Train, Charger, Lay's) */}
      <TransportationConvoy
        startDelay={500}
        travelDuration={6800}
        loopInterval={600}
        trackTop={convoyTopPosition}
        trainTilt={-12}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    position: 'relative',
    overflow: 'hidden',
  },
  logoWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateY: -45 }], // Vertically centers the logo around the target anchor point
  },
});

export default SplashScreen;
