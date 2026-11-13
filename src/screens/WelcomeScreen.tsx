import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useAuth } from '../context/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Card dimensions for the animated product grid
const CARD_WIDTH = 98;
const CARD_HEIGHT = 100;
const CARD_GAP = 12;

// Row 1 Products (moves LEFT)
const ROW_1_PRODUCTS = [
  require('../assets/auth_products/pampers.png'),
  require('../assets/auth_products/silk.png'),
  require('../assets/auth_products/granola.png'),
  require('../assets/auth_products/biscuits.png'),
];

// Row 2 Products (moves RIGHT)
const ROW_2_PRODUCTS = [
  require('../assets/auth_products/spoons.png'),
  require('../assets/auth_products/vanilla.png'),
  require('../assets/auth_products/crocin.png'),
  require('../assets/auth_products/pads.png'),
];

// Row 3 Products (moves LEFT)
const ROW_3_PRODUCTS = [
  require('../assets/auth_products/coke.png'),
  require('../assets/auth_products/biscuits.png'),
  require('../assets/auth_products/lays.png'),
  require('../assets/auth_products/hub.png'),
];

// Width of 1 full set of 4 cards
const ONE_SET_WIDTH = ROW_1_PRODUCTS.length * (CARD_WIDTH + CARD_GAP);

