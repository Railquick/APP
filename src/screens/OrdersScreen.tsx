import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle2,
  MapPin,
  Train,
  Zap,
  Phone,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  ShoppingBag,
  ArrowRight,
  Receipt,
  Check,
} from 'lucide-react-native';
import { Order, OrderItem } from '../types/order';
import { useOrder } from '../context/OrderContext';
import { useCart } from '../context/CartContext';

interface OrdersScreenProps {
  onNavigateBack: () => void;
  onNavigateToCart: () => void;
  onNavigateToTracking?: (order: Order) => void;
}

type TabFilter = 'all' | 'running' | 'past';

// Local product image resolver
const LOCAL_IMAGES: Record<string, ReturnType<typeof require>> = {
  'prod-cable': require('../assets/products/anker_charger.png'),
  'prod-anker': require('../assets/products/anker_charger.png'),
  'prod-usb-hub': require('../assets/products/usb_hub.png'),
  'prod-ors': require('../assets/products/crocin_tablets.png'),
  'prod-crocin': require('../assets/products/crocin_tablets.png'),
  'prod-vitamins': require('../assets/products/daily_vitamins.png'),
  'prod-granola': require('../assets/products/granola_bars.png'),
  'prod-lays': require('../assets/products/lays_chips.png'),
  'prod-sanitary': require('../assets/products/sanitary_pads.png'),
  'prod-cough': require('../assets/products/cough_syrup.png'),
};

const LOGO = require('../assets/products/logorailquick.png');

function getItemImage(id: string): ReturnType<typeof require> {
  return LOCAL_IMAGES[id] || LOGO;
}

