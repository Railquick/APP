import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AnimatedLogo from '../components/AnimatedLogo';

interface SplashScreenProps {
  /**
   * Optional callback when splash screen animation or initial flow completes
   */
  onSplashFinished?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onSplashFinished,
}) => {
  const { width } = useWindowDimensions();

  return (
    <View style={styles.container}>
      {/* Native Status Bar configuration: dark icons on pure white background */}
      <StatusBar style="dark" />

      {/* RailQuick Logo Container (Centered) */}
      <View style={styles.logoWrapper}>
        <AnimatedLogo
          maxWidth={Math.min(width * 0.85, 340)}
          onAnimationComplete={onSplashFinished}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SplashScreen;
