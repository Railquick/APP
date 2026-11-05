import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withRepeat,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import Svg, {
  Defs,
  RadialGradient,
  Stop,
  Rect,
  Circle,
  Ellipse,
} from 'react-native-svg';
import { FEATURED_PRODUCTS, ProductItem } from '../data/products';

interface AnimatedProductShowcaseProps {
  /**
   * Entrance delay in ms before first product begins appearing (default: 500ms)
   */
  startDelay?: number;
  /**
   * Total display duration per product in ms (default: 3400ms)
   */
  cycleDuration?: number;
}

export const AnimatedProductShowcase: React.FC<AnimatedProductShowcaseProps> = ({
  startDelay = 500,
  cycleDuration = 3500,
}) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // Responsive showcase size
  const showcaseWidth = Math.min(screenWidth * 0.82, 320);
  const showcaseHeight = Math.min(screenHeight * 0.28, 235);

  // Active product index in the queue
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentProduct = FEATURED_PRODUCTS[currentIndex];

  // Reanimated shared values for product transitions
  const productOpacity = useSharedValue(0);
  const productScale = useSharedValue(0.65);
  const productTranslateX = useSharedValue(0);
  const productTranslateY = useSharedValue(35);
  const productRotate = useSharedValue(0); // in degrees

  // Subtle continuous floating motion once settled
  const floatTranslateY = useSharedValue(0);

  // Spotlight glow animation
  const glowScale = useSharedValue(0.85);
  const glowOpacity = useSharedValue(0.4);

  // Refs for tracking timer callbacks safely
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Runs the unique entrance animation based on the product's category & style
   */
  const triggerEntranceAnimation = (product: ProductItem) => {
    // Reset initial values based on entrance style
    cancelAnimation(floatTranslateY);
    floatTranslateY.value = 0;

    switch (product.entranceStyle) {
      case 'bounce_rotate':
        // Snacks: Enter with a playful bounce and slight rotation
        productOpacity.value = 0;
        productScale.value = 0.65;
        productTranslateX.value = -20;
        productTranslateY.value = 40;
        productRotate.value = -10;

        productOpacity.value = withTiming(1, { duration: 750, easing: Easing.out(Easing.cubic) });
        productScale.value = withSpring(1, { damping: 9, stiffness: 95 });
        productTranslateX.value = withSpring(0, { damping: 11, stiffness: 90 });
        productTranslateY.value = withSpring(0, { damping: 10, stiffness: 90 });
        productRotate.value = withTiming(0, { duration: 800, easing: Easing.out(Easing.back(1.4)) });
        break;

      case 'slide_side_spring':
        // Electronics: Slide in from right with a smooth spring effect
        productOpacity.value = 0;
        productScale.value = 0.8;
        productTranslateX.value = 55;
        productTranslateY.value = 10;
        productRotate.value = 4;

        productOpacity.value = withTiming(1, { duration: 700 });
        productScale.value = withSpring(1, { damping: 10, stiffness: 100 });
        productTranslateX.value = withSpring(0, { damping: 11, stiffness: 90 });
        productTranslateY.value = withSpring(0, { damping: 11, stiffness: 90 });
        productRotate.value = withTiming(0, { duration: 750 });
        break;

      case 'upward_glow':
        // Healthcare: Enter with subtle upward movement and soft settle
        productOpacity.value = 0;
        productScale.value = 0.72;
        productTranslateX.value = 0;
        productTranslateY.value = 45;
        productRotate.value = 0;

        productOpacity.value = withTiming(1, { duration: 850, easing: Easing.out(Easing.cubic) });
        productScale.value = withTiming(1, { duration: 850, easing: Easing.out(Easing.back(1.1)) });
        productTranslateY.value = withTiming(0, { duration: 850, easing: Easing.out(Easing.cubic) });
        break;

      case 'zoom_fade':
        // Personal Care: Fade in with a gentle zoom
        productOpacity.value = 0;
        productScale.value = 0.6;
        productTranslateX.value = 0;
        productTranslateY.value = 15;
        productRotate.value = -3;

        productOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.quad) });
        productScale.value = withTiming(1, { duration: 850, easing: Easing.out(Easing.cubic) });
        productTranslateY.value = withTiming(0, { duration: 850, easing: Easing.out(Easing.cubic) });
        productRotate.value = withTiming(0, { duration: 800 });
        break;

      case 'slide_up_scale':
      default:
        // Beverage & Daily Essentials: Slide upward with soft scale
        productOpacity.value = 0;
        productScale.value = 0.7;
        productTranslateX.value = 0;
        productTranslateY.value = 50;
        productRotate.value = 0;

        productOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
        productScale.value = withTiming(1, { duration: 850, easing: Easing.out(Easing.back(1.15)) });
        productTranslateY.value = withTiming(0, { duration: 850, easing: Easing.out(Easing.cubic) });
        break;
    }

    // Spotlight glow pulse
    glowScale.value = withSequence(
      withTiming(1.15, { duration: 800, easing: Easing.out(Easing.cubic) }),
      withTiming(1.0, { duration: 700, easing: Easing.inOut(Easing.quad) })
    );
    glowOpacity.value = withTiming(0.65, { duration: 800 });

    // After settling (~850ms), initiate continuous subtle levitation / floating
    setTimeout(() => {
      floatTranslateY.value = withRepeat(
        withSequence(
          withTiming(-4.5, { duration: 1100, easing: Easing.inOut(Easing.sin) }),
          withTiming(4.5, { duration: 1100, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );
    }, 850);
  };

  /**
   * Smooth exit animation before switching to next product
   */
  const triggerExitAnimation = (onExitComplete: () => void) => {
    cancelAnimation(floatTranslateY);
    productOpacity.value = withTiming(0, {
      duration: 450,
      easing: Easing.in(Easing.cubic),
    });
    productScale.value = withTiming(0.75, {
      duration: 450,
      easing: Easing.in(Easing.cubic),
    });
    productTranslateY.value = withTiming(-28, {
      duration: 450,
      easing: Easing.in(Easing.cubic),
    });
    glowOpacity.value = withTiming(0.25, { duration: 450 });

    setTimeout(onExitComplete, 460);
  };

  useEffect(() => {
    let isMounted = true;

    // Start cycle after initial screen delay
    const initialDelayTimer = setTimeout(() => {
      if (!isMounted) return;

      triggerEntranceAnimation(FEATURED_PRODUCTS[0]);

      // Recursive cycle function
      const runCycle = () => {
        timerRef.current = setTimeout(() => {
          if (!isMounted) return;

          // Trigger Exit animation
          triggerExitAnimation(() => {
            if (!isMounted) return;
            // Advance to next product in queue
            setCurrentIndex((prev) => {
              const nextIndex = (prev + 1) % FEATURED_PRODUCTS.length;
              triggerEntranceAnimation(FEATURED_PRODUCTS[nextIndex]);
              return nextIndex;
            });
            // Schedule next cycle
            runCycle();
          });
        }, cycleDuration);
      };

      runCycle();
    }, startDelay);

    return () => {
      isMounted = false;
      clearTimeout(initialDelayTimer);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [cycleDuration, startDelay]);

  // Animated styles for the featured product image
  const animatedProductStyle = useAnimatedStyle(() => {
    return {
      opacity: productOpacity.value,
      transform: [
        { translateX: productTranslateX.value },
        { translateY: productTranslateY.value + floatTranslateY.value },
        { scale: productScale.value },
        { rotate: `${productRotate.value}deg` },
      ],
    };
  });

  // Animated styles for the spotlight glow
  const animatedGlowStyle = useAnimatedStyle(() => {
    return {
      opacity: glowOpacity.value,
      transform: [{ scale: glowScale.value }],
    };
  });

  // Preload next image to guarantee zero image flickers
  const nextProductIndex = (currentIndex + 1) % FEATURED_PRODUCTS.length;
  const nextProduct = FEATURED_PRODUCTS[nextProductIndex];

  return (
    <View style={[styles.container, { width: showcaseWidth, height: showcaseHeight }]}>
      {/* 1. Spotlight Background (Soft Glow & Pedestal) */}
      <Animated.View style={[styles.spotlightContainer, animatedGlowStyle]}>
        <Svg width="220" height="170" viewBox="0 0 220 170">
          <Defs>
            <RadialGradient
              id="productSpotlight"
              cx="50%"
              cy="50%"
              rx="50%"
              ry="45%"
              fx="50%"
              fy="50%"
            >
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
              <Stop offset="45%" stopColor={currentProduct.spotlightColor} stopOpacity="0.32" />
              <Stop offset="100%" stopColor="#087C45" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Ellipse cx="110" cy="85" rx="100" ry="75" fill="url(#productSpotlight)" />
        </Svg>
      </Animated.View>

      {/* 2. Floating Pedestal Shadow */}
      <View style={styles.pedestalShadow} />

      {/* 3. Single Featured Product (Reanimated Entrance/Exit) */}
      <Animated.View style={[styles.productImageWrapper, animatedProductStyle]}>
        <Image
          source={currentProduct.image}
          style={styles.productImage}
          contentFit="contain"
          transition={250}
          priority="high"
          cachePolicy="memory-disk"
        />
      </Animated.View>

      {/* 4. Preload next item in hidden buffer to prevent network/render delay */}
      <View style={styles.hiddenPreloader}>
        <Image
          source={nextProduct.image}
          style={styles.preloadImage}
          contentFit="contain"
          priority="high"
        />
      </View>

      {/* 5. Product Info Pill Chip (Category & Name) */}
      <View style={styles.productInfoPill}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{currentProduct.category}</Text>
        </View>
        <Text style={styles.productNameText} numberOfLines={1}>
          {currentProduct.name}
        </Text>
        <Text style={styles.etaText}>• {currentProduct.deliveryEta}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    marginBottom: 4,
    zIndex: 6,
  },
  spotlightContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  pedestalShadow: {
    position: 'absolute',
    bottom: 22,
    width: 130,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
    transform: [{ scaleY: 0.45 }],
    zIndex: 2,
  },
  productImageWrapper: {
    width: '100%',
    height: '76%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  hiddenPreloader: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
    overflow: 'hidden',
  },
  preloadImage: {
    width: 1,
    height: 1,
  },
  productInfoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.24)',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.42)',
    paddingHorizontal: 12,
    paddingVertical: 5.5,
    borderRadius: 20,
    marginTop: 8,
    zIndex: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    maxWidth: '96%',
  },
  categoryBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 7,
  },
  categoryBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#087C45',
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },
  productNameText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 4,
  },
  etaText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#A7F3D0',
  },
});

export default AnimatedProductShowcase;
