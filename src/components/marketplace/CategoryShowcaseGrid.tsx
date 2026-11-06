import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import Svg, {
  Rect,
  Circle,
  Path,
  G,
} from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_PADDING = 14;
const GAP = 10;
const ITEM_WIDTH = (SCREEN_WIDTH - GRID_PADDING * 2 - GAP * 3) / 4;

export interface CategoryCardData {
  id: string;
  title: string;
  type:
    | 'chips'
    | 'sweets'
    | 'drinks'
    | 'tea'
    | 'instant'
    | 'sauces'
    | 'paan'
    | 'icecream';
}

const CATEGORIES_DATA: CategoryCardData[] = [
  {
    id: 'travel-essentials',
    title: 'Chips &\nNamkeen',
    type: 'chips',
  },
  {
    id: 'sweets',
    title: 'Sweets &\nChocolates',
    type: 'sweets',
  },
  {
    id: 'drinks',
    title: 'Drinks &\nJuices',
    type: 'drinks',
  },
  {
    id: 'tea-coffee',
    title: 'Tea, Coffee\n& Milk Drinks',
    type: 'tea',
  },
  {
    id: 'instant-food',
    title: 'Instant\nFood',
    type: 'instant',
  },
  {
    id: 'sauces',
    title: 'Sauces &\nSpreads',
    type: 'sauces',
  },
  {
    id: 'paan',
    title: 'Paan\nCorner',
    type: 'paan',
  },
  {
    id: 'icecream',
    title: 'Ice Creams\n& More',
    type: 'icecream',
  },
];

interface CategoryShowcaseGridProps {
  selectedCategory?: string;
  onSelectCategory?: (categoryId: string) => void;
  onSeeAllPress?: () => void;
}

