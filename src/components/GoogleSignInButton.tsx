import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  View,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

interface GoogleSignInButtonProps {
  delay?: number;
  onPress?: () => void;
  onSignInSuccess?: () => void;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  delay = 1200,
  onPress,
  onSignInSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(18);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) })
    );
    translateY.value = withDelay(
      delay,
      withTiming(0, { duration: 700, easing: Easing.out(Easing.cubic) })
    );
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    };
  });

  const handlePress = async () => {
    if (isLoading) return;

    if (onPress) {
      onPress();
      return;
    }

    try {
      setIsLoading(true);

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=355290036049-hnnuk03tbarbk1f9ivverm987nrqp5gl.apps.googleusercontent.com&redirect_uri=https%3A%2F%2Frailquick-backend.onrender.com%2Fapi%2Fv1%2Fauth%2Fgoogle%2Fcallback&response_type=code&scope=openid%20email%20profile&access_type=offline&prompt=select_account`;

      if (typeof window !== 'undefined') {
        window.location.href = authUrl;
      } else {
        await Linking.openURL(authUrl);
      }
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Sign-In Error', 'Unable to connect to Google Services. Please try again.');
    }
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <TouchableOpacity
        style={styles.button}
        onPress={handlePress}
        activeOpacity={0.85}
        disabled={isLoading}
        accessibilityRole="button"
        accessibilityLabel="Continue with Google"
      >
        {isLoading ? (
          <ActivityIndicator color="#087C45" size="small" />
        ) : (
          <View style={styles.contentRow}>
            {/* Authentic Google "G" Multicolor SVG Icon */}
            <View style={styles.googleIconContainer}>
              <Svg width="22" height="22" viewBox="0 0 48 48">
                {/* Red */}
                <Path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                {/* Blue */}
                <Path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                />
                {/* Yellow */}
                <Path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                />
                {/* Green */}
                <Path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
              </Svg>
            </View>

            <Text style={styles.buttonText}>Continue with Google</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 14,
    marginBottom: 8,
  },
  button: {
    height: 64,
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIconContainer: {
    marginRight: 12,
  },
  buttonText: {
    fontSize: 16.5,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.1,
  },
});

export default GoogleSignInButton;
