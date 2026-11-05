import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
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

  // Filter products by category
  const mobileProducts = useMemo(
    () => PRODUCTS.filter((p) => p.category === 'mobile'),
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

      {/* FIXED 3-ROW APP HEADER */}
      <MarketplaceHeader
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onSearchPress={handleSearchPress}
        onProfilePress={handleProfilePress}
        onJourneyDetailsPress={handleJourneyDetailsPress}
      />

      {/* MAIN SCROLLABLE CATALOG CONTENT */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* PROMOTIONAL HERO BANNER */}
        <PromotionalHeroBanner />

        {/* QUICK STATION HALT NOTIFIER PILL */}
        <StationHaltNotifier onDetailsPress={handleStationHaltDetails} />

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
        bottomOffset={68}
        onPress={onNavigateToCart}
      />

      {/* 5-TAB BOTTOM NAVIGATION */}
      <MarketplaceBottomNav
        activeTab={activeTab}
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
    backgroundColor: '#F6F8F6',
  },
  scrollView: {
    flex: 1,
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
    height: 100,
  },
});

export default HomeScreen;

