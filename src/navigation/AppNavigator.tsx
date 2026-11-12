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
import OrdersScreen from '../screens/OrdersScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SearchScreen from '../screens/SearchScreen';
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
  | 'search'
  | 'cart'
  | 'payment'
  | 'orders'
  | 'profile'
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

  const searchOpacity = useSharedValue(0);
  const searchTranslateY = useSharedValue(20);

  const cartOpacity = useSharedValue(0);
  const cartTranslateX = useSharedValue(40);

  const paymentOpacity = useSharedValue(0);
  const paymentTranslateX = useSharedValue(40);

  const ordersOpacity = useSharedValue(0);
  const ordersTranslateX = useSharedValue(30);

  const profileOpacity = useSharedValue(0);
  const profileTranslateX = useSharedValue(30);

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
    } else if (target === 'search') {
      searchOpacity.value = 0;
      searchTranslateY.value = 20;
      setCurrentScreen('search');
      searchOpacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) });
      searchTranslateY.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) });
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
    } else if (target === 'orders') {
      ordersOpacity.value = 0;
      ordersTranslateX.value = 30;
      setCurrentScreen('orders');
      ordersOpacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) });
      ordersTranslateX.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) });
    } else if (target === 'profile') {
      profileOpacity.value = 0;
      profileTranslateX.value = 30;
      setCurrentScreen('profile');
      profileOpacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) });
      profileTranslateX.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) });
    } else if (target === 'order_confirmation') {
      trackingOpacity.value = 0;
      trackingTranslateY.value = 25;
      setCurrentScreen('order_confirmation');
      trackingOpacity.value = withTiming(1, { duration: 350, easing: Easing.out(Easing.cubic) });
      trackingTranslateY.value = withTiming(0, { duration: 350, easing: Easing.out(Easing.cubic) });
    }
  };

  useEffect(() => {
    let hasReturnedFromOAuth = false;
    if (typeof window !== 'undefined') {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const orderIdParam = searchParams.get('order_id');
        if (orderIdParam) {
          // Returning from PhonePe gateway redirect
          setCurrentScreen('order_confirmation');
          return;
        }

        const token = searchParams.get('token');
        if (token) {
          hasReturnedFromOAuth = true;
          localStorage.setItem('railquick_token', token);
          localStorage.setItem('access_token', token);

          const name = searchParams.get('name');
          const email = searchParams.get('email');
          const avatarUrl = searchParams.get('avatar_url') || searchParams.get('picture');
          const phone = searchParams.get('phone') || searchParams.get('phone_number');
          if (name) localStorage.setItem('railquick_user_name', name);
          if (email) localStorage.setItem('railquick_user_email', email);
          if (avatarUrl) localStorage.setItem('railquick_user_avatar', avatarUrl);
          if (phone) localStorage.setItem('railquick_user_phone', phone);

          // Clean URL parameters cleanly without refreshing the page
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } catch (err) {
        console.warn('OAuth URL parameter parse warning:', err);
      }
    }

    const tokenExists =
      hasReturnedFromOAuth ||
      (typeof window !== 'undefined' &&
        Boolean(localStorage.getItem('railquick_token') || localStorage.getItem('access_token')));

    // If already authenticated or returning from Google sign-in, transition directly to Home
    const transitionDelay = hasReturnedFromOAuth ? 800 : 3800;
    const timer = setTimeout(() => {
      if (tokenExists) {
        setCurrentScreen('transitioning_home');
        splashOpacity.value = withTiming(0, {
          duration: 400,
          easing: Easing.in(Easing.cubic),
        });
        homeTranslateY.value = withTiming(0, {
          duration: 450,
          easing: Easing.out(Easing.cubic),
        });
        homeOpacity.value = withTiming(
          1,
          {
            duration: 450,
            easing: Easing.out(Easing.cubic),
          },
          (finished) => {
            if (finished) {
              runOnJS(setCurrentScreen)('home');
            }
          }
        );
      } else {
        handleSplashFinished();
      }
    }, transitionDelay);

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

  const searchAnimatedStyle = useAnimatedStyle(() => ({
    opacity: searchOpacity.value,
    transform: [{ translateY: searchTranslateY.value }],
  }));

  const cartAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cartOpacity.value,
    transform: [{ translateX: cartTranslateX.value }],
  }));

  const paymentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: paymentOpacity.value,
    transform: [{ translateX: paymentTranslateX.value }],
  }));

  const ordersAnimatedStyle = useAnimatedStyle(() => ({
    opacity: ordersOpacity.value,
    transform: [{ translateX: ordersTranslateX.value }],
  }));

  const profileAnimatedStyle = useAnimatedStyle(() => ({
    opacity: profileOpacity.value,
    transform: [{ translateX: profileTranslateX.value }],
  }));

  const trackingAnimatedStyle = useAnimatedStyle(() => ({
    opacity: trackingOpacity.value,
    transform: [{ translateY: trackingTranslateY.value }],
  }));

  const handleSignOut = () => {
    welcomeOpacity.value = 0;
    welcomeTranslateY.value = 25;
    setCurrentScreen('welcome');
    welcomeOpacity.value = withTiming(1, { duration: 350, easing: Easing.out(Easing.cubic) });
    welcomeTranslateY.value = withTiming(0, { duration: 350, easing: Easing.out(Easing.cubic) });
  };

  return (
    <View style={styles.container}>
      {/* GLOBAL POST-AUTH MANDALA BACKGROUND (Applied across screens after Google Auth) */}
      {(currentScreen === 'home' ||
        currentScreen === 'transitioning_home' ||
        currentScreen === 'search' ||
        currentScreen === 'cart' ||
        currentScreen === 'payment' ||
        currentScreen === 'orders' ||
        currentScreen === 'profile' ||
        currentScreen === 'order_confirmation') && (
        <Image
          source={require('../assets/images/app_mandala_bg.jpg')}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
        />
      )}

      {/* SCREEN: User Profile */}
      {currentScreen === 'profile' && (
        <Animated.View style={[StyleSheet.absoluteFill, profileAnimatedStyle]}>
          <ProfileScreen
            onNavigateBack={() => navigateTo('home')}
            onNavigateToOrders={() => navigateTo('orders')}
            onNavigateToCart={() => navigateTo('cart')}
            onSignOut={handleSignOut}
          />
        </Animated.View>
      )}

      {/* SCREEN 6: Order Confirmation & Live Tracking */}
      {currentScreen === 'order_confirmation' && (
        <Animated.View style={[StyleSheet.absoluteFill, trackingAnimatedStyle]}>
          <OrderConfirmationScreen onNavigateHome={() => navigateTo('home')} />
        </Animated.View>
      )}

      {/* SCREEN: Orders List (Running + Past Orders with Full Details & Reorder) */}
      {currentScreen === 'orders' && (
        <Animated.View style={[StyleSheet.absoluteFill, ordersAnimatedStyle]}>
          <OrdersScreen
            onNavigateBack={() => navigateTo('home')}
            onNavigateToCart={() => navigateTo('cart')}
            onNavigateToTracking={(order) => navigateTo('order_confirmation')}
          />
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

      {/* SCREEN: Dedicated Search Screen */}
      {currentScreen === 'search' && (
        <Animated.View style={[StyleSheet.absoluteFill, searchAnimatedStyle]}>
          <SearchScreen
            onNavigateBack={() => navigateTo('home')}
            onNavigateToCart={() => navigateTo('cart')}
          />
        </Animated.View>
      )}

      {/* SCREEN 3: Main Home / Marketplace Screen */}
      {(currentScreen === 'transitioning_home' || currentScreen === 'home') && (
        <Animated.View style={[StyleSheet.absoluteFill, homeAnimatedStyle]}>
          <HomeScreen
            onNavigateToCart={() => navigateTo('cart')}
            onNavigateToOrders={() => navigateTo('orders')}
            onNavigateToProfile={() => navigateTo('profile')}
            onNavigateToSearch={() => navigateTo('search')}
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
