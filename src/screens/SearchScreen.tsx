import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Keyboard,
  Platform,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Search as SearchIcon,
  X,
  Mic,
  ScanBarcode,
  Sparkles,
  TrendingUp,
  Clock,
  Check,
  Zap,
  MapPin,
  Heart,
  Send,
} from 'lucide-react-native';
import { PRODUCTS, ProductItem, SEARCH_TERMS } from '../data/marketplaceData';
import { MarketplaceProductCard } from '../components/marketplace/MarketplaceProductCard';
import ProductDetailModal from '../components/marketplace/ProductDetailModal';
import FloatingCartBar from '../components/marketplace/FloatingCartBar';
import { useJourney } from '../context/JourneyContext';

interface SearchScreenProps {
  onNavigateBack: () => void;
  onNavigateToCart: () => void;
  initialQuery?: string;
}

export const SearchScreen: React.FC<SearchScreenProps> = ({
  onNavigateBack,
  onNavigateToCart,
  initialQuery = '',
}) => {
  const insets = useSafeAreaInsets();
  const { journey } = useJourney();
  const inputRef = useRef<any>(null);

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Suggestion feedback state
  const [submittedQuery, setSubmittedQuery] = useState<string | null>(null);
  const [showFeedbackToast, setShowFeedbackToast] = useState(false);

  // Filter products by query
  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    return PRODUCTS.filter((item) => {
      const nameMatch = item.name.toLowerCase().includes(q);
      const catMatch = item.category.toLowerCase().includes(q);
      const descMatch = item.description?.toLowerCase().includes(q);
      const tagMatch = item.tags?.some((t) => t.toLowerCase().includes(q));
      return nameMatch || catMatch || descMatch || tagMatch;
    });
  }, [searchQuery]);

  const handleSelectSearchTerm = (term: string) => {
    setSearchQuery(term);
    setSubmittedQuery(null);
    setShowFeedbackToast(false);
  };

  const handleClear = () => {
    setSearchQuery('');
    setSubmittedQuery(null);
    setShowFeedbackToast(false);
    inputRef.current?.focus();
  };

  const handleSuggestProduct = () => {
    const queryToSubmit = searchQuery.trim() || 'Requested Product';
    setSubmittedQuery(queryToSubmit);
    setShowFeedbackToast(true);

    // Auto-hide toast after 3.5s
    setTimeout(() => {
      setShowFeedbackToast(false);
    }, 3500);
  };

  const handleMicPress = () => {
    Alert.alert(
      'Voice Search',
      'Listening for railway essentials... Try saying "Type-C Cable" or "Cold Drink".',
      [
        { text: 'Search Type-C Cable', onPress: () => handleSelectSearchTerm('Type-C') },
        { text: 'Search Cold Drink', onPress: () => handleSelectSearchTerm('Coke') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleScanPress = () => {
    Alert.alert(
      'Barcode Scanner',
      'Scan any packaging barcode to check if it is available for in-berth delivery at your next station halt.'
    );
  };

  const hasSearched = searchQuery.trim().length > 0;
  const noResults = hasSearched && filteredProducts.length === 0;

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* ================= 1. SEARCH HEADER ================= */}
      <View style={[styles.headerWrapper, { paddingTop: Math.max(insets.top, 10) }]}>
        <View style={styles.searchBarRow}>
          {/* Back Button */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={onNavigateBack}
            style={styles.backButton}
          >
            <ArrowLeft size={20} color="#0F172A" strokeWidth={2.4} />
          </TouchableOpacity>

          {/* Search Input Box */}
          <View style={styles.searchInputContainer}>
            <SearchIcon size={18} color="#159447" style={styles.searchIcon} />

            <TextInput
              ref={inputRef}
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                setSubmittedQuery(null);
                setShowFeedbackToast(false);
              }}
              placeholder='Search "USB-C", "chips", "medicine"...'
              placeholderTextColor="#94A3B8"
              style={styles.searchInput}
              returnKeyType="search"
              autoFocus={true}
              clearButtonMode="never"
            />

            {/* Clear Button */}
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={handleClear}
                style={styles.clearBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={16} color="#64748B" />
              </TouchableOpacity>
            )}

            {/* Tools Divider */}
            <View style={styles.toolDivider} />

            {/* Mic Tool */}
            <TouchableOpacity
              onPress={handleMicPress}
              style={styles.toolBtn}
              hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
            >
              <Mic size={18} color="#64748B" />
            </TouchableOpacity>

            {/* Scan Tool */}
            <TouchableOpacity
              onPress={handleScanPress}
              style={styles.toolBtn}
              hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
            >
              <ScanBarcode size={18} color="#64748B" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Coach Berth Notice Banner */}
        <View style={styles.deliveryStationBar}>
          <View style={styles.deliveryStationLeft}>
            <MapPin size={12} color="#159447" />
            <Text style={styles.deliveryStationText} numberOfLines={1}>
              Delivering to <Text style={styles.boldText}>Coach {journey.coach}, Berth {journey.berth}</Text> at {journey.station}
            </Text>
          </View>
          <View style={styles.haltPill}>
            <Zap size={10} color="#D97706" fill="#D97706" />
            <Text style={styles.haltPillText}>5 MINS</Text>
          </View>
        </View>
      </View>

      {/* FEEDBACK TOAST CONFIRMATION */}
      {showFeedbackToast && (
        <View style={styles.feedbackToast}>
          <View style={styles.feedbackToastDot}>
            <Check size={12} color="#FFFFFF" strokeWidth={3} />
          </View>
          <Text style={styles.feedbackToastText}>
            "{submittedQuery}" sent to feedback! We'll look into it.
          </Text>
        </View>
      )}

      {/* ================= 2. CONTENT AREA ================= */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* CASE A: NO RESULTS FOUND -> EXACT MATCH OF UPLOADED REFERENCE DESIGN */}
        {noResults && (
          <View style={styles.notFoundWrapper}>
            <View style={styles.notFoundCard}>
              {/* Heading: exact wording and structure from uploaded photo */}
              <Text style={styles.notFoundHeading}>
                didn't find{'\n'}what you were{'\n'}looking for?
              </Text>

              {/* Subheading: exact wording from uploaded photo */}
              <Text style={styles.notFoundSubtext}>
                Suggest something & we’ll look into it
              </Text>

              {/* Suggest a Product Button: exact style from uploaded photo */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleSuggestProduct}
                style={[
                  styles.suggestBtn,
                  submittedQuery === searchQuery.trim() && styles.suggestBtnSubmitted,
                ]}
              >
                {submittedQuery === searchQuery.trim() ? (
                  <View style={styles.suggestBtnInner}>
                    <Check size={16} color="#059669" strokeWidth={2.6} />
                    <Text style={[styles.suggestBtnText, styles.suggestBtnTextSubmitted]}>
                      Suggestion Sent!
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.suggestBtnText}>Suggest a Product</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Popular items to explore instead */}
            <View style={styles.exploreAlternativesSection}>
              <Text style={styles.exploreAlternativesTitle}>
                POPULAR AT YOUR STATION (NZM):
              </Text>

              <View style={styles.grid2Container}>
                <View style={styles.grid2Row}>
                  {PRODUCTS.slice(0, 2).map((prod) => (
                    <MarketplaceProductCard
                      key={prod.id}
                      product={prod}
                      variant="grid-2"
                      onPress={(p) => {
                        setSelectedProduct(p);
                        setIsModalVisible(true);
                      }}
                    />
                  ))}
                </View>
                <View style={styles.grid2Row}>
                  {PRODUCTS.slice(2, 4).map((prod) => (
                    <MarketplaceProductCard
                      key={prod.id}
                      product={prod}
                      variant="grid-2"
                      onPress={(p) => {
                        setSelectedProduct(p);
                        setIsModalVisible(true);
                      }}
                    />
                  ))}
                </View>
              </View>
            </View>
          </View>
        )}

        {/* CASE B: MATCHING SEARCH RESULTS */}
        {hasSearched && !noResults && (
          <View style={styles.resultsWrapper}>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsCountText}>
                Found {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'} for "{searchQuery}"
              </Text>
              <View style={styles.expressBadge}>
                <Zap size={11} color="#159447" fill="#159447" />
                <Text style={styles.expressBadgeText}>5-MIN DROP</Text>
              </View>
            </View>

            {/* 2-Column Product Grid */}
            <View style={styles.grid2Container}>
              {Array.from({ length: Math.ceil(filteredProducts.length / 2) }).map((_, rowIndex) => {
                const rowItems = filteredProducts.slice(rowIndex * 2, rowIndex * 2 + 2);
                return (
                  <View key={`row-${rowIndex}`} style={styles.grid2Row}>
                    {rowItems.map((prod) => (
                      <MarketplaceProductCard
                        key={prod.id}
                        product={prod}
                        variant="grid-2"
                        onPress={(p) => {
                          setSelectedProduct(p);
                          setIsModalVisible(true);
                        }}
                      />
                    ))}
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* CASE C: INITIAL EMPTY STATE (POPULAR SEARCHES & TRENDING CHIPS) */}
        {!hasSearched && (
          <View style={styles.initialStateWrapper}>
            {/* Trending Section */}
            <View style={styles.trendingSection}>
              <View style={styles.sectionTitleRow}>
                <TrendingUp size={16} color="#159447" />
                <Text style={styles.sectionTitle}>TRENDING SEARCHES</Text>
              </View>

              <View style={styles.chipsCloud}>
                {SEARCH_TERMS.map((term) => (
                  <TouchableOpacity
                    key={term}
                    activeOpacity={0.75}
                    onPress={() => handleSelectSearchTerm(term)}
                    style={styles.trendingChip}
                  >
                    <SearchIcon size={12} color="#159447" />
                    <Text style={styles.trendingChipText}>{term}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Quick Train Categories */}
            <View style={styles.trendingSection}>
              <View style={styles.sectionTitleRow}>
                <Sparkles size={16} color="#D97706" />
                <Text style={styles.sectionTitle}>FREQUENTLY ORDERED ON TRAIN</Text>
              </View>

              <View style={styles.frequentGrid}>
                {[
                  { label: '65W GaN Charger', query: 'charger', sub: 'Fast charging on berth' },
                  { label: 'Chilled Cola & Juices', query: 'coke', sub: 'Cold beverage drop' },
                  { label: "Lay's & Snacks", query: 'lays', sub: 'Crispy travel namkeen' },
                  { label: 'ORS & Paracetamol', query: 'ors', sub: 'Emergency medical aid' },
                  { label: 'Sanitary Care', query: 'sanitary', sub: 'Discreet sealed delivery' },
                  { label: 'Eye-Mask & Pillow', query: 'sleep', sub: 'Comfortable sleeper ride' },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.label}
                    activeOpacity={0.8}
                    onPress={() => handleSelectSearchTerm(item.query)}
                    style={styles.frequentCard}
                  >
                    <View style={styles.frequentDot} />
                    <View style={styles.frequentTextCol}>
                      <Text style={styles.frequentCardTitle}>{item.label}</Text>
                      <Text style={styles.frequentCardSub}>{item.sub}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* FLOATING CART BAR (IF CART HAS ITEMS) */}
      <FloatingCartBar
        bottomOffset={16}
        onPress={onNavigateToCart}
      />

      {/* PRODUCT DETAIL MODAL */}
      <ProductDetailModal
        product={selectedProduct}
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // 1. Search Header
  headerWrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 3,
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingBottom: 8,
    gap: 8,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F2',
    borderWidth: 1.2,
    borderColor: '#D1E7DD',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 4,
    marginRight: 4,
  },
  toolDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 4,
  },
  toolBtn: {
    padding: 3,
  },
  deliveryStationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAF5EA',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1E9D7',
  },
  deliveryStationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
    marginRight: 8,
  },
  deliveryStationText: {
    fontSize: 11,
    color: '#475569',
  },
  boldText: {
    fontWeight: '800',
    color: '#0F172A',
  },
  haltPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  haltPillText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#D97706',
  },

  // Feedback Toast
  feedbackToast: {
    position: 'absolute',
    top: 112,
    left: 16,
    right: 16,
    backgroundColor: '#0F172A',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 99,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  feedbackToastDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#159447',
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackToastText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
    flex: 1,
  },

  // Scroll Content
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 90,
  },

  // ================= NOT FOUND CARD (Exact Reference) =================
  notFoundWrapper: {
    paddingHorizontal: 18,
    paddingTop: 36,
  },
  notFoundCard: {
    backgroundColor: '#FFFFFF',
    alignItems: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 6,
    marginBottom: 32,
  },
  notFoundHeading: {
    fontSize: 34,
    fontWeight: '800',
    color: '#B8BFC6',
    lineHeight: 40,
    letterSpacing: -0.6,
    marginBottom: 14,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  notFoundSubtext: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
    marginBottom: 20,
    letterSpacing: 0.1,
  },
  suggestBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 22,
    paddingVertical: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  suggestBtnSubmitted: {
    borderColor: '#86EFAC',
    backgroundColor: '#F0FDF4',
  },
  suggestBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  suggestBtnText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#E11D48',
  },
  suggestBtnTextSubmitted: {
    color: '#059669',
  },

  // Explore Alternatives
  exploreAlternativesSection: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  exploreAlternativesTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 12,
  },

  // Results Section
  resultsWrapper: {
    paddingHorizontal: 14,
    paddingTop: 14,
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  resultsCountText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  expressBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E7F8EE',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  expressBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#159447',
  },

  // Grid
  grid2Container: {
    gap: 10,
  },
  grid2Row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },

  // Initial State
  initialStateWrapper: {
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  trendingSection: {
    marginBottom: 24,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  chipsCloud: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  trendingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  trendingChipText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
  },
  frequentGrid: {
    gap: 8,
  },
  frequentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  frequentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#159447',
    marginRight: 10,
  },
  frequentTextCol: {
    flex: 1,
  },
  frequentCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  frequentCardSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
});

export default SearchScreen;