export const OrdersScreen: React.FC<OrdersScreenProps> = ({
  onNavigateBack,
  onNavigateToCart,
  onNavigateToTracking,
}) => {
  const insets = useSafeAreaInsets();
  const { orders, getRunningOrders, getPastOrders, setActiveOrder } = useOrder();
  const { addItemsToCart } = useCart();

  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

  const runningOrders = getRunningOrders();
  const pastOrders = getPastOrders();

  const toggleExpand = (orderId: string) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const handleReorder = (order: Order) => {
    // 1. Prepare items for cart
    const itemsToAdd = order.items.map((i) => ({
      id: i.id,
      quantity: i.quantity,
    }));

    // 2. Add to shared cart state
    addItemsToCart(itemsToAdd);

    // 3. Show confirmation & prompt to view cart
    Alert.alert(
      'Items Added to Cart! 🛒',
      `${order.items.length} items from order #${order.orderId} have been added to your cart totaling ₹${order.itemTotal}.`,
      [
        { text: 'Keep Browsing', style: 'cancel' },
        {
          text: 'Go to Cart',
          onPress: onNavigateToCart,
        },
      ]
    );
  };

  const handleCallRunner = (runnerPhone: string, runnerName: string) => {
    Alert.alert(
      'Contact Station Runner',
      `Connecting to ${runnerName} (${runnerPhone}).\nRunner is currently at your station preparing delivery.`,
      [{ text: 'Close' }]
    );
  };

  const handleTrackLive = (order: Order) => {
    setActiveOrder(order);
    if (onNavigateToTracking) {
      onNavigateToTracking(order);
    }
  };

  // Filter orders according to tab
  let displayedOrders: Order[] = [];
  if (activeTab === 'all') {
    displayedOrders = orders;
  } else if (activeTab === 'running') {
    displayedOrders = runningOrders;
  } else {
    displayedOrders = pastOrders;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* ================= FIXED APP HEADER ================= */}
      <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 12) }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={onNavigateBack}
            style={styles.backButton}
          >
            <ArrowLeft size={20} color="#0F172A" strokeWidth={2.4} />
          </TouchableOpacity>

          <View style={styles.headerTitleColumn}>
            <Text style={styles.headerTitle}>My Orders</Text>
            <Text style={styles.headerSubtitle}>
              {runningOrders.length > 0
                ? `${runningOrders.length} live delivery • ${pastOrders.length} past orders`
                : `${orders.length} total coach orders`}
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onNavigateToCart}
            style={styles.cartIconButton}
          >
            <ShoppingBag size={18} color="#159447" strokeWidth={2.4} />
          </TouchableOpacity>
        </View>

        {/* TAB FILTER PILLS */}
        <View style={styles.tabsRow}>
          {/* Tab 1: All */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('all')}
            style={[styles.tabPill, activeTab === 'all' && styles.tabPillActive]}
          >
            <Text
              style={[
                styles.tabPillText,
                activeTab === 'all' && styles.tabPillTextActive,
              ]}
            >
              All Orders ({orders.length})
            </Text>
          </TouchableOpacity>

          {/* Tab 2: Running Orders */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('running')}
            style={[styles.tabPill, activeTab === 'running' && styles.tabPillActive]}
          >
            {runningOrders.length > 0 && <View style={styles.livePulseDot} />}
            <Text
              style={[
                styles.tabPillText,
                activeTab === 'running' && styles.tabPillTextActive,
              ]}
            >
              Live ({runningOrders.length})
            </Text>
          </TouchableOpacity>

          {/* Tab 3: Past Orders */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('past')}
            style={[styles.tabPill, activeTab === 'past' && styles.tabPillActive]}
          >
            <Text
              style={[
                styles.tabPillText,
                activeTab === 'past' && styles.tabPillTextActive,
              ]}
            >
              Past Orders ({pastOrders.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ================= MAIN SCROLLABLE ORDERS LIST ================= */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* EMPTY STATE IF NO ORDERS */}
        {displayedOrders.length === 0 && (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBox}>
              <Package size={40} color="#159447" strokeWidth={1.8} />
            </View>
            <Text style={styles.emptyTitle}>No Orders Found</Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'running'
                ? 'You have no running deliveries right now.'
                : 'Your coach orders will appear here after checkout.'}
            </Text>
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={onNavigateBack}
              style={styles.browseBtn}
            >
              <Text style={styles.browseBtnText}>Explore Products</Text>
              <ArrowRight size={16} color="#FFFFFF" strokeWidth={2.4} />
            </TouchableOpacity>
          </View>
        )}

        {/* ORDER CARDS */}
        {displayedOrders.map((order) => {
          const isRunning =
            order.status !== 'DELIVERED' &&
            order.status !== 'delivered' &&
            order.status !== 'CANCELLED';

          const isExpanded = !!expandedOrders[order.orderId];

          return (
            <View
              key={order.orderId}
              style={[
                styles.orderCard,
                isRunning ? styles.runningOrderCard : null,
              ]}
            >
              {/* Top Banner: Status & Order Number */}
              <View style={styles.orderTopRow}>
                <View style={styles.orderIdGroup}>
                  <Text style={styles.orderIdLabel}>ORDER #{order.orderId}</Text>
                  <Text style={styles.orderDateText}>{order.createdAt}</Text>
                </View>

                {/* Status Badge */}
                {isRunning ? (
                  <View style={styles.runningBadge}>
                    <View style={styles.runningDot} />
                    <Text style={styles.runningBadgeText}>RUNNER ON WAY</Text>
                  </View>
                ) : (
                  <View style={styles.deliveredBadge}>
                    <CheckCircle2 size={13} color="#159447" strokeWidth={2.5} />
                    <Text style={styles.deliveredBadgeText}>Delivered</Text>
                  </View>
                )}
              </View>

              {/* Station, Coach & Berth Info Box */}
              <View style={styles.journeyInfoBox}>
                <View style={styles.journeyLine}>
                  <Train size={14} color="#159447" style={styles.journeyIcon} />
                  <Text style={styles.journeyTrainText} numberOfLines={1}>
                    {order.journey.trainName}
                  </Text>
                </View>

                <View style={styles.journeyDetailsRow}>
                  <View style={styles.journeyDetailItem}>
                    <MapPin size={13} color="#64748B" />
                    <Text style={styles.journeyDetailText}>
                      {order.journey.station} ({order.journey.platform})
                    </Text>
                  </View>

                  <View style={styles.berthBadge}>
                    <Text style={styles.berthBadgeText}>
                      Coach {order.journey.coach} • Berth {order.journey.berth}
                    </Text>
                  </View>
                </View>
              </View>

              {/* RUNNING ORDER HIGHLIGHT: OTP & RUNNER BOX */}
              {isRunning && (
                <View style={styles.runningHighlightCard}>
                  {/* OTP Row */}
                  <View style={styles.otpRow}>
                    <View>
                      <Text style={styles.otpLabel}>DELIVERY CONFIRMATION OTP</Text>
                      <Text style={styles.otpValue}>{order.otp || '7194'}</Text>
                    </View>
                    <View style={styles.otpTipBox}>
                      <ShieldCheck size={14} color="#159447" />
                      <Text style={styles.otpTipText}>Give to runner at berth</Text>
                    </View>
                  </View>

                  {/* Runner Info */}
                  <View style={styles.runnerRow}>
                    <View style={styles.runnerAvatar}>
                      <Text style={styles.runnerAvatarText}>
                        {order.runner.name.charAt(0)}
                      </Text>
                    </View>
                    <View style={styles.runnerInfoCol}>
                      <Text style={styles.runnerName}>{order.runner.name}</Text>
                      <Text style={styles.runnerRole}>
                        {order.runner.title} (⭐ {order.runner.rating})
                      </Text>
                    </View>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() =>
                        handleCallRunner(order.runner.phone, order.runner.name)
                      }
                      style={styles.callRunnerBtn}
                    >
                      <Phone size={13} color="#159447" strokeWidth={2.4} />
                      <Text style={styles.callRunnerBtnText}>Call</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* ITEMS SUMMARY LIST */}
              <View style={styles.itemsSection}>
                <View style={styles.itemsHeaderRow}>
                  <Text style={styles.itemsHeaderLabel}>
                    ITEMS ORDERED ({order.items.length})
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => toggleExpand(order.orderId)}
                    style={styles.toggleExpandBtn}
                  >
                    <Text style={styles.toggleExpandText}>
                      {isExpanded ? 'Hide Details' : 'View Breakdown'}
                    </Text>
                    {isExpanded ? (
                      <ChevronUp size={14} color="#159447" />
                    ) : (
                      <ChevronDown size={14} color="#159447" />
                    )}
                  </TouchableOpacity>
                </View>

                {/* Display 2 items by default, or all if expanded */}
                {(isExpanded ? order.items : order.items.slice(0, 2)).map((item) => (
                  <View key={item.id} style={styles.itemRow}>
                    <Image
                      source={getItemImage(item.id)}
                      style={styles.itemThumbnail}
                      contentFit="contain"
                    />
                    <View style={styles.itemInfoCol}>
                      <Text style={styles.itemName} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={styles.itemQtyWeight}>
                        Qty: {item.quantity} {item.weight ? `• ${item.weight}` : ''}
                      </Text>
                    </View>
                    <Text style={styles.itemPriceText}>₹{item.subtotal || item.price * item.quantity}</Text>
                  </View>
                ))}

                {/* Show "+N more items" hint when collapsed */}
                {!isExpanded && order.items.length > 2 && (
                  <TouchableOpacity
                    onPress={() => toggleExpand(order.orderId)}
                    style={styles.moreItemsPill}
                  >
                    <Text style={styles.moreItemsText}>
                      +{order.items.length - 2} more item(s) • Tap to view all
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* PAYMENT & TOTAL SUMMARY ROW */}
              <View style={styles.orderBillRow}>
                <View>
                  <Text style={styles.billPaidLabel}>
                    Total Paid ({order.payment.method.toUpperCase()})
                  </Text>
                  <Text style={styles.billTotalAmount}>₹{order.totalAmount}</Text>
                </View>

                {order.totalSavings > 0 && (
                  <View style={styles.savingsPill}>
                    <Text style={styles.savingsPillText}>
                      Saved ₹{order.totalSavings}
                    </Text>
                  </View>
                )}
              </View>

              {/* ================= ACTION BUTTONS ================= */}
              <View style={styles.actionButtonsRow}>
                {/* 1. Track Button (If Running) */}
                {isRunning && (
                  <TouchableOpacity
                    activeOpacity={0.88}
                    onPress={() => handleTrackLive(order)}
                    style={styles.trackLiveBtn}
                  >
                    <Zap size={15} color="#FFFFFF" fill="#FFFFFF" />
                    <Text style={styles.trackLiveBtnText}>Track Runner</Text>
                  </TouchableOpacity>
                )}

                {/* 2. REORDER BUTTON (Prominent Reorder functionality) */}
                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={() => handleReorder(order)}
                  style={[
                    styles.reorderBtn,
                    isRunning ? styles.reorderBtnSecondary : styles.reorderBtnPrimary,
                  ]}
                >
                  <RefreshCw
                    size={14}
                    color={isRunning ? '#159447' : '#FFFFFF'}
                    strokeWidth={2.4}
                  />
                  <Text
                    style={[
                      styles.reorderBtnText,
                      isRunning ? styles.reorderBtnTextSecondary : styles.reorderBtnTextPrimary,
                    ]}
                  >
                    Reorder ({order.items.length} {order.items.length === 1 ? 'item' : 'items'})
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF5EA',
  },

  // Header
  headerContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9DFC7',
    paddingHorizontal: 16,
    paddingBottom: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
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
  headerTitleColumn: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  cartIconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#E7F8EE',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#C3EDD1',
  },

  // Tab Pills
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  tabPillActive: {
    backgroundColor: '#159447',
  },
  tabPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  tabPillTextActive: {
    color: '#FFFFFF',
  },
  livePulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#22C55E',
  },

  // Main Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 40,
  },

  // Order Card
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  runningOrderCard: {
    borderColor: '#86EFAC',
    backgroundColor: '#FFFFFF',
    shadowColor: '#159447',
    shadowOpacity: 0.12,
    shadowRadius: 14,
  },
  orderTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 10,
  },
  orderIdGroup: {
    flex: 1,
  },
  orderIdLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.4,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  orderDateText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  runningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  runningDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D97706',
  },
  runningBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#B45309',
    letterSpacing: 0.4,
  },
  deliveredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E7F8EE',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
  },
  deliveredBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#159447',
  },

  // Journey Info Box
  journeyInfoBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 10,
    marginBottom: 12,
  },
  journeyLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  journeyIcon: {
    marginRight: 6,
  },
  journeyTrainText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  journeyDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  journeyDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  journeyDetailText: {
    fontSize: 11.5,
    color: '#475569',
    fontWeight: '600',
  },
  berthBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  berthBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1E293B',
  },

  // Running Highlight
  runningHighlightCard: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1.2,
    borderColor: '#BBF7D0',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  otpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#DCFCE7',
    marginBottom: 8,
  },
  otpLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#15803D',
    letterSpacing: 0.5,
  },
  otpValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#15803D',
    letterSpacing: 3,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  otpTipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  otpTipText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#159447',
  },
  runnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  runnerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#159447',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  runnerAvatarText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  runnerInfoCol: {
    flex: 1,
  },
  runnerName: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  runnerRole: {
    fontSize: 10.5,
    color: '#64748B',
  },
  callRunnerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#86EFAC',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  callRunnerBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#159447',
  },

  // Items Section
  itemsSection: {
    marginBottom: 12,
  },
  itemsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemsHeaderLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
  },
  toggleExpandBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  toggleExpandText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#159447',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  itemThumbnail: {
    width: 30,
    height: 30,
    borderRadius: 6,
    marginRight: 8,
  },
  itemInfoCol: {
    flex: 1,
  },
  itemName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1E293B',
  },
  itemQtyWeight: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 1,
  },
  itemPriceText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  moreItemsPill: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginTop: 4,
    alignItems: 'center',
  },
  moreItemsText: {
    fontSize: 11,
    color: '#159447',
    fontWeight: '700',
  },

  // Bill Row
  orderBillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginBottom: 12,
  },
  billPaidLabel: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '600',
  },
  billTotalAmount: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 1,
  },
  savingsPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  savingsPillText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#15803D',
  },

  // Action Buttons
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  trackLiveBtn: {
    flex: 1,
    backgroundColor: '#159447',
    borderRadius: 12,
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#159447',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  trackLiveBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  reorderBtn: {
    borderRadius: 12,
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  reorderBtnPrimary: {
    flex: 1,
    backgroundColor: '#006B2F',
    shadowColor: '#006B2F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  reorderBtnSecondary: {
    flex: 1,
    backgroundColor: '#E7F8EE',
    borderWidth: 1.5,
    borderColor: '#86EFAC',
  },
  reorderBtnText: {
    fontSize: 13,
    fontWeight: '800',
  },
  reorderBtnTextPrimary: {
    color: '#FFFFFF',
  },
  reorderBtnTextSecondary: {
    color: '#159447',
  },

  // Empty State
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginTop: 30,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E7F8EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptySubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    maxWidth: 260,
  },
  browseBtn: {
    marginTop: 18,
    backgroundColor: '#159447',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  browseBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});

export default OrdersScreen;