export const CategoryShowcaseGrid: React.FC<CategoryShowcaseGridProps> = ({
  selectedCategory,
  onSelectCategory,
  onSeeAllPress,
}) => {
  // Render high-fidelity packshot illustrations
  const renderPackshots = (type: CategoryCardData['type']) => {
    switch (type) {
      // 1. Chips & Namkeen
      case 'chips':
        return (
          <Svg width="54" height="44" viewBox="0 0 56 48" fill="none">
            <G transform="translate(4, 8) rotate(-4)">
              <Rect
                x="0"
                y="0"
                width="20"
                height="30"
                rx="3"
                fill="#15803D"
                stroke="#166534"
                strokeWidth="1"
              />
              <Rect x="2" y="5" width="16" height="7" rx="1.5" fill="#EAB308" />
              <Circle cx="10" cy="20" r="4" fill="#F97316" />
            </G>
            <G transform="translate(26, 4) rotate(4)">
              <Rect
                x="0"
                y="0"
                width="24"
                height="34"
                rx="4"
                fill="#0284C7"
                stroke="#0369A1"
                strokeWidth="1"
              />
              <Circle cx="12" cy="14" r="7" fill="#FACC15" />
              <Circle cx="12" cy="14" r="5" fill="#DC2626" />
              <Rect x="4" y="24" width="16" height="5" rx="1" fill="#FEF08A" />
            </G>
          </Svg>
        );

      // 2. Sweets & Chocolates
      case 'sweets':
        return (
          <Svg width="54" height="44" viewBox="0 0 56 48" fill="none">
            <G transform="translate(4, 10)">
              <Rect
                x="0"
                y="0"
                width="22"
                height="28"
                rx="3"
                fill="#DC2626"
                stroke="#991B1B"
                strokeWidth="1"
              />
              <Circle cx="8" cy="12" r="3.5" fill="#92400E" />
              <Circle cx="14" cy="12" r="3.5" fill="#92400E" />
              <Circle cx="11" cy="18" r="3.5" fill="#78350F" />
              <Rect x="2" y="2" width="18" height="4" fill="#FEF08A" rx="1" />
            </G>
            <G transform="translate(28, 4) rotate(2)">
              <Rect
                x="0"
                y="0"
                width="20"
                height="35"
                rx="3"
                fill="#4C1D95"
                stroke="#3B0764"
                strokeWidth="1"
              />
              <Path
                d="M3 10 Q10 16 17 10"
                stroke="#FDE047"
                strokeWidth="1.5"
                fill="none"
              />
              <Circle cx="10" cy="22" r="4.5" fill="#7C2D12" />
            </G>
          </Svg>
        );

      // 3. Drinks & Juices
      case 'drinks':
        return (
          <Svg width="54" height="44" viewBox="0 0 56 48" fill="none">
            <G transform="translate(5, 7)">
              <Rect
                x="0"
                y="0"
                width="19"
                height="32"
                rx="2"
                fill="#FDE047"
                stroke="#EAB308"
                strokeWidth="1"
              />
              <Rect x="2" y="2" width="15" height="6" fill="#15803D" rx="1" />
              <Circle cx="9.5" cy="19" r="5" fill="#F97316" />
            </G>
            <G transform="translate(29, 3)">
              <Rect x="6" y="0" width="5" height="4" fill="#DC2626" rx="1" />
              <Path
                d="M6 4 Q4 10 4 15 Q4 22 2 28 Q1 34 8.5 35 Q16 34 15 28 Q13 22 13 15 Q13 10 11 4 Z"
                fill="#7F1D1D"
                stroke="#991B1B"
                strokeWidth="1"
              />
              <Rect x="3.5" y="16" width="10" height="7" fill="#DC2626" rx="1" />
              <Path d="M4 19 Q8.5 22 13 19" stroke="#FFFFFF" strokeWidth="1" fill="none" />
            </G>
          </Svg>
        );

      // 4. Tea, Coffee & Milk Drinks
      case 'tea':
        return (
          <Svg width="54" height="44" viewBox="0 0 56 48" fill="none">
            <G transform="translate(4, 9)">
              <Rect x="4" y="0" width="12" height="4" fill="#991B1B" rx="1" />
              <Rect
                x="1"
                y="4"
                width="18"
                height="26"
                rx="4"
                fill="#451A03"
                stroke="#78350F"
                strokeWidth="1"
              />
              <Rect x="3" y="10" width="14" height="11" fill="#DC2626" rx="1.5" />
              <Circle cx="10" cy="15.5" r="3" fill="#FEF08A" />
            </G>
            <G transform="translate(26, 4) rotate(3)">
              <Rect
                x="0"
                y="0"
                width="23"
                height="33"
                rx="3"
                fill="#15803D"
                stroke="#166534"
                strokeWidth="1"
              />
              <Rect x="2" y="3" width="19" height="6" fill="#FACC15" rx="1" />
              <Circle cx="11.5" cy="20" r="5" fill="#FEF08A" />
              <Path
                d="M8 22 Q11.5 25 15 22"
                stroke="#78350F"
                strokeWidth="1.5"
                fill="none"
              />
            </G>
          </Svg>
        );

      // 5. Instant Food
      case 'instant':
        return (
          <Svg width="54" height="44" viewBox="0 0 56 48" fill="none">
            <G transform="translate(3, 8) rotate(-3)">
              <Rect
                x="0"
                y="0"
                width="21"
                height="29"
                rx="3"
                fill="#DC2626"
                stroke="#B91C1C"
                strokeWidth="1"
              />
              <Circle cx="10.5" cy="14" r="5" fill="#FACC15" />
              <Circle cx="9" cy="13" r="0.8" fill="#78350F" />
              <Circle cx="12" cy="13" r="0.8" fill="#78350F" />
              <Path d="M9 15 Q10.5 17 12 15" stroke="#78350F" strokeWidth="0.8" fill="none" />
            </G>
            <G transform="translate(26, 5) rotate(2)">
              <Rect
                x="0"
                y="0"
                width="23"
                height="32"
                rx="3"
                fill="#FACC15"
                stroke="#EAB308"
                strokeWidth="1"
              />
              <Rect x="2" y="2" width="19" height="6" fill="#DC2626" rx="1" />
              <Circle cx="11.5" cy="19" r="6" fill="#EA580C" />
              <Path
                d="M7 19 Q11.5 23 16 19"
                stroke="#FEF08A"
                strokeWidth="1.8"
                fill="none"
              />
            </G>
          </Svg>
        );

      // 6. Sauces & Spreads
      case 'sauces':
        return (
          <Svg width="54" height="44" viewBox="0 0 56 48" fill="none">
            <G transform="translate(4, 9)">
              <Rect x="3" y="0" width="14" height="4" fill="#FFFFFF" rx="1.5" />
              <Rect
                x="0"
                y="4"
                width="20"
                height="24"
                rx="4"
                fill="#451A03"
                stroke="#291205"
                strokeWidth="1"
              />
              <Rect x="2" y="8" width="16" height="12" fill="#FFFFFF" rx="1.5" />
              <Rect x="4" y="11" width="12" height="3" fill="#DC2626" rx="0.5" />
            </G>
            <G transform="translate(27, 4) rotate(3)">
              <Rect x="7" y="0" width="6" height="3" fill="#FACC15" rx="1" />
              <Path
                d="M5 3 L15 3 L19 12 L18 31 L2 31 L1 12 Z"
                fill="#DC2626"
                stroke="#B91C1C"
                strokeWidth="1"
              />
              <Circle cx="10" cy="18" r="5" fill="#EF4444" />
              <Circle cx="7" cy="22" r="3.5" fill="#B91C1C" />
            </G>
          </Svg>
        );

      // 7. Paan Corner
      case 'paan':
        return (
          <Svg width="54" height="44" viewBox="0 0 56 48" fill="none">
            <G transform="translate(5, 7) rotate(-2)">
              <Rect
                x="0"
                y="0"
                width="18"
                height="30"
                rx="3"
                fill="#7E22CE"
                stroke="#6B21A8"
                strokeWidth="1"
              />
              <Rect x="2" y="8" width="14" height="7" fill="#FACC15" rx="1" />
              <Circle cx="9" cy="22" r="3" fill="#15803D" />
            </G>
            <G transform="translate(28, 6)">
              <Rect x="4" y="0" width="12" height="4" fill="#FFFFFF" rx="1" />
              <Rect
                x="1"
                y="4"
                width="18"
                height="28"
                rx="4"
                fill="#06B6D4"
                stroke="#0891B2"
                strokeWidth="1"
              />
              <Rect x="3" y="11" width="14" height="10" fill="#FFFFFF" rx="1.5" />
              <Path d="M5 16 Q10 19 15 16" stroke="#06B6D4" strokeWidth="1.5" fill="none" />
            </G>
          </Svg>
        );

      // 8. Ice Creams & More
      case 'icecream':
        return (
          <Svg width="54" height="44" viewBox="0 0 56 48" fill="none">
            <G transform="translate(5, 6) rotate(-8)">
              <Rect
                x="0"
                y="0"
                width="13"
                height="23"
                rx="6"
                fill="#451A03"
                stroke="#291205"
                strokeWidth="1"
              />
              <Rect x="4.5" y="22" width="4" height="9" fill="#D97706" rx="1" />
            </G>
            <G transform="translate(24, 8)">
              <Rect
                x="0"
                y="0"
                width="24"
                height="24"
                rx="4"
                fill="#DC2626"
                stroke="#B91C1C"
                strokeWidth="1"
              />
              <Circle cx="12" cy="11" r="7" fill="#FEF3C7" />
              <Circle cx="12" cy="11" r="5" fill="#FFFFFF" />
              <Rect x="2" y="17" width="20" height="4" fill="#FACC15" rx="1" />
            </G>
          </Svg>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* SECTION HEADER WITH RAILQUICK BRANDING */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Image
            source={require('../../assets/images/railquick_logo.png')}
            style={styles.headerLogo}
            contentFit="contain"
          />
          <Text style={styles.headerTitle}>Snacks & Drinks</Text>
        </View>

        <TouchableOpacity activeOpacity={0.7} onPress={onSeeAllPress}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      {/* 4-COLUMN x 2-ROW GRID (LIGHT RAILQUICK THEME WITH LOGO) */}
      <View style={styles.gridContainer}>
        {CATEGORIES_DATA.map((item) => {
          const isSelected = selectedCategory === item.id;

          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.85}
              onPress={() => onSelectCategory?.(item.id)}
              style={styles.gridItem}
            >
              {/* Light Clean RailQuick Card with Logo Badge */}
              <View
                style={[
                  styles.cardBox,
                  isSelected && styles.cardBoxSelected,
                ]}
              >
                {/* Packshot Graphic */}
                <View style={styles.packshotArea}>
                  {renderPackshots(item.type)}
                </View>

                {/* RailQuick Logo Brand Tag on Card */}
                <View style={styles.cardLogoTag}>
                  <Image
                    source={require('../../assets/images/railquick_logo.png')}
                    style={styles.cardLogoImg}
                    contentFit="contain"
                  />
                </View>
              </View>

              {/* Category Title Below */}
              <Text
                style={[
                  styles.categoryTitle,
                  isSelected && styles.categoryTitleSelected,
                ]}
                numberOfLines={2}
              >
                {item.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 18,
    paddingHorizontal: GRID_PADDING,
    marginBottom: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerLogo: {
    width: 68,
    height: 22,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  seeAllText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#159447',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
  },
  gridItem: {
    width: ITEM_WIDTH,
    alignItems: 'center',
  },
  cardBox: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH + 8,
    borderRadius: 16,
    backgroundColor: '#FFFFFF', // Light RailQuick Theme instead of dark
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 5,
    paddingHorizontal: 2,
    shadowColor: '#159447',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
  },
  cardBoxSelected: {
    borderColor: '#159447',
    borderWidth: 2,
    backgroundColor: '#EAF8F0',
    shadowOpacity: 0.16,
    shadowRadius: 7,
  },
  packshotArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLogoTag: {
    width: '88%',
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 0.8,
    borderTopColor: '#F1F5F9',
    paddingTop: 1.5,
  },
  cardLogoImg: {
    width: 42,
    height: 10,
    opacity: 0.8,
  },
  categoryTitle: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    lineHeight: 14,
  },
  categoryTitleSelected: {
    color: '#159447',
    fontWeight: '900',
  },
});

export default CategoryShowcaseGrid;
