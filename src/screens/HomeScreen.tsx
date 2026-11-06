import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import {
  Smartphone,
  Sparkles,
  HandMetal,
  Baby,
  Moon,
  Luggage,
  Cross,
  Lock,
} from 'lucide-react-native';
import {
  CATEGORIES,
  PRODUCTS,
  ProductItem,
  JOURNEY_DETAILS,
} from '../data/marketplaceData';
import { CartProvider } from '../context/CartContext';
import MarketplaceHeader from '../components/marketplace/MarketplaceHeader';
import PromotionalHeroBanner from '../components/marketplace/PromotionalHeroBanner';
import StationHaltNotifier from '../components/marketplace/StationHaltNotifier';
import MarketplaceProductCard from '../components/marketplace/MarketplaceProductCard';
import BerthGuaranteeCard from '../components/marketplace/BerthGuaranteeCard';
import FloatingCartBar from '../components/marketplace/FloatingCartBar';
import ProductDetailModal from '../components/marketplace/ProductDetailModal';
import RailQuickSpotlightCarousel from '../components/marketplace/RailQuickSpotlightCarousel';
import CategoryShowcaseGrid from '../components/marketplace/CategoryShowcaseGrid';
import MarketplaceBottomNav, {
  BottomNavTab,
} from '../components/marketplace/MarketplaceBottomNav';

interface HomeScreenProps {
  onNavigateToCart?: () => void;
  onNavigateToOrders?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateToCart,
  onNavigateToOrders,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<BottomNavTab>('home');
  const [isNavHidden, setIsNavHidden] = useState<boolean>(false);

