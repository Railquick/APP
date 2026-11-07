import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import SplashScreen from '../screens/SplashScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import PnrVerificationScreen from '../screens/PnrVerificationScreen';
import StationComingSoonScreen from '../screens/StationComingSoonScreen';
import HomeScreen from '../screens/HomeScreen';
import CartScreen from '../screens/CartScreen';
import PaymentScreen from '../screens/PaymentScreen';
import OrderConfirmationScreen from '../screens/OrderConfirmationScreen';
import { useOrder } from '../context/OrderContext';
import { PnrDemoRecord, DEMO_PNR_RECORDS } from '../data/pnrDemoData';

export type ScreenState =
  | 'splash'
  | 'transitioning_welcome'
  | 'welcome'
  | 'pnr_verification'
  | 'station_coming_soon'
  | 'transitioning_home'
  | 'home'
  | 'cart'
  | 'payment'
  | 'order_confirmation';

export const AppNavigator: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('splash');
  const [activePnrRecord, setActivePnrRecord] = useState<PnrDemoRecord>(DEMO_PNR_RECORDS[0]);
  const { activeOrder } = useOrder();

  // Animation values for screen transitions
  const splashOpacity = useSharedValue(1);
  const welcomeOpacity = useSharedValue(0);
  const welcomeTranslateY = useSharedValue(30);

  const pnrOpacity = useSharedValue(0);
  const pnrTranslateY = useSharedValue(25);

  const comingSoonOpacity = useSharedValue(0);
  const comingSoonTranslateY = useSharedValue(25);

  const homeOpacity = useSharedValue(0);
  const homeTranslateY = useSharedValue(25);

  const cartOpacity = useSharedValue(0);
  const cartTranslateX = useSharedValue(40);

  const paymentOpacity = useSharedValue(0);
  const paymentTranslateX = useSharedValue(40);

  const trackingOpacity = useSharedValue(0);
  const trackingTranslateY = useSharedValue(30);

  const handleSplashFinished = () => {
    setCurrentScreen('transitioning_welcome');

    splashOpacity.value = withTiming(0, {
      duration: 550,
      easing: Easing.in(Easing.cubic),
    });

    welcomeTranslateY.value = withTiming(0, {
      duration: 650,
      easing: Easing.out(Easing.cubic),
    });

    welcomeOpacity.value = withTiming(
      1,
      {
        duration: 650,
        easing: Easing.out(Easing.cubic),
      },
      (finished) => {
        if (finished) {
          runOnJS(setCurrentScreen)('welcome');
        }
      }
    );
  };

  const handleSignInSuccess = () => {
    // Navigate to PNR Verification Screen immediately after Google sign-in
    welcomeOpacity.value = withTiming(0, { duration: 350 });
    pnrOpacity.value = 0;
    pnrTranslateY.value = 25;
    setCurrentScreen('pnr_verification');
    pnrOpacity.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) });
    pnrTranslateY.value = withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) });
  };

  const navigateTo = (target: ScreenState) => {
    if (target === 'pnr_verification') {
      pnrOpacity.value = 0;
      pnrTranslateY.value = 20;
      setCurrentScreen('pnr_verification');
      pnrOpacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) });
      pnrTranslateY.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) });
    } else if (target === 'station_coming_soon') {
      comingSoonOpacity.value = 0;
      comingSoonTranslateY.value = 25;
      setCurrentScreen('station_coming_soon');
      comingSoonOpacity.value = withTiming(1, { duration: 350, easing: Easing.out(Easing.cubic) });
      comingSoonTranslateY.value = withTiming(0, { duration: 350, easing: Easing.out(Easing.cubic) });
    } else if (target === 'home') {
      homeOpacity.value = 0;
      homeTranslateY.value = 20;
      setCurrentScreen('home');
      homeOpacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) });
      homeTranslateY.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) });
    } else if (target === 'cart') {
      cartOpacity.value = 0;
      cartTranslateX.value = 30;
      setCurrentScreen('cart');
      cartOpacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) });
      cartTranslateX.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) });
    } else if (target === 'payment') {
      paymentOpacity.value = 0;
      paymentTranslateX.value = 30;
      setCurrentScreen('payment');
      paymentOpacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) });
      paymentTranslateX.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) });
    } else if (target === 'order_confirmation') {
      trackingOpacity.value = 0;
      trackingTranslateY.value = 25;
      setCurrentScreen('order_confirmation');
      trackingOpacity.value = withTiming(1, { duration: 350, easing: Easing.out(Easing.cubic) });
      trackingTranslateY.value = withTiming(0, { duration: 350, easing: Easing.out(Easing.cubic) });
    }
  };

  useEffect(() => {
    // Automatically transition to WelcomeScreen after 3800ms
    const timer = setTimeout(() => {
      handleSplashFinished();
    }, 3800);

    return () => clearTimeout(timer);
  }, []);

  const splashAnimatedStyle = useAnimatedStyle(() => ({
    opacity: splashOpacity.value,
  }));

  const welcomeAnimatedStyle = useAnimatedStyle(() => ({
    opacity: welcomeOpacity.value,
    transform: [{ translateY: welcomeTranslateY.value }],
  }));

  const pnrAnimatedStyle = useAnimatedStyle(() => ({
    opacity: pnrOpacity.value,
    transform: [{ translateY: pnrTranslateY.value }],
  }));

  const comingSoonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: comingSoonOpacity.value,
    transform: [{ translateY: comingSoonTranslateY.value }],
  }));

  const homeAnimatedStyle = useAnimatedStyle(() => ({
    opacity: homeOpacity.value,
    transform: [{ translateY: homeTranslateY.value }],
  }));

  const cartAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cartOpacity.value,
    transform: [{ translateX: cartTranslateX.value }],
  }));

  const paymentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: paymentOpacity.value,
    transform: [{ translateX: paymentTranslateX.value }],
  }));

  const trackingAnimatedStyle = useAnimatedStyle(() => ({
    opacity: trackingOpacity.value,
    transform: [{ translateY: trackingTranslateY.value }],
  }));

  return (
    <View style={styles.container}>
      {/* GLOBAL POST-AUTH MANDALA BACKGROUND (Applied across screens after Google Auth) */}
      {(currentScreen === 'home' ||
        currentScreen === 'transitioning_home' ||
        currentScreen === 'cart' ||
        currentScreen === 'payment' ||
        currentScreen === 'order_confirmation') && (
        <Image
          source={require('../assets/images/app_mandala_bg.jpg')}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
        />
      )}

      {/* SCREEN 6: Order Confirmation & Live Tracking */}
      {currentScreen === 'order_confirmation' && (
        <Animated.View style={[StyleSheet.absoluteFill, trackingAnimatedStyle]}>
          <OrderConfirmationScreen onNavigateHome={() => navigateTo('home')} />
        </Animated.View>
      )}

      {/* SCREEN 5: Payment Screen */}
      {currentScreen === 'payment' && (
        <Animated.View style={[StyleSheet.absoluteFill, paymentAnimatedStyle]}>
          <PaymentScreen
            onNavigateBack={() => navigateTo('cart')}
            onPaymentSuccess={() => navigateTo('order_confirmation')}
          />
        </Animated.View>
      )}

      {/* SCREEN 4: Cart Details Screen */}
      {currentScreen === 'cart' && (
        <Animated.View style={[StyleSheet.absoluteFill, cartAnimatedStyle]}>
          <CartScreen
            onNavigateBack={() => navigateTo('home')}
            onProceedToPayment={() => navigateTo('payment')}
          />
        </Animated.View>
      )}

      {/* SCREEN 3: Main Home / Marketplace Screen */}
      {(currentScreen === 'transitioning_home' || currentScreen === 'home') && (
        <Animated.View style={[StyleSheet.absoluteFill, homeAnimatedStyle]}>
          <HomeScreen
            onNavigateToCart={() => navigateTo('cart')}
            onNavigateToOrders={() => {
              if (activeOrder) {
                navigateTo('order_confirmation');
              } else {
                navigateTo('cart');
              }
            }}
          />
        </Animated.View>
      )}

      {/* COMING SOON TO YOUR STATION (Non-NZM Stations) */}
      {currentScreen === 'station_coming_soon' && (
        <Animated.View style={[StyleSheet.absoluteFill, comingSoonAnimatedStyle]}>
          <StationComingSoonScreen
            record={activePnrRecord}
            onNavigateBack={() => navigateTo('pnr_verification')}
            onSwitchToNzm={() => navigateTo('home')}
          />
        </Animated.View>
      )}

      {/* PNR VERIFICATION SCREEN (Immediately after Google Auth) */}
      {currentScreen === 'pnr_verification' && (
        <Animated.View style={[StyleSheet.absoluteFill, pnrAnimatedStyle]}>
          <PnrVerificationScreen
            onContinueToMarketplace={() => navigateTo('home')}
            onStationComingSoon={(record) => {
              setActivePnrRecord(record);
              navigateTo('station_coming_soon');
            }}
          />
        </Animated.View>
      )}

      {/* SCREEN 2: Welcome / Sign-in Onboarding Screen */}
      {(currentScreen === 'transitioning_welcome' ||
        currentScreen === 'welcome' ||
        currentScreen === 'transitioning_home') && (
        <Animated.View style={[StyleSheet.absoluteFill, welcomeAnimatedStyle]}>
          <WelcomeScreen onSignInSuccess={handleSignInSuccess} />
        </Animated.View>
      )}

      {/* SCREEN 1: First Animated Splash Screen */}
      {currentScreen === 'splash' || currentScreen === 'transitioning_welcome' ? (
        <Animated.View style={[StyleSheet.absoluteFill, splashAnimatedStyle]}>
          <SplashScreen onSplashFinished={handleSplashFinished} />
        </Animated.View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF5EA',
  },
});

export default AppNavigator;

