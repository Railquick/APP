import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
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
  Easing,
} from 'react-native-reanimated';
import {
  Search,
  Mic,
  ScanBarcode,
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
} from 'lucide-react-native';
import RailQuickLogoSvg from '../../assets/svg/RailQuickLogoSvg';
import {
  JOURNEY_DETAILS,
  SEARCH_TERMS,
  CATEGORIES,
  CategoryInfo,
} from '../../data/marketplaceData';

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
  const [termIndex, setTermIndex] = useState(0);

  // Rotating search placeholder text
  useEffect(() => {
    const interval = setInterval(() => {
      setTermIndex((prev) => (prev + 1) % SEARCH_TERMS.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  // Blinking cursor animation
  const cursorOpacity = useSharedValue(1);
  useEffect(() => {
    cursorOpacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 500 }),
        withTiming(1, { duration: 500 })
      ),
      -1,
      true
    );
  }, []);

  const cursorStyle = useAnimatedStyle(() => ({
    opacity: cursorOpacity.value,
  }));

  const renderCategoryIcon = (id: string, isActive: boolean) => {
    const size = 22;
    const color = isActive ? '#159447' : '#6B7280';
    switch (id) {
      case 'all':
        return <LayoutGrid size={size} color={color} strokeWidth={isActive ? 2.2 : 1.6} />;
      case 'mobile':
        return <Smartphone size={size} color={color} strokeWidth={isActive ? 2.2 : 1.6} />;
      case 'women-hygiene':
        return <Sparkles size={size} color={color} strokeWidth={isActive ? 2.2 : 1.6} />;
      case 'personal-hygiene':
        return <HandMetal size={size} color={color} strokeWidth={isActive ? 2.2 : 1.6} />;
      case 'baby':
        return <Baby size={size} color={color} strokeWidth={isActive ? 2.2 : 1.6} />;
      case 'sleep-comfort':
        return <Moon size={size} color={color} strokeWidth={isActive ? 2.2 : 1.6} />;
      case 'travel-essentials':
        return <Luggage size={size} color={color} strokeWidth={isActive ? 2.2 : 1.6} />;
      case 'first-aid':
        return <Cross size={size} color={color} strokeWidth={isActive ? 2.2 : 1.6} />;
      case 'travel-accessories':
        return <Lock size={size} color={color} strokeWidth={isActive ? 2.2 : 1.6} />;
      default:
        return <LayoutGrid size={size} color={color} strokeWidth={isActive ? 2.2 : 1.6} />;
    }
  };

  return (
    <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 12) }]}>
      {/* UPPER PART BACKGROUND IMAGE (Golden Mandala Pattern) */}
      <Image
        source={require('../../assets/images/upper.jpg')}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />

      {/* UPPER PART BACKGROUND IMAGE (Golden Mandala Pattern) */}
      <Image
        source={require('../../assets/images/upper.jpg')}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />

      {/* ================= ROW A: BRAND, PNR & JOURNEY DETAILS ================= */}
      {/* Line 1: Logo + Profile icon */}
      <View style={styles.rowALine1}>
        <RailQuickLogoSvg width={96} height={26} />
        <TouchableOpacity
          style={styles.profileButton}
          activeOpacity={0.8}
          onPress={onProfilePress}
        >
          <User size={18} color="#08763A" />
        </TouchableOpacity>
      </View>

      {/* Line 2: PNR Badge + 5 MINS pill */}
      <View style={styles.rowALine2}>
        <View style={styles.pnrBadge}>
          <Text style={styles.pnrText}>PNR: {JOURNEY_DETAILS.pnr}</Text>
        </View>

        <LinearGradient
          colors={['#059669', '#159447', '#16A34A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.deliveryBadge}
        >
          <Zap size={13} color="#FFFFFF" fill="#FFFFFF" />
          <Text style={styles.deliveryTimeText}>{JOURNEY_DETAILS.deliveryMinutes} MINS</Text>
        </LinearGradient>
      </View>

      {/* Line 3: Station / coach / berth + Train halt text */}
      <View style={styles.rowALine3}>
        <TouchableOpacity
          activeOpacity={0.75}
          style={styles.stationRow}
          onPress={onJourneyDetailsPress}
        >
          <Text style={styles.stationName} numberOfLines={1}>
            {JOURNEY_DETAILS.station} • {JOURNEY_DETAILS.platform}
          </Text>
          <Text style={styles.coachBerthText} numberOfLines={1}>
            {' '}(Coach {JOURNEY_DETAILS.coach}, Berth {JOURNEY_DETAILS.berth})
          </Text>
          <ChevronDown size={14} color="#08763A" style={styles.dropdownIcon} />
        </TouchableOpacity>

        <Text style={styles.haltText}>Train Halt: {JOURNEY_DETAILS.haltMinutes} min</Text>
      </View>

      {/* ================= ROW B: UNIVERSAL SEARCH BAR ================= */}
      <View style={styles.rowB}>
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.searchBar}
          onPress={onSearchPress}
        >
          <Search size={19} color="#08763A" style={styles.searchIcon} />

          <View style={styles.searchContent}>
            <Text style={styles.searchLabel} numberOfLines={1}>
              Search "{SEARCH_TERMS[termIndex]}"
            </Text>
            <Animated.View style={[styles.cursor, cursorStyle]} />
          </View>

          <View style={styles.searchTools}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onSearchPress}
              style={styles.toolBtn}
              hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
            >
              <Mic size={18} color="#64748B" />
            </TouchableOpacity>

            <View style={styles.toolDivider} />

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onSearchPress}
              style={styles.toolBtn}
              hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
            >
              <ScanBarcode size={18} color="#64748B" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>

      {/* ================= ROW C: CATEGORY TAB BAR ================= */}
      <View style={styles.rowC}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScrollContent}
        >
          {CATEGORIES.map((cat, index) => {
            const isSelected = selectedCategory === cat.id;
            const isNew = cat.id === 'women-hygiene'; // mark one as "New" for freshness

            return (
              <TouchableOpacity
                key={cat.id}
                activeOpacity={0.75}
                onPress={() => onSelectCategory(cat.id)}
                style={styles.categoryTab}
              >
                {/* "New" badge on specific categories */}
                {isNew && !isSelected && (
                  <View style={styles.newBadge}>
                    <Text style={styles.newBadgeText}>New</Text>
                  </View>
                )}

                {/* Icon Box */}
                <View
                  style={[
                    styles.tabIconBox,
                    isSelected && styles.tabIconBoxActive,
                  ]}
                >
                  {renderCategoryIcon(cat.id, isSelected)}
                </View>

                {/* Label */}
                <Text
                  style={[
                    styles.tabLabel,
                    isSelected && styles.tabLabelActive,
                  ]}
                  numberOfLines={1}
                >
                  {cat.name}
                </Text>

                {/* Active underline indicator */}
                {isSelected && <View style={styles.tabUnderline} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#FAF5EA',
    borderBottomWidth: 1,
    borderBottomColor: '#E9DFC7',
    shadowColor: '#159447',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    zIndex: 50,
    overflow: 'hidden',
  },
  // ---- Row A: 3-line header layout (matches uploaded reference) ----
  rowALine1: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 4,
    paddingBottom: 6,
  },
  rowALine2: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingBottom: 4,
  },
  rowALine3: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingBottom: 8,
  },
  pnrBadge: {
    backgroundColor: '#E7F8EE',
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pnrText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#08763A',
    letterSpacing: 0.2,
  },
  stationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
    flex: 1,
    paddingRight: 8,
  },
  stationName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  coachBerthText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  dropdownIcon: {
    marginLeft: 3,
  },
  deliveryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    shadowColor: '#159447',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  deliveryTimeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  haltText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#08763A',
    textAlign: 'right',
  },
  profileButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
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
  },
  rowB: {
    paddingHorizontal: 14,
    paddingBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F2',
    borderWidth: 1.2,
    borderColor: '#D1E7DD',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 42,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  cursor: {
    width: 2,
    height: 14,
    backgroundColor: '#159447',
    marginLeft: 3,
  },
  searchTools: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  toolBtn: {
    padding: 2,
  },
  toolDivider: {
    width: 1,
    height: 14,
    backgroundColor: '#CBD5E1',
  },
  rowC: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  categoryScrollContent: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    gap: 0,
  },
  // ---- New Tab-Bar Style Category Tabs ----
  categoryTab: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 0,
    minWidth: 72,
    position: 'relative',
  },
  tabIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  tabIconBoxActive: {
    backgroundColor: '#E7F8EE',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: 0.1,
    marginBottom: 8,
    textAlign: 'center',
  },
  tabLabelActive: {
    color: '#159447',
    fontWeight: '800',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 10,
    right: 10,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#159447',
  },
  newBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#E11D48',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    zIndex: 10,
  },
  newBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});

export default MarketplaceHeader;