  // Scroll direction detection for floating nav hide/show
  const lastScrollY = useRef<number>(0);
  const scrollThreshold = 12; // px before we toggle

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const currentY = e.nativeEvent.contentOffset.y;
      const diff = currentY - lastScrollY.current;
      if (Math.abs(diff) > scrollThreshold) {
        setIsNavHidden(diff > 0 && currentY > 80);
        lastScrollY.current = currentY;
      }
    },
    []
  );

  // Filter products by category
  const mobileProducts = useMemo(
    () => PRODUCTS.filter((p) => p.category === 'mobile'),
    []
  );
  const snacksProducts = useMemo(
    () =>
      PRODUCTS.filter(
        (p) =>
          p.category === 'drinks' ||
          p.category === 'sweets' ||
          p.id === 'prod-lays' ||
          p.id === 'prod-kurkure' ||
          p.id === 'prod-silk' ||
          p.id === 'prod-coke'
      ),
    []
  );
  const womenHygieneProducts = useMemo(
    () => PRODUCTS.filter((p) => p.category === 'women-hygiene'),
    []
  );
  const personalHygieneProducts = useMemo(
    () => PRODUCTS.filter((p) => p.category === 'personal-hygiene'),
    []
  );
  const babyProducts = useMemo(
    () => PRODUCTS.filter((p) => p.category === 'baby'),
    []
  );
  const sleepProducts = useMemo(
    () => PRODUCTS.filter((p) => p.category === 'sleep-comfort'),
    []
  );
  const travelEssentialsProducts = useMemo(
    () => PRODUCTS.filter((p) => p.category === 'travel-essentials'),
    []
  );
  const firstAidProducts = useMemo(
    () => PRODUCTS.filter((p) => p.category === 'first-aid'),
    []
  );
  const travelAccessoriesProducts = useMemo(
    () => PRODUCTS.filter((p) => p.category === 'travel-accessories'),
    []
  );

  // Dynamic filter products for any selected category
  const filteredCategoryProducts = useMemo(() => {
    if (selectedCategory === 'all') return [];
    return PRODUCTS.filter((p) => {
      if (p.category === selectedCategory) return true;
      if (
        (selectedCategory === 'travel-essentials' ||
          selectedCategory === 'chips' ||
          selectedCategory === 'instant-food') &&
        (p.category === 'travel-essentials' ||
          p.id === 'prod-lays' ||
          p.id === 'prod-kurkure')
      )
        return true;
      if (
        (selectedCategory === 'drinks' || selectedCategory === 'tea-coffee') &&
        (p.category === 'drinks' || p.id === 'prod-coke')
      )
        return true;
      if (
        (selectedCategory === 'sweets' || selectedCategory === 'icecream') &&
        (p.category === 'sweets' || p.id === 'prod-silk')
      )
        return true;
      if (
        (selectedCategory === 'paan' || selectedCategory === 'sauces') &&
        (p.category === 'travel-essentials' || p.category === 'personal-hygiene')
      )
        return true;
      return false;
    });
  }, [selectedCategory]);

  const handleCategoryToggle = (catId: string) => {
    if (selectedCategory === catId) {
      setSelectedCategory('all');
    } else {
      setSelectedCategory(catId);
    }
  };

  const handleOpenProduct = (product: ProductItem) => {
    setSelectedProduct(product);
    setIsModalVisible(true);
  };

  const handleCloseProduct = () => {
    setIsModalVisible(false);
  };

  const handleSearchPress = () => {
    Alert.alert('Search Products', 'Type to search across 1,000+ railway essential products.');
  };

  const handleProfilePress = () => {
    Alert.alert('Passenger Profile', `Active Berth: Coach ${JOURNEY_DETAILS.coach}, Berth ${JOURNEY_DETAILS.berth}\nPNR: ${JOURNEY_DETAILS.pnr}`);
  };

  const handleJourneyDetailsPress = () => {
    Alert.alert(
      'Train Journey Details',
      `Station: ${JOURNEY_DETAILS.station} (${JOURNEY_DETAILS.platform})\nCoach: ${JOURNEY_DETAILS.coach}, Berth: ${JOURNEY_DETAILS.berth}\nTrain Halt Window: ${JOURNEY_DETAILS.haltMinutes} minutes`
    );
  };

  const handleStationHaltDetails = () => {
    Alert.alert(
      'Station Halt Information',
      `Next Stop: ${JOURNEY_DETAILS.station}\nEstimated Arrival: in ${JOURNEY_DETAILS.scheduledArrivalMins} mins\nHalt Duration: ${JOURNEY_DETAILS.haltDurationMins} mins\nRailQuick delivery runner arrives at your coach within the first 5 minutes of halt.`
    );
  };

  const showAll = selectedCategory === 'all';

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* FULL SCREEN MANDALA BACKGROUND IMAGE */}
      <Image
        source={require('../assets/images/app_mandala_bg.jpg')}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />

      {/* FIXED 3-ROW APP HEADER (Features Mandala Background on Upper Part) */}
      <MarketplaceHeader
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategoryToggle}
        onSearchPress={handleSearchPress}
        onProfilePress={handleProfilePress}
        onJourneyDetailsPress={handleJourneyDetailsPress}
      />

      {/* MAIN SCROLLABLE CATALOG CONTENT */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* PROMOTIONAL HERO BANNER */}
        <PromotionalHeroBanner onPress={handleStationHaltDetails} />

        {/* QUICK STATION HALT NOTIFIER PILL */}
        <StationHaltNotifier onDetailsPress={handleStationHaltDetails} />

        {/* RAILQUICK SPOTLIGHT COLORFUL SLIDABLE CARDS */}
        <RailQuickSpotlightCarousel
          onProductPress={(id) => {
            const product = PRODUCTS.find((p) => p.id === id);
            if (product) handleOpenProduct(product);
          }}
        />

        {/* CATEGORY SYSTEM (Snacks & Drinks / Travel Essentials 4x2 Grid) */}
        <CategoryShowcaseGrid
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategoryToggle}
          onSeeAllPress={() => {
            setSelectedCategory('all');
          }}
        />

        {/* ================= DYNAMIC CATEGORY FILTERED RESULTS (IF CATEGORY SELECTED) ================= */}
        {!showAll && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <View style={[styles.sectionIconBox, { backgroundColor: '#E7F8EE' }]}>
                  <Sparkles size={17} color="#159447" />
                </View>
                <View>
                  <Text style={styles.sectionTitle}>
                    {CATEGORIES.find((c) => c.id === selectedCategory)?.name ||
                      selectedCategory.replace(/-/g, ' ').toUpperCase()}
                  </Text>
                  <Text style={styles.sectionSubtitle}>
                    {filteredCategoryProducts.length > 0
                      ? `${filteredCategoryProducts.length} items available for berth drop`
                      : 'Express railway essential items for your coach'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setSelectedCategory('all')}
                style={styles.showAllPill}
              >
                <Text style={styles.showAllPillText}>Show All</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.grid2Container}>
              <View style={styles.grid2Row}>
                {(filteredCategoryProducts.length > 0
                  ? filteredCategoryProducts.slice(0, 2)
                  : PRODUCTS.slice(0, 2)
                ).map((prod) => (
                  <MarketplaceProductCard
                    key={prod.id}
                    product={prod}
                    variant="grid-2"
                    onPress={handleOpenProduct}
                  />
                ))}
              </View>
              {(filteredCategoryProducts.length > 2
                ? filteredCategoryProducts.slice(2, 4)
                : PRODUCTS.slice(2, 4)
              ).length > 0 && (
                <View style={styles.grid2Row}>
                  {(filteredCategoryProducts.length > 2
                    ? filteredCategoryProducts.slice(2, 4)
                    : PRODUCTS.slice(2, 4)
                  ).map((prod) => (
                    <MarketplaceProductCard
                      key={prod.id}
                      product={prod}
                      variant="grid-2"
                      onPress={handleOpenProduct}
                    />
                  ))}
                </View>
              )}
            </View>
          </View>
        )}

        {/* ================= SECTION 1: MOBILE ESSENTIALS ================= */}
        {(showAll || selectedCategory === 'mobile') && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <View style={[styles.sectionIconBox, { backgroundColor: '#EFF6FF' }]}>
                  <Smartphone size={17} color="#2563EB" />
                </View>
                <View>
                  <Text style={styles.sectionTitle}>Mobile Essentials</Text>
                  <Text style={styles.sectionSubtitle}>Cables, chargers & powerbanks on coach</Text>
                </View>
              </View>
              <Text style={styles.sectionItemCount}>{mobileProducts.length} Items</Text>
            </View>

            <View style={styles.grid2Container}>
              <View style={styles.grid2Row}>
                {mobileProducts.slice(0, 2).map((prod) => (
                  <MarketplaceProductCard
                    key={prod.id}
                    product={prod}
                    variant="grid-2"
                    onPress={handleOpenProduct}
                  />
                ))}
              </View>
              <View style={styles.grid2Row}>
                {mobileProducts.slice(2, 4).map((prod) => (
                  <MarketplaceProductCard
                    key={prod.id}
                    product={prod}
                    variant="grid-2"
                    onPress={handleOpenProduct}
                  />
                ))}
              </View>
            </View>
          </View>
        )}

        {/* ================= SECTION: SNACKS & REFRESHMENTS ================= */}
        {(showAll ||
          selectedCategory === 'travel-essentials' ||
          selectedCategory === 'drinks' ||
          selectedCategory === 'sweets') && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <View style={[styles.sectionIconBox, { backgroundColor: '#FEF3C7' }]}>
                  <Luggage size={17} color="#D97706" />
                </View>
                <View>
                  <Text style={styles.sectionTitle}>Snacks & Refreshments</Text>
                  <Text style={styles.sectionSubtitle}>Crispy chips, chilled cola & chocolates</Text>
                </View>
              </View>
              <Text style={styles.sectionItemCount}>{snacksProducts.length} Items</Text>
            </View>

            <View style={styles.grid2Container}>
              <View style={styles.grid2Row}>
                {snacksProducts.slice(0, 2).map((prod) => (
                  <MarketplaceProductCard
                    key={prod.id}
                    product={prod}
                    variant="grid-2"
                    onPress={handleOpenProduct}
                  />
                ))}
              </View>
              {snacksProducts.length > 2 && (
                <View style={styles.grid2Row}>
                  {snacksProducts.slice(2, 4).map((prod) => (
                    <MarketplaceProductCard
                      key={prod.id}
                      product={prod}
                      variant="grid-2"
                      onPress={handleOpenProduct}
                    />
                  ))}
                </View>
              )}
            </View>
          </View>
        )}

        {/* ================= SECTION 2: WOMEN'S HYGIENE ================= */}
        {(showAll || selectedCategory === 'women-hygiene') && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <View style={[styles.sectionIconBox, { backgroundColor: '#FFF1F2' }]}>
                  <Sparkles size={17} color="#F43F5E" />
                </View>
                <View>
                  <Text style={styles.sectionTitle}>Women's Hygiene</Text>
                  <Text style={styles.sectionSubtitle}>Discreet sealed packaging & quick emergency delivery</Text>
                </View>
              </View>
              <View style={styles.discreetBadge}>
                <Text style={styles.discreetBadgeText}>Discreet Paper Bag</Text>
              </View>
            </View>

            {womenHygieneProducts.map((prod) => (
              <MarketplaceProductCard
                key={prod.id}
                product={prod}
                variant="horizontal"
                onPress={handleOpenProduct}
              />
            ))}
          </View>
        )}

        {/* ================= SECTION 3: PERSONAL HYGIENE ================= */}
        {(showAll || selectedCategory === 'personal-hygiene') && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <View style={[styles.sectionIconBox, { backgroundColor: '#F0FDFA' }]}>
                  <HandMetal size={17} color="#0D9488" />
                </View>
                <View>
                  <Text style={styles.sectionTitle}>Personal Hygiene</Text>
                  <Text style={styles.sectionSubtitle}>Sanitized train washrooms & fresh travel</Text>
                </View>
              </View>
              <Text style={styles.sectionItemCount}>{personalHygieneProducts.length} Items</Text>
            </View>

            <View style={styles.grid3Row}>
              {personalHygieneProducts.map((prod) => (
                <MarketplaceProductCard
                  key={prod.id}
                  product={prod}
                  variant="grid-3"
                  onPress={handleOpenProduct}
                />
              ))}
            </View>
          </View>
        )}

        {/* ================= SECTION 4: BABY CARE ON JOURNEY ================= */}
        {(showAll || selectedCategory === 'baby') && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <View style={[styles.sectionIconBox, { backgroundColor: '#FFFBEB' }]}>
                  <Baby size={17} color="#D97706" />
                </View>
                <View>
                  <Text style={styles.sectionTitle}>Baby Care on Journey</Text>
                  <Text style={styles.sectionSubtitle}>Gentle diapers & pure water baby wipes</Text>
                </View>
              </View>
              <Text style={styles.sectionItemCount}>{babyProducts.length} Items</Text>
            </View>

            <View style={styles.grid2Row}>
              {babyProducts.map((prod) => (
                <MarketplaceProductCard
                  key={prod.id}
                  product={prod}
                  variant="grid-2"
                  onPress={handleOpenProduct}
                />
              ))}
            </View>
          </View>
        )}

        {/* ================= SECTION 5: SLEEP & COMFORT ================= */}
        {(showAll || selectedCategory === 'sleep-comfort') && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <View style={[styles.sectionIconBox, { backgroundColor: '#EEF2FF' }]}>
                  <Moon size={17} color="#4F46E5" />
                </View>
                <View>
                  <Text style={styles.sectionTitle}>Sleep & Comfort</Text>
                  <Text style={styles.sectionSubtitle}>Restful sleep on sleeper & AC coaches</Text>
                </View>
              </View>
              <Text style={styles.sectionItemCount}>{sleepProducts.length} Items</Text>
            </View>

            <View style={styles.grid2Row}>
              {sleepProducts.map((prod) => (
                <MarketplaceProductCard
                  key={prod.id}
                  product={prod}
                  variant="grid-2"
                  onPress={handleOpenProduct}
                />
              ))}
            </View>
          </View>
        )}

        {/* ================= SECTION 6: TRAVEL ESSENTIALS, FIRST AID & ACCESSORIES ================= */}
        {(showAll ||
          selectedCategory === 'travel-essentials' ||
          selectedCategory === 'first-aid' ||
          selectedCategory === 'travel-accessories') && (
          <View style={styles.sectionContainer}>
            {(showAll || selectedCategory === 'travel-essentials') &&
              travelEssentialsProducts.map((prod) => (
                <MarketplaceProductCard
                  key={prod.id}
                  product={prod}
                  variant="horizontal"
                  onPress={handleOpenProduct}
                />
              ))}

            {(showAll || selectedCategory === 'first-aid') &&
              firstAidProducts.map((prod) => (
                <MarketplaceProductCard
                  key={prod.id}
                  product={prod}
                  variant="horizontal"
                  onPress={handleOpenProduct}
                />
              ))}

            {(showAll || selectedCategory === 'travel-accessories') &&
              travelAccessoriesProducts.map((prod) => (
                <MarketplaceProductCard
                  key={prod.id}
                  product={prod}
                  variant="horizontal"
                  onPress={handleOpenProduct}
                />
              ))}
          </View>
        )}

        {/* RAILQUICK BERTH GUARANTEE */}
        <BerthGuaranteeCard />

        {/* Extra Bottom Spacer so content scrolls comfortably above floating cart & bottom nav */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* PERSISTENT FLOATING CART BAR */}
      <FloatingCartBar
        bottomOffset={96}
        onPress={onNavigateToCart}
      />

      {/* 5-TAB FLOATING BOTTOM NAVIGATION */}
      <MarketplaceBottomNav
        activeTab={activeTab}
        hidden={isNavHidden}
        onTabPress={(tab) => {
          setActiveTab(tab);
          if (tab === 'orders') {
            onNavigateToOrders?.();
          }
        }}
      />

      {/* PRODUCT DETAIL BOTTOM SHEET MODAL */}
      <ProductDetailModal
        product={selectedProduct}
        visible={isModalVisible}
        onClose={handleCloseProduct}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingBottom: 28,
  },
  sectionContainer: {
    marginTop: 18,
    paddingHorizontal: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  sectionIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  sectionItemCount: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#159447',
  },
  discreetBadge: {
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2.5,
  },
  discreetBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#E11D48',
    textTransform: 'uppercase',
  },
  showAllPill: {
    backgroundColor: '#E7F8EE',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  showAllPillText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#08763A',
  },
  grid2Container: {
    gap: 10,
  },
  grid2Row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  grid3Row: {
    flexDirection: 'row',
    gap: 8,
  },
  bottomSpacer: {
    height: 170,
  },
});

export default HomeScreen;

