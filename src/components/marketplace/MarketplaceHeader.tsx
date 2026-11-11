import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Dimensions,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import {
  Search,
  Mic,
  Zap,
  User,
  ShoppingBag,
  ShoppingBasket,
  ChevronDown,
  LayoutGrid,
  Headphones,
  Smartphone,
  Sparkles,
  HandMetal,
  Baby,
  Moon,
  Luggage,
  Cross,
  Gift,
  Lock,
  Train,
  X,
  Check,
  MapPin,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react-native';
import RailQuickLogoSvg from '../../assets/svg/RailQuickLogoSvg';
import {
  JOURNEY_DETAILS,
  CATEGORIES,
  PRODUCTS,
  ProductItem,
} from '../../data/marketplaceData';
import { useJourney } from '../../context/JourneyContext';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface HeaderCollectionCard {
  id: string;
  title: string;
  productId: string;
  image: any;
}

const HEADER_COLLECTION_CARDS: HeaderCollectionCard[] = [
  {
    id: 'hcard-sister',
    title: 'Gifts for Sister',
    productId: 'prod-pads',
    image: require('../../assets/cards_blinkit/card_sister.png'),
  },
  {
    id: 'hcard-brother',
    title: 'Gifts for Brother',
    productId: 'prod-earphones',
    image: require('../../assets/cards_blinkit/card_brother.png'),
  },
  {
    id: 'hcard-kids',
    title: 'Gifts for Kids',
    productId: 'prod-babywipes',
    image: require('../../assets/cards_blinkit/card_kids.png'),
  },
  {
    id: 'hcard-sweets',
    title: 'Indian Sweets',
    productId: 'prod-silk',
    image: require('../../assets/cards_blinkit/card_sweets.png'),
  },
  {
    id: 'hcard-dryfruits',
    title: 'Dry Fruits',
    productId: 'prod-granola',
    image: require('../../assets/cards_blinkit/card_dryfruits.png'),
  },
  {
    id: 'hcard-chocolates',
    title: 'Chocolates & Hampers',
    productId: 'prod-coke',
    image: require('../../assets/cards_blinkit/card_chocolates.png'),
  },
];

const SEARCH_SUGGESTIONS = [
  'USB-C fast cable',
  'Chips & Kurkure',
  'Cipla ORS sachet',
  'Comfort neck pillow',
  'Discreet hygiene kit',
  'Pure water baby wipes',
  '65W GaN power bank',
  'Cold Coke & water',
];

interface MarketplaceHeaderProps {
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  onSearchPress?: () => void;
  onProfilePress?: () => void;
  onJourneyDetailsPress?: () => void;
  onCartPress?: () => void;
  onProductPress?: (product: ProductItem) => void;
}

export const MarketplaceHeader: React.FC<MarketplaceHeaderProps> = ({
  selectedCategory,
  onSelectCategory,
  onSearchPress,
  onProfilePress,
  onJourneyDetailsPress,
  onCartPress,
  onProductPress,
}) => {
  const insets = useSafeAreaInsets();
  const [isJourneyModalVisible, setIsJourneyModalVisible] = useState(false);

  // Cart item count & total price
  let cartCount = 0;
  let cartTotal = 0;
  try {
    const cartCtx = useCart();
    if (cartCtx?.totalCount) {
      cartCount = cartCtx.totalCount;
      cartTotal = cartCtx.totalPrice || 0;
    }
  } catch {
    // Fallback
  }

  // Dynamic journey context with fallback
  let journey = JOURNEY_DETAILS;
  try {
    const journeyCtx = useJourney();
    if (journeyCtx?.journey) {
      journey = journeyCtx.journey;
    }
  } catch {
    // Fallback if rendered outside provider
  }

  // Real user profile from AuthContext (auth.py)
  let user: any = null;
  try {
    const authCtx = useAuth();
    if (authCtx?.user) {
      user = authCtx.user;
    }
  } catch {
    // Fallback
  }

  // ================= CHARACTER-BY-CHARACTER TYPEWRITER ANIMATION =================
  const [typedText, setTypedText] = useState('');
  const [termIdx, setTermIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = SEARCH_SUGGESTIONS[termIdx];
    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting) {
      if (typedText.length < currentWord.length) {
        timeout = setTimeout(() => {
          setTypedText(currentWord.slice(0, typedText.length + 1));
        }, 70);
      } else {
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, 1700);
      }
    } else {
      if (typedText.length > 0) {
        timeout = setTimeout(() => {
          setTypedText(currentWord.slice(0, typedText.length - 1));
        }, 30);
      } else {
        timeout = setTimeout(() => {
          setIsDeleting(false);
          setTermIdx((prev) => (prev + 1) % SEARCH_SUGGESTIONS.length);
        }, 220);
      }
    }

    return () => clearTimeout(timeout);
  }, [typedText, isDeleting, termIdx]);

  // Blinking cursor animation
  const cursorOpacity = useSharedValue(1);
  useEffect(() => {
    cursorOpacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 450 }),
        withTiming(1, { duration: 450 })
      ),
      -1,
      true
    );
  }, []);

  const cursorStyle = useAnimatedStyle(() => ({
    opacity: cursorOpacity.value,
  }));

  const handleOpenJourneyModal = () => {
    setIsJourneyModalVisible(true);
    onJourneyDetailsPress?.();
  };

  // Category Icon mapper matching Reference Image 2's clean minimalist outline style
  const renderNavIcon = (catId: string, isSelected: boolean) => {
    const size = 22;
    const color = isSelected ? '#342D29' : '#79665B';
    const strokeWidth = isSelected ? 2.3 : 1.9;

    switch (catId) {
      case 'all':
        return <ShoppingBasket size={size} color={color} strokeWidth={strokeWidth} />;
      case 'mobile':
        return <Headphones size={size} color={color} strokeWidth={strokeWidth} />;
      case 'women-hygiene':
        return <Sparkles size={size} color={color} strokeWidth={strokeWidth} />;
      case 'personal-hygiene':
        return <HandMetal size={size} color={color} strokeWidth={strokeWidth} />;
      case 'travel-essentials':
        return <Gift size={size} color={color} strokeWidth={strokeWidth} />;
      case 'first-aid':
        return <Cross size={size} color={color} strokeWidth={strokeWidth} />;
      case 'sleep-comfort':
        return <Moon size={size} color={color} strokeWidth={strokeWidth} />;
      case 'baby':
        return <Baby size={size} color={color} strokeWidth={strokeWidth} />;
      case 'travel-accessories':
        return <Lock size={size} color={color} strokeWidth={strokeWidth} />;
      default:
        return <ShoppingBag size={size} color={color} strokeWidth={strokeWidth} />;
    }
  };

  return (
    <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 8) }]}>
      {/* SEAMLESS WARM APRICOT-PEACH GRADIENT (EXACTLY MATCHING BANNER THEME) */}
      <LinearGradient
        colors={['#FED8C5', '#FFDDC4', '#FFE2C2', '#FFF0E2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[StyleSheet.absoluteFill, styles.headerBgImage]}
      />

      {/* ================= 1. TOP HEADER SECTION (MATCHING BLINKIT IN REFERENCE IMAGE 2) ================= */}
      <View style={styles.topBarRow}>
        {/* Left: Brand name, Train name with Surge/Delivery badge, Coach & Seat */}
        <TouchableOpacity
          activeOpacity={0.78}
          onPress={handleOpenJourneyModal}
          style={styles.trainSeatDirect}
        >
          {/* Small Brand Label */}
          <Text style={styles.brandSmallText}>RailQuick.in</Text>

          {/* Large Bold Title Row with Delivery Badge & Chevron */}
          <View style={styles.trainTitleRow}>
            <Text style={styles.trainTitleBold} numberOfLines={1}>
              {journey.trainName.includes('•')
                ? journey.trainName.split('•')[1].trim()
                : journey.trainName}
            </Text>
            <ChevronDown size={18} color="#342D29" strokeWidth={2.6} style={styles.chevronInline} />

            {/* In-Berth Delivery Badge (Matches Blinkit's Surge Applicable pill) */}
            <View style={styles.deliveryBadge}>
              <View style={styles.deliveryBadgeDot} />
              <Text style={styles.deliveryBadgeText}>In-Berth Drop</Text>
            </View>
          </View>

          {/* Location / Berth line: e.g. Coach B2 / Seat 36 (LB) ▾ */}
          <View style={styles.seatRow}>
            <Text style={styles.seatDetailsSmall} numberOfLines={1}>
              Coach {journey.coach} / Seat {journey.berth} ({journey.berthType.includes('Lower') ? 'LB' : journey.berthType.includes('Upper') ? 'UB' : 'MB'})
            </Text>
            <ChevronDown size={14} color="#79665B" strokeWidth={2.2} />
          </View>
        </TouchableOpacity>

        {/* Right Controls: Profile Avatar (Cart box removed as requested) */}
        <View style={styles.topRightControls}>
          <TouchableOpacity
            style={styles.profileButton}
            activeOpacity={0.82}
            onPress={onProfilePress}
          >
            {user?.avatarUrl ? (
              <Image
                source={{ uri: user.avatarUrl }}
                style={styles.headerAvatarImg}
                contentFit="cover"
              />
            ) : user?.name ? (
              <Text style={styles.headerAvatarInitial}>
                {user.name.charAt(0).toUpperCase()}
              </Text>
            ) : (
              <User size={18} color="#342D29" strokeWidth={2.3} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ================= 2. SEARCH BAR SECTION (PROMINENT WHITE ROUNDED BAR) ================= */}
      <View style={styles.searchSectionRow}>
        <TouchableOpacity
          activeOpacity={0.92}
          style={styles.searchBar}
          onPress={onSearchPress}
        >
          {/* Dark Charcoal / Brown Search Icon */}
          <Search size={20} color="#342D29" style={styles.searchIcon} strokeWidth={2.4} />

          {/* Typewriter animated query */}
          <View style={styles.searchContent}>
            <Text style={styles.searchPlaceholderPrefix}>Search </Text>
            <Text style={styles.searchPlaceholderQuery} numberOfLines={1}>
              "{typedText}"
            </Text>
            <Animated.View style={[styles.cursor, cursorStyle]} />
          </View>

          {/* Audio Visualizer Equalizer / Mic Container on right (Matches Reference Image 2) */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={onSearchPress}
            style={styles.soundWaveContainer}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <View style={styles.equalizerBarsRow}>
              <View style={[styles.eqBar, { height: 10 }]} />
              <View style={[styles.eqBar, { height: 16 }]} />
              <View style={[styles.eqBar, { height: 20 }]} />
              <View style={[styles.eqBar, { height: 13 }]} />
              <View style={[styles.eqBar, { height: 8 }]} />
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </View>

      {/* ================= 3. CATEGORY NAVIGATION (HORIZONTAL ICON + TEXT ROW MATCHING IMAGE 2) ================= */}
      <View style={styles.categoryNavSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryNavContent}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;

            return (
              <TouchableOpacity
                key={cat.id}
                activeOpacity={0.75}
                onPress={() => onSelectCategory(cat.id)}
                style={styles.categoryNavItem}
              >
                {/* Minimalist Outlined Icon */}
                <View style={styles.categoryIconWrap}>
                  {renderNavIcon(cat.id, isSelected)}
                </View>

                {/* Category Label */}
                <Text
                  style={[
                    styles.categoryNavLabel,
                    isSelected && styles.categoryNavLabelActive,
                  ]}
                  numberOfLines={1}
                >
                  {cat.name}
                </Text>

                {/* Subtle Active Indicator Underline (Matches Blinkit Underline in Image 2) */}
                {isSelected ? (
                  <View style={styles.categoryActiveUnderline} />
                ) : (
                  <View style={styles.categoryUnderlineSpacer} />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ================= POPUP MODAL: FULL JOURNEY & PNR DETAILS ================= */}
      <Modal
        visible={isJourneyModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsJourneyModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsJourneyModalVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalCard}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <View style={styles.modalTrainIcon}>
                  <Train size={18} color="#0F6C38" strokeWidth={2.4} />
                </View>
                <View>
                  <Text style={styles.modalTitle}>Journey & Berth Details</Text>
                  <Text style={styles.modalSub}>IRCTC Live In-Berth Delivery</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setIsJourneyModalVisible(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <X size={18} color="#342D29" />
              </TouchableOpacity>
            </View>

            {/* PNR Banner */}
            <View style={styles.modalPnrBanner}>
              <View>
                <Text style={styles.pnrBannerLabel}>BOOKING PNR</Text>
                <Text style={styles.pnrBannerVal}>{journey.pnr}</Text>
              </View>
              <View style={styles.pnrStatusPill}>
                <Check size={12} color="#0F6C38" strokeWidth={3} />
                <Text style={styles.pnrStatusText}>CONFIRMED</Text>
              </View>
            </View>

            {/* Train & Berth Grid */}
            <View style={styles.modalInfoGrid}>
              <View style={styles.modalInfoCell}>
                <Text style={styles.modalCellLabel}>TRAIN</Text>
                <Text style={styles.modalCellVal} numberOfLines={1}>
                  {journey.trainName}
                </Text>
              </View>

              <View style={styles.modalInfoCell}>
                <Text style={styles.modalCellLabel}>COACH & BERTH</Text>
                <Text style={styles.modalCellVal}>
                  Coach {journey.coach} • Seat {journey.berth}
                </Text>
                <Text style={styles.modalCellSub}>{journey.berthType}</Text>
              </View>

              <View style={styles.modalInfoCell}>
                <Text style={styles.modalCellLabel}>PASSENGER</Text>
                <Text style={styles.modalCellVal}>
                  {user?.name || journey.passengerName}
                </Text>
                <Text style={styles.modalCellSub}>
                  {user?.phone || journey.passengerPhone}
                </Text>
              </View>

              <View style={styles.modalInfoCell}>
                <Text style={styles.modalCellLabel}>NEXT HALT</Text>
                <Text style={styles.modalCellVal}>{journey.station}</Text>
                <Text style={styles.modalCellSub}>
                  Halt Window: {journey.haltMinutes} minutes
                </Text>
              </View>
            </View>

            {/* Delivery Guarantee Notice */}
            <View style={styles.modalGuaranteeBox}>
              <ShieldCheck size={16} color="#0F6C38" />
              <Text style={styles.modalGuaranteeText}>
                RailQuick delivery runner arrives directly at your coach door within the first 5 minutes of train halt.
              </Text>
            </View>

            {/* Close Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.modalCloseButton}
              onPress={() => setIsJourneyModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// Calculate 3-column card dimensions
const HORIZONTAL_PADDING = 14;
const CARD_GAP = 10;
const THREE_COL_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - CARD_GAP * 2) / 3;

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#FED8C5',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    borderBottomWidth: 1,
    borderBottomColor: '#F5BEA4',
    shadowColor: '#8C3D1E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
    zIndex: 50,
    overflow: 'hidden',
    paddingBottom: 4,
  },
  headerBgImage: {
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },

  // ---- 1. Top Bar: Train / Seat (Left) + Wallet / Profile (Right) ----
  topBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 2,
    paddingBottom: 6,
  },
  trainSeatDirect: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingRight: 8,
  },
  brandSmallText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#342D29',
    letterSpacing: 0.1,
    marginBottom: 1,
  },
  trainTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  trainTitleBold: {
    fontSize: 20,
    fontWeight: '900',
    color: '#342D29',
    letterSpacing: -0.4,
  },
  chevronInline: {
    marginTop: 2,
  },
  deliveryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E7F8EE',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 4,
  },
  deliveryBadgeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#0F6C38',
  },
  deliveryBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#0F6C38',
    letterSpacing: 0.1,
  },
  seatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  seatDetailsSmall: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#79665B',
    letterSpacing: 0.1,
  },

  // Right Controls
  topRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cartPillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#EFC1A8',
    borderRadius: 20,
    paddingHorizontal: 10,
    height: 38,
    gap: 5,
    shadowColor: '#8C3D1E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  cartPillText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#342D29',
  },
  cartCountDot: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#0F6C38',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  cartCountDotText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  profileButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#EFC1A8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8C3D1E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  headerAvatarImg: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  headerAvatarInitial: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F6C38',
  },

  // ---- 2. Search Section: Prominent White Rounded Bar ----
  searchSectionRow: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 6,
    paddingBottom: 6,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingLeft: 14,
    paddingRight: 6,
    height: 50,
    shadowColor: '#8C3D1E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2.5,
  },
  searchIcon: {
    marginRight: 9,
  },
  searchContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchPlaceholderPrefix: {
    fontSize: 14,
    color: '#79665B',
    fontWeight: '500',
  },
  searchPlaceholderQuery: {
    fontSize: 14,
    color: '#342D29',
    fontWeight: '700',
  },
  cursor: {
    width: 2,
    height: 16,
    backgroundColor: '#0F6C38',
    marginLeft: 3,
  },
  soundWaveContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  equalizerBarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2.5,
  },
  eqBar: {
    width: 2.4,
    borderRadius: 1.5,
    backgroundColor: '#0F6C38',
  },

  // ---- 3. Category Navigation (Clean Minimalist Outlines + Names Underneath) ----
  categoryNavSection: {
    paddingTop: 6,
    paddingBottom: 4,
  },
  categoryNavContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  categoryNavItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  categoryIconWrap: {
    width: 34,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryNavLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#342D29',
    letterSpacing: -0.1,
    marginTop: 2,
  },
  categoryNavLabelActive: {
    color: '#342D29',
    fontWeight: '800',
  },
  categoryActiveUnderline: {
    width: 22,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: '#342D29',
    marginTop: 4,
  },
  categoryUnderlineSpacer: {
    width: 22,
    height: 3.5,
    marginTop: 4,
  },

  // ---- 4. Edge-to-Edge Promotional Banner (No Box, From One Edge To Another) ----
  edgeBannerContainer: {
    width: '100%',
    marginVertical: 8,
    backgroundColor: 'transparent',
  },
  edgeBannerImage: {
    width: '100%',
    aspectRatio: 1024 / 224,
  },

  // ---- 5. The 6 Category Cards (Core 3-Column Grid) ----
  sixCardsSection: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 2,
  },
  sixCardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
    justifyContent: 'space-between',
  },
  sixCardContainer: {
    width: THREE_COL_WIDTH,
    height: THREE_COL_WIDTH * 1.04,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#8C3D1E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    backgroundColor: '#F5B69F',
  },
  sixCardFullImage: {
    width: '100%',
    height: '100%',
  },

  scrollableHeroContainer: {
    paddingTop: 4,
    paddingBottom: 6,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalTrainIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#E7F8EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#342D29',
  },
  modalSub: {
    fontSize: 11.5,
    color: '#79665B',
    marginTop: 1,
  },
  modalCloseBtn: {
    padding: 6,
  },
  modalPnrBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FDEEE2',
    padding: 12,
    borderRadius: 14,
    marginTop: 14,
  },
  pnrBannerLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#C2410C',
    letterSpacing: 0.5,
  },
  pnrBannerVal: {
    fontSize: 15,
    fontWeight: '900',
    color: '#342D29',
    marginTop: 1,
  },
  pnrStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  pnrStatusText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#0F6C38',
  },
  modalInfoGrid: {
    marginTop: 14,
    gap: 12,
  },
  modalInfoCell: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
  },
  modalCellLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  modalCellVal: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#342D29',
    marginTop: 2,
  },
  modalCellSub: {
    fontSize: 11.5,
    color: '#79665B',
    marginTop: 1,
  },
  modalGuaranteeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 12,
    marginTop: 14,
  },
  modalGuaranteeText: {
    flex: 1,
    fontSize: 11.5,
    color: '#166534',
    lineHeight: 16,
  },
  modalCloseButton: {
    backgroundColor: '#342D29',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 16,
  },
  modalCloseButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});


// ================= SCROLLABLE BANNER & 6 CATEGORY CARDS (SCROLLS UPWARD IN SCROLLVIEW) =================
export interface MarketplaceHeaderScrollableProps {
  onProductPress?: (product: ProductItem) => void;
}

export const MarketplaceHeaderScrollable: React.FC<MarketplaceHeaderScrollableProps> = ({
  onProductPress,
}) => {
  return (
    <View style={styles.scrollableHeroContainer}>
      {/* 1. Edge-to-Edge Station-to-Train Promotional Banner */}
      <View style={styles.edgeBannerContainer}>
        <Image
          source={require('../../assets/images/station_to_train_banner.jpg')}
          style={styles.edgeBannerImage}
          contentFit="cover"
        />
      </View>

      {/* 2. The 6 Category Cards (3-Column Grid) */}
      <View style={styles.sixCardsSection}>
        <View style={styles.sixCardsGrid}>
          {HEADER_COLLECTION_CARDS.map((card) => {
            const product = PRODUCTS.find((p) => p.id === card.productId);

            return (
              <TouchableOpacity
                key={card.id}
                activeOpacity={0.88}
                onPress={() => {
                  if (product) {
                    onProductPress?.(product);
                  }
                }}
                style={styles.sixCardContainer}
              >
                <Image
                  source={card.image}
                  style={styles.sixCardFullImage}
                  contentFit="cover"
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

export default MarketplaceHeader;
