import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Zap,
  Moon,
  Sparkles,
  Lock,
  Plus,
  Minus,
} from 'lucide-react-native';
import { useCart } from '../../context/CartContext';

interface SpotlightItem {
  id: string;
  gradientColors: [string, string, ...string[]];
  pillTag: string;
  pillIcon: 'zap' | 'moon' | 'sparkles' | 'lock';
  title: string;
  description: string;
  price: number;
  mrp: number;
  discount: string;
  accentColor: string;
}

const SPOTLIGHT_ITEMS: SpotlightItem[] = [
  {
    id: 'prod-spotlight-gan',
    gradientColors: ['#F43F5E', '#E11D48', '#BE123C'],
    pillTag: '65W GAN POWER • 5 MIN DROP',
    pillIcon: 'zap',
    title: 'Never Run Out of Juice',
    description:
      '"Zero battery anxiety on the rails — 65W GaN Fast Charging on the go."',
    price: 899,
    mrp: 1799,
    discount: '50% OFF',
    accentColor: '#BE123C',
  },
  {
    id: 'prod-spotlight-sleep',
    gradientColors: ['#818CF8', '#6366F1', '#4338CA'],
    pillTag: 'SLEEP CARE • ZERO LIGHT',
    pillIcon: 'moon',
    title: 'Journey Sleep Comfort',
    description:
      '"Arrive fresh & well-rested — 3D memory foam eye mask, neck pillow & earplugs."',
    price: 249,
    mrp: 599,
    discount: '58% OFF',
    accentColor: '#4338CA',
  },
  {
    id: 'prod-spotlight-hygiene',
    gradientColors: ['#14B8A6', '#0D9488', '#115E59'],
    pillTag: 'WASHROOM HYGIENE • FLUSHABLE',
    pillIcon: 'sparkles',
    title: 'Clean Restroom Kit',
    description:
      '"Sanitized travel washrooms — 10x seat covers, pocket sanitizer & paper soaps."',
    price: 159,
    mrp: 349,
    discount: '54% OFF',
    accentColor: '#0F766E',
  },
  {
    id: 'prod-spotlight-lock',
    gradientColors: ['#FB923C', '#EA580C', '#9A3412'],
    pillTag: 'BERTH SECURITY • HEAVY DUTY',
    pillIcon: 'lock',
    title: 'Luggage Safety Cable Lock',
    description:
      '"Sleep peacefully — heavy-duty steel wire lock for berths & luggage racks."',
    price: 199,
    mrp: 499,
    discount: '60% OFF',
    accentColor: '#9A3412',
  },
];

interface RailQuickSpotlightCarouselProps {
  onProductPress?: (productId: string) => void;
}

export const RailQuickSpotlightCarousel: React.FC<
  RailQuickSpotlightCarouselProps
> = ({ onProductPress }) => {
  const { getItemQuantity, addToCart, removeFromCart } = useCart();

  const renderPillIcon = (type: SpotlightItem['pillIcon']) => {
    switch (type) {
      case 'zap':
        return <Zap size={11} color="#FDE047" fill="#FDE047" />;
      case 'moon':
        return <Moon size={11} color="#FDE047" fill="#FDE047" />;
      case 'sparkles':
        return <Sparkles size={11} color="#FDE047" />;
      case 'lock':
        return <Lock size={11} color="#FDE047" />;
      default:
        return <Zap size={11} color="#FDE047" fill="#FDE047" />;
    }
  };

  return (
    <View style={styles.container}>
      {/* SECTION HEADER */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Zap size={20} color="#F59E0B" fill="#F59E0B" />
          <Text style={styles.headerTitle}>RailQuick Spotlight</Text>
        </View>

        <View style={styles.flashOffersBadge}>
          <Text style={styles.flashOffersText}>FLASH OFFERS</Text>
        </View>
      </View>

      {/* HORIZONTAL SLIDABLE CARDS */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={312}
      >
        {SPOTLIGHT_ITEMS.map((item) => {
          const qty = getItemQuantity(item.id);

          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.92}
              onPress={() => onProductPress?.(item.id)}
              style={styles.cardContainer}
            >
              <LinearGradient
                colors={item.gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardGradient}
              >
                {/* Top Category / Benefit Pill */}
                <View style={styles.pillContainer}>
                  <View style={styles.pillTag}>
                    {renderPillIcon(item.pillIcon)}
                    <Text style={styles.pillText}>{item.pillTag}</Text>
                  </View>
                </View>

                {/* Card Title & Subtitle */}
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardSubtitle}>{item.description}</Text>

                {/* Bottom Row: RailQuick Logo Box, Price Breakdown, and ADD Button */}
                <View style={styles.bottomRow}>
                  {/* Left: RailQuick Logo Box & Price */}
                  <View style={styles.productInfoLeft}>
                    {/* RailQuick Logo image inside white card instead of symbol */}
                    <View style={styles.iconBox}>
                      <Image
                        source={require('../../assets/images/railquick_logo.png')}
                        style={styles.logoImage}
                        contentFit="contain"
                      />
                    </View>

                    <View style={styles.priceContainer}>
                      <View style={styles.priceNumberRow}>
                        <Text style={styles.priceText}>₹{item.price}</Text>
                        <Text style={styles.mrpText}>₹{item.mrp}</Text>
                      </View>
                      <Text style={styles.discountText}>{item.discount}</Text>
                    </View>
                  </View>

                  {/* Right: Working ADD / Stepper Button */}
                  <View style={styles.actionContainer}>
                    {qty === 0 ? (
                      <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={(e) => {
                          e.stopPropagation?.();
                          addToCart(item.id);
                        }}
                        style={styles.addButton}
                      >
                        <Text
                          style={[
                            styles.addButtonText,
                            { color: item.accentColor },
                          ]}
                        >
                          ADD
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.stepperContainer}>
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={(e) => {
                            e.stopPropagation?.();
                            removeFromCart(item.id);
                          }}
                          style={styles.stepperBtn}
                        >
                          <Minus size={13} color={item.accentColor} strokeWidth={3} />
                        </TouchableOpacity>

                        <Text style={[styles.stepperQty, { color: item.accentColor }]}>
                          {qty}
                        </Text>

                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={(e) => {
                            e.stopPropagation?.();
                            addToCart(item.id);
                          }}
                          style={styles.stepperBtn}
                        >
                          <Plus size={13} color={item.accentColor} strokeWidth={3} />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 18,
    marginBottom: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  flashOffersBadge: {
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FDA4AF',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 3.5,
  },
  flashOffersText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#E11D48',
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingHorizontal: 14,
    gap: 12,
  },
  cardContainer: {
    width: 300,
    borderRadius: 22,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 4,
  },
  cardGradient: {
    borderRadius: 22,
    padding: 16,
    minHeight: 180,
    justifyContent: 'space-between',
  },
  pillContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  pillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 20,
  },
  pillText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.92)',
    lineHeight: 16,
    marginBottom: 14,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  productInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconBox: {
    width: 60,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#FFFFFF', // Clean white background for RailQuick logo
    paddingHorizontal: 5,
    paddingVertical: 3,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  priceContainer: {
    justifyContent: 'center',
  },
  priceNumberRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  mrpText: {
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.72)',
    textDecorationLine: 'line-through',
  },
  discountText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FDE047',
    marginTop: 1,
  },
  actionContainer: {
    alignItems: 'flex-end',
  },
  addButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 6,
    paddingVertical: 4,
    gap: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  stepperBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperQty: {
    fontSize: 13,
    fontWeight: '900',
    minWidth: 14,
    textAlign: 'center',
  },
});

export default RailQuickSpotlightCarousel;