interface WelcomeScreenProps {
  onSignInSuccess?: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSignInSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);

  let authCtx: any = null;
  try {
    authCtx = useAuth();
  } catch {
    // Fallback if rendered outside provider
  }

  // ================= HORIZONTAL CONTINUOUS MARQUEE ANIMATIONS =================
  // Row 1: moves towards LEFT continuously
  const row1TranslateX = useSharedValue(0);
  // Row 2: moves towards RIGHT continuously
  const row2TranslateX = useSharedValue(-ONE_SET_WIDTH);
  // Row 3: moves towards LEFT continuously
  const row3TranslateX = useSharedValue(0);

  useEffect(() => {
    // Row 1 -> Left (0 to -ONE_SET_WIDTH)
    row1TranslateX.value = withRepeat(
      withTiming(-ONE_SET_WIDTH, {
        duration: 14000,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    // Row 2 -> Right (-ONE_SET_WIDTH to 0)
    row2TranslateX.value = withRepeat(
      withTiming(0, {
        duration: 14000,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    // Row 3 -> Left (0 to -ONE_SET_WIDTH) with slight speed variation
    row3TranslateX.value = withRepeat(
      withTiming(-ONE_SET_WIDTH, {
        duration: 15500,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, []);

  const row1AnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: row1TranslateX.value }],
  }));

  const row2AnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: row2TranslateX.value }],
  }));

  const row3AnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: row3TranslateX.value }],
  }));

  // ================= GOOGLE SIGN-IN HANDLER =================
  const handleGoogleSignIn = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      if (authCtx?.signInWithGoogle) {
        await authCtx.signInWithGoogle();
      } else {
        await new Promise((resolve) => setTimeout(resolve, 600));
      }
      setIsLoading(false);
      if (onSignInSuccess) {
        onSignInSuccess();
      }
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Sign-In Error', 'Unable to connect to Google Services. Please try again.');
    }
  };

  const handlePolicyPress = (type: string) => {
    Alert.alert(
      type,
      `RailQuick ${type} ensures your train berth orders, passenger privacy, and data security are 100% protected.`
    );
  };

  // Helper to render duplicated list for infinite seamless marquee
  const renderRowCards = (items: any[]) => {
    // Triple items so there is never an edge gap on any screen width
    const triplicated = [...items, ...items, ...items];
    return triplicated.map((src, index) => (
      <View key={index} style={styles.cardContainer}>
        <Image source={src} style={styles.cardImage} contentFit="contain" />
      </View>
    ));
  };

  return (
    <SafeAreaView style={styles.screenContainer} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      {/* ================= 1. TOP MOVING PRODUCT CARDS GRID ================= */}
      <View style={styles.marqueeSection}>
        {/* ROW 1: Moving to LEFT */}
        <View style={styles.marqueeRowWrap}>
          <Animated.View style={[styles.marqueeTrack, row1AnimatedStyle]}>
            {renderRowCards(ROW_1_PRODUCTS)}
          </Animated.View>
        </View>

        {/* ROW 2: Moving to RIGHT */}
        <View style={styles.marqueeRowWrap}>
          <Animated.View style={[styles.marqueeTrack, row2AnimatedStyle]}>
            {renderRowCards(ROW_2_PRODUCTS)}
          </Animated.View>
        </View>

        {/* ROW 3: Moving to LEFT */}
        <View style={styles.marqueeRowWrap}>
          <Animated.View style={[styles.marqueeTrack, row3AnimatedStyle]}>
            {renderRowCards(ROW_3_PRODUCTS)}
          </Animated.View>
        </View>
      </View>

      {/* ================= 2. MIDDLE HEADLINE & DIVIDER ================= */}
      <View style={styles.contentSection}>
        {/* Main Headline */}
        <Text style={styles.headingTitle}>India’s Train delivery app</Text>

        {/* Log in or sign up Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>Log in or sign up</Text>
          <View style={styles.dividerLine} />
        </View>
      </View>

      <View style={styles.bottomSection}>
        {/* ================= 3. VERTICAL CONTINUE WITH GOOGLE BUTTON ONLY ================= */}
        <View style={styles.authActionSection}>
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleSignIn}
            activeOpacity={0.85}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel="Continue with Google"
          >
            {isLoading ? (
              <ActivityIndicator color="#0F6C38" size="small" />
            ) : (
              <View style={styles.googleButtonContent}>
                {/* Authentic Google "G" Multicolor SVG Icon */}
                <View style={styles.googleIconBox}>
                  <Svg width="24" height="24" viewBox="0 0 24 24">
                    <Path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <Path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <Path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      fill="#FBBC05"
                    />
                    <Path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      fill="#EA4335"
                    />
                  </Svg>
                </View>

                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* ================= 4. TERMS & PRIVACY FOOTER ================= */}
        <View style={styles.footerSection}>
          <Text style={styles.termsBaseText}>By continuing, you agree to our</Text>
          <View style={styles.termsLinksRow}>
            <TouchableOpacity onPress={() => handlePolicyPress('Terms of Service')}>
              <Text style={styles.termsLinkText}>Terms of Service</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handlePolicyPress('Privacy Policy')}>
              <Text style={styles.termsLinkText}>Privacy Policy</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handlePolicyPress('Content Policy')}>
              <Text style={styles.termsLinkText}>Content Policy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },

  // ---- 1. Top Moving Product Cards Grid ----
  marqueeSection: {
    paddingTop: 8,
    gap: 12,
    overflow: 'hidden',
  },
  marqueeRowWrap: {
    height: CARD_HEIGHT,
    overflow: 'hidden',
  },
  marqueeTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: CARD_GAP,
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 22,
    backgroundColor: '#F8F9FB',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },

  // ---- 2. Middle Headline & Divider ----
  contentSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 18,
  },
  headingTitle: {
    fontSize: 25,
    fontWeight: '900',
    color: '#111827',
    textAlign: 'center',
    letterSpacing: -0.4,
    marginBottom: 16,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    paddingHorizontal: 14,
    fontSize: 13.5,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: -0.1,
  },

  // ---- 3. Vertical Continue with Google Button Only ----
  authActionSection: {
    width: '100%',
    paddingHorizontal: 24,
    marginBottom: 50,
  },
  googleButton: {
    width: '100%',
    height: 62,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 3,
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  googleIconBox: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: -0.2,
  },

  // ---- 4. Terms & Policy Footer ----
  bottomSection: {
    width: '100%',
  },
  footerSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  termsBaseText: {
    fontSize: 11.5,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 3,
  },
  termsLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  termsLinkText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#4B5563',
  },
});

export default WelcomeScreen;
