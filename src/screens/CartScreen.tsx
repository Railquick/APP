import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ShoppingBag, ArrowLeft } from 'lucide-react-native';
import { useCart } from '../context/CartContext';
import { useJourney } from '../context/JourneyContext';
import CheckoutHeader from '../components/common/CheckoutHeader';
import TrainBerthCard from '../components/cart/TrainBerthCard';
import CartItemsList from '../components/cart/CartItemsList';
import BerthDeliveryPromise from '../components/cart/BerthDeliveryPromise';
import BillSummaryCard from '../components/cart/BillSummaryCard';
import CartFloatingBottomBar from '../components/cart/CartFloatingBottomBar';

interface CartScreenProps {
  onNavigateBack: () => void;
  onProceedToPayment: () => void;
}

export const CartScreen: React.FC<CartScreenProps> = ({
  onNavigateBack,
  onProceedToPayment,
}) => {
  const { items, summary, addToCart, removeFromCart } = useCart();
  const { journey } = useJourney();
  const scrollRef = useRef<any>(null);

  const handleScrollToBreakup = () => {
    scrollRef.current?.scrollToEnd({ animated: true });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Fixed Header */}
      <CheckoutHeader
        title="Cart & Checkout"
        onBackPress={onNavigateBack}
      />

      {/* Step Progress Tracker removed per design update */}

      {/* Scrollable Cart Content */}
      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.innerContent}>
          {/* Train & Berth Identification Card */}
          <TrainBerthCard journey={journey} />

          {items.length === 0 ? (
            /* Empty Cart View */
            <View style={styles.emptyCartCard}>
              <View style={styles.emptyIconCircle}>
                <ShoppingBag size={32} color="#006b2f" />
              </View>
              <Text style={styles.emptyTitle}>Your cart is empty</Text>
              <Text style={styles.emptySubtitle}>
                Add railway travel essentials, chargers, or hygiene products to your
                berth delivery order.
              </Text>
              <TouchableOpacity
                style={styles.exploreButton}
                activeOpacity={0.88}
                onPress={onNavigateBack}
              >
                <ArrowLeft size={16} color="#FFFFFF" />
                <Text style={styles.exploreButtonText}>Explore Products</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Items in Basket Section */}
              <CartItemsList
                items={items}
                onIncrement={addToCart}
                onDecrement={removeFromCart}
              />

              {/* Berth Delivery Guarantee & Instructions */}
              <BerthDeliveryPromise station={journey.station} />

              {/* Bill Summary */}
              <BillSummaryCard summary={summary} />
            </>
          )}
        </View>
      </ScrollView>

      {/* Persistent Floating Bottom Anchor Bar */}
      {items.length > 0 && (
        <CartFloatingBottomBar
          coach={journey.coach}
          berth={journey.berth}
          totalPayable={summary.totalPayable}
          onProceed={onProceedToPayment}
          onViewBreakup={handleScrollToBreakup}
        />
      )}
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
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 110,
  },
  innerContent: {
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
    gap: 12,
  },
  emptyCartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e9f7ea',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#121e16',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#3e4a3e',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  exploreButton: {
    marginTop: 20,
    backgroundColor: '#006b2f',
    paddingHorizontal: 20,
    height: 44,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
});

export default CartScreen;
