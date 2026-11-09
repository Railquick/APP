import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
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
  ChevronDown,
  LayoutGrid,
  Smartphone,
  Sparkles,
  HandMetal,
  Baby,
  Moon,
  Luggage,
  Cross,
  Lock,
  Train,
  X,
  Check,
  MapPin,
  ShieldCheck,
} from 'lucide-react-native';
import RailQuickLogoSvg from '../../assets/svg/RailQuickLogoSvg';
import {
  JOURNEY_DETAILS,
  CATEGORIES,
} from '../../data/marketplaceData';
import { useJourney } from '../../context/JourneyContext';
import { useAuth } from '../../context/AuthContext';

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
}

export const MarketplaceHeader: React.FC<MarketplaceHeaderProps> = ({
  selectedCategory,
  onSelectCategory,
  onSearchPress,
  onProfilePress,
  onJourneyDetailsPress,
}) => {
  const insets = useSafeAreaInsets();
  const [isJourneyModalVisible, setIsJourneyModalVisible] = useState(false);

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
        }, 70); // Natural character typing cadence
      } else {
        // Full term displayed: pause so user can comfortably read it
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, 1700);
      }
    } else {
      if (typedText.length > 0) {
        timeout = setTimeout(() => {
          setTypedText(currentWord.slice(0, typedText.length - 1));
        }, 30); // Fast deletion
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

  const renderCategoryIcon = (id: string, isSelected: boolean, accentColor?: string) => {
    const size = 16;
    const color = isSelected ? '#FFFFFF' : accentColor || '#475569';
    switch (id) {
      case 'all':
        return <LayoutGrid size={size} color={color} strokeWidth={isSelected ? 2.4 : 1.9} />;
      case 'mobile':
        return <Smartphone size={size} color={color} strokeWidth={isSelected ? 2.4 : 1.9} />;
      case 'women-hygiene':
        return <Sparkles size={size} color={color} strokeWidth={isSelected ? 2.4 : 1.9} />;
      case 'personal-hygiene':
        return <HandMetal size={size} color={color} strokeWidth={isSelected ? 2.4 : 1.9} />;
      case 'baby':
        return <Baby size={size} color={color} strokeWidth={isSelected ? 2.4 : 1.9} />;
      case 'sleep-comfort':
        return <Moon size={size} color={color} strokeWidth={isSelected ? 2.4 : 1.9} />;
      case 'travel-essentials':
        return <Luggage size={size} color={color} strokeWidth={isSelected ? 2.4 : 1.9} />;
      case 'first-aid':
        return <Cross size={size} color={color} strokeWidth={isSelected ? 2.4 : 1.9} />;
      case 'travel-accessories':
        return <Lock size={size} color={color} strokeWidth={isSelected ? 2.4 : 1.9} />;
      default:
        return <LayoutGrid size={size} color={color} strokeWidth={isSelected ? 2.4 : 1.9} />;
    }
  };

  return (
    <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 10) }]}>
      {/* UPPER PART BACKGROUND IMAGE (Golden Mandala Pattern) */}
      <Image
        source={require('../../assets/images/upper.jpg')}
        style={[StyleSheet.absoluteFill, styles.headerBgImage]}
        contentFit="cover"
      />

      {/* ================= ROW A: LOGO, SPEED BADGE & PROFILE ================= */}
      <View style={styles.topBarRow}>
        <RailQuickLogoSvg width={96} height={26} />

        <View style={styles.topRightControls}>
          <LinearGradient
            colors={['#059669', '#159447', '#16A34A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.deliveryBadge}
          >
            <Zap size={12} color="#FFFFFF" fill="#FFFFFF" />
            <Text style={styles.deliveryTimeText}>{journey.deliveryMinutes} MINS</Text>
          </LinearGradient>

          <TouchableOpacity
            style={styles.profileButton}
            activeOpacity={0.8}
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
              <User size={18} color="#08763A" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ================= LINE 2: TRAIN NAME & SEAT (NO CONTAINER, TRANSPARENT BG - EXACT USER REFERENCE) ================= */}
      <View style={styles.trainSeatRow}>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={handleOpenJourneyModal}
          style={styles.trainSeatDirect}
        >
          {/* Large Bold Train Name with subtle down chevron */}
          <View style={styles.trainTitleRow}>
            <Text style={styles.trainTitleBold} numberOfLines={1}>
              {journey.trainName.includes('•')
                ? journey.trainName.split('•')[1].trim()
                : journey.trainName}
            </Text>
            <ChevronDown size={18} color="#0F172A" strokeWidth={2.6} style={styles.chevronInline} />
          </View>

          {/* Smaller coach and seat text */}
          <Text style={styles.seatDetailsSmall} numberOfLines={1}>
            Coach {journey.coach} / Seat {journey.berth} ({journey.berthType.includes('Lower') ? 'LB' : journey.berthType.includes('Upper') ? 'UB' : 'MB'})
          </Text>
        </TouchableOpacity>
      </View>

      {/* ================= ROW B: BIGGER & WHITER SEARCH BAR (NO SCANNER, WITH TYPEWRITER ANIMATION) ================= */}
      <View style={styles.rowB}>
        <TouchableOpacity
          activeOpacity={0.92}
          style={styles.searchBar}
          onPress={onSearchPress}
        >
          <Search size={20} color="#159447" style={styles.searchIcon} strokeWidth={2.4} />

          <View style={styles.searchContent}>
            <Text style={styles.searchPlaceholderPrefix}>Search </Text>
            <Text style={styles.searchPlaceholderQuery} numberOfLines={1}>
              "{typedText}"
            </Text>
            <Animated.View style={[styles.cursor, cursorStyle]} />
          </View>

          {/* Voice Search Mic Button only (Scanner removed as requested) */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onSearchPress}
            style={styles.micButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Mic size={19} color="#159447" />
          </TouchableOpacity>
        </TouchableOpacity>
      </View>

      {/* ================= ROW C: MODERN HORIZONTALLY SCROLLABLE CATEGORY CARDS ================= */}
      {/* Background set to transparent to match page background without discordant stripe */}
      <View style={styles.rowC}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScrollContent}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const isNew = cat.id === 'women-hygiene';

            return (
              <TouchableOpacity
                key={cat.id}
                activeOpacity={0.8}
                onPress={() => onSelectCategory(cat.id)}
                style={[
                  styles.categoryCard,
                  isSelected
                    ? styles.categoryCardSelected
                    : styles.categoryCardUnselected,
                ]}
              >
                {/* Category Icon */}
                {renderCategoryIcon(cat.id, isSelected, cat.accentColor)}

                {/* Category Name */}
                <Text
                  style={[
                    styles.categoryCardText,
                    isSelected && styles.categoryCardTextSelected,
                  ]}
                  numberOfLines={1}
                >
                  {cat.name}
                </Text>

                {/* Optional "New" Badge */}
                {isNew && (
                  <View
                    style={[
                      styles.newBadgeInline,
                      isSelected && styles.newBadgeInlineSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.newBadgeText,
                        isSelected && styles.newBadgeTextSelected,
                      ]}
                    >
                      New
                    </Text>
                  </View>
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
                  <Train size={18} color="#159447" strokeWidth={2.4} />
                </View>
                <View>
                  <Text style={styles.modalTitle}>Journey & Berth Details</Text>
                  <Text style={styles.modalSub}>IRCTC Live In-Berth Delivery</Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setIsJourneyModalVisible(false)}
                style={styles.modalCloseBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* PNR Banner */}
            <View style={styles.modalPnrBanner}>
              <View>
                <Text style={styles.modalFieldLabel}>PNR / TICKET NUMBER</Text>
                <Text style={styles.modalPnrValue}>{journey.pnr}</Text>
              </View>
              <View style={styles.modalVerifiedBadge}>
                <Check size={11} color="#059669" strokeWidth={3} />
                <Text style={styles.modalVerifiedText}>VERIFIED</Text>
              </View>
            </View>

            {/* Journey Items List */}
            <View style={styles.modalItemsContainer}>
              {/* Train Name & Number */}
              <View style={styles.modalItemRow}>
                <View style={styles.modalItemIconCol}>
                  <Train size={16} color="#08763A" />
                </View>
                <View style={styles.modalItemTextCol}>
                  <Text style={styles.modalFieldLabel}>TRAIN</Text>
                  <Text style={styles.modalFieldValue}>{journey.trainName}</Text>
                </View>
              </View>

              {/* Station & Platform */}
              <View style={styles.modalItemRow}>
                <View style={styles.modalItemIconCol}>
                  <MapPin size={16} color="#D97706" />
                </View>
                <View style={styles.modalItemTextCol}>
                  <Text style={styles.modalFieldLabel}>NEXT STATION HALT</Text>
                  <Text style={styles.modalFieldValue}>
                    {journey.station} • {journey.platform}
                  </Text>
                  <Text style={styles.modalFieldSub}>
                    Arrival in {journey.scheduledArrivalMins} mins • {journey.haltMinutes} mins train halt
                  </Text>
                </View>
              </View>

              {/* Coach & Berth */}
              <View style={styles.modalItemRow}>
                <View style={styles.modalItemIconCol}>
                  <ShieldCheck size={16} color="#2563EB" />
                </View>
                <View style={styles.modalItemTextCol}>
                  <Text style={styles.modalFieldLabel}>ALLOCATED SEAT / BERTH</Text>
                  <Text style={styles.modalFieldValue}>
                    Coach {journey.coach} • Berth {journey.berth}
                  </Text>
                  <Text style={styles.modalFieldSub}>{journey.berthType}</Text>
                </View>
              </View>
            </View>

            {/* Runner Guarantee Note */}
            <View style={styles.modalGuaranteeBox}>
              <Zap size={14} color="#159447" fill="#159447" />
              <Text style={styles.modalGuaranteeText}>
                RailQuick delivery runner arrives directly at your coach door within the first 5 minutes of train halt.
              </Text>
            </View>

            {/* Close / Action Button */}
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

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#FAF5EA',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(230, 218, 192, 0.7)',
    shadowColor: '#261805',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.11,
    shadowRadius: 16,
    elevation: 6,
    zIndex: 50,
    overflow: 'hidden',
  },
  headerBgImage: {
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  // ---- Row A Line 1: Top bar (Brand, 5 MINS & Profile) ----
  topBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 4,
    paddingBottom: 6,
  },
  topRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deliveryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    shadowColor: '#159447',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  deliveryTimeText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
    overflow: 'hidden',
  },
  headerAvatarImg: {
    width: 33,
    height: 33,
    borderRadius: 16.5,
  },
  headerAvatarInitial: {
    fontSize: 15,
    fontWeight: '800',
    color: '#08763A',
  },

  // ---- Line 2: Train & Seat Row (Transparent, No Container, Exactly as User Reference) ----
  trainSeatRow: {
    paddingHorizontal: 14,
    paddingTop: 2,
    paddingBottom: 9,
    backgroundColor: 'transparent',
  },
  trainSeatDirect: {
    backgroundColor: 'transparent',
    alignSelf: 'flex-start',
  },
  trainTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trainTitleBold: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  chevronInline: {
    marginTop: 2,
  },
  seatDetailsSmall: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#475569',
    marginTop: 2,
    letterSpacing: 0.1,
  },

  // ---- Row B: Bigger & Whiter Search Bar ----
  rowB: {
    paddingHorizontal: 14,
    paddingBottom: 6,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 48,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
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
    fontSize: 13.5,
    color: '#94A3B8',
    fontWeight: '500',
  },
  searchPlaceholderQuery: {
    fontSize: 13.5,
    color: '#0F172A',
    fontWeight: '700',
  },
  cursor: {
    width: 2,
    height: 15,
    backgroundColor: '#159447',
    marginLeft: 3,
  },
  micButton: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: '#E7F8EE',
  },

  // ---- Row C: Category Horizontal Cards ----
  rowC: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    paddingTop: 3,
    paddingBottom: 15,
  },
  categoryScrollContent: {
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 7,
  },
  categoryCardUnselected: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: '#E8E1D3',
    shadowColor: '#302008',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  categoryCardSelected: {
    backgroundColor: '#159447',
    borderWidth: 1,
    borderColor: '#0E7837',
    shadowColor: '#159447',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3.5,
  },
  categoryCardText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: -0.2,
  },
  categoryCardTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  newBadgeInline: {
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    marginLeft: 2,
  },
  newBadgeInlineSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  newBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#E11D48',
    letterSpacing: 0.2,
  },
  newBadgeTextSelected: {
    color: '#159447',
  },

  // ---- Journey Popup Modal ----
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.52)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 10,
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
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#E7F8EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalPnrBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 14,
    marginBottom: 14,
  },
  modalFieldLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  modalPnrValue: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.8,
  },
  modalVerifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E7F8EE',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  modalVerifiedText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.3,
  },
  modalItemsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  modalItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  modalItemIconCol: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  modalItemTextCol: {
    flex: 1,
  },
  modalFieldValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalFieldSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  modalGuaranteeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E7F8EE',
    borderRadius: 12,
    padding: 10,
    marginBottom: 16,
  },
  modalGuaranteeText: {
    fontSize: 11,
    color: '#08763A',
    fontWeight: '600',
    flex: 1,
    lineHeight: 15,
  },
  modalCloseButton: {
    backgroundColor: '#159447',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

export default MarketplaceHeader;
