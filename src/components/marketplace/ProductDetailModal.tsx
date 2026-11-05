import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { X, Zap, Train, Clock, Star } from 'lucide-react-native';
import { ProductItem, JOURNEY_DETAILS } from '../../data/marketplaceData';
import { useCart } from '../../context/CartContext';
import ProductVisual from './ProductVisual';

interface ProductDetailModalProps {
  product: ProductItem | null;
  visible: boolean;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  visible,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const { addToCart } = useCart();

  const translateY = useSharedValue(500);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      backdropOpacity.value = withTiming(1, { duration: 250 });
      translateY.value = withTiming(0, {
        duration: 350,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      backdropOpacity.value = withTiming(0, { duration: 200 });
      translateY.value = withTiming(500, {
        duration: 250,
        easing: Easing.in(Easing.cubic),
      });
    }
  }, [visible]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  if (!product && !visible) return null;

  const handleAddAndClose = () => {
    if (product) {
      addToCart(product.id);
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.modalOverlay}>
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={onClose}
          />
        </Animated.View>

        {/* Bottom Sheet Sheet */}
        <Animated.View
          style={[
            styles.sheetContainer,
            sheetStyle,
            { paddingBottom: Math.max(insets.bottom, 16) },
          ]}
        >
          {/* Top Drag Handle */}
          <View style={styles.dragHandleWrapper}>
            <View style={styles.dragHandle} />
          </View>

          {/* Header Row */}
          <View style={styles.headerRow}>
            <View style={styles.deliveryBadge}>
              <Zap size={14} color="#08763A" fill="#08763A" />
              <Text style={styles.deliveryBadgeText}>5 MIN BERTH DELIVERY</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onClose}
              style={styles.closeBtn}
            >
              <X size={18} color="#475569" />
            </TouchableOpacity>
          </View>

          {product && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* Product Visual Box with Rating */}
              <View style={styles.visualContainer}>
                <ProductVisual product={product} size={110} />

                <View style={styles.coachRatingPill}>
                  <Star size={12} color="#F59E0B" fill="#F59E0B" />
                  <Text style={styles.coachRatingText}>
                    {product.rating || '4.8'} (Coach Rated)
                  </Text>
                </View>
              </View>

              {/* Product Info */}
              <View style={styles.metaRow}>
                <View style={styles.weightBadge}>
                  <Text style={styles.weightBadgeText}>{product.weight}</Text>
                </View>
              </View>

              <Text style={styles.productTitle}>{product.name}</Text>

              {/* Price Row */}
              <View style={styles.priceRow}>
                <Text style={styles.priceCurrent}>₹{product.price}</Text>
                <Text style={styles.priceMrp}>₹{product.mrp}</Text>
                {product.discountBadge && (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountBadgeText}>
                      {product.discountBadge}
                    </Text>
                  </View>
                )}
              </View>

              {/* Delivery Guarantee Cards */}
              <View style={styles.guaranteeCardsRow}>
                <View style={styles.guaranteeCard}>
                  <Train size={18} color="#159447" />
                  <View style={styles.guaranteeCardContent}>
                    <Text style={styles.guaranteeCardTitle}>Seat Delivery</Text>
                    <Text style={styles.guaranteeCardSubtitle}>
                      Coach {JOURNEY_DETAILS.coach}, Berth {JOURNEY_DETAILS.berth}
                    </Text>
                  </View>
                </View>

                <View style={styles.guaranteeCard}>
                  <Clock size={18} color="#159447" />
                  <View style={styles.guaranteeCardContent}>
                    <Text style={styles.guaranteeCardTitle}>
                      {JOURNEY_DETAILS.station} Halt
                    </Text>
                    <Text style={styles.guaranteeCardSubtitle}>
                      Halt window {JOURNEY_DETAILS.haltDurationMins} mins
                    </Text>
                  </View>
                </View>
              </View>

              {/* Description */}
              <View style={styles.descriptionSection}>
                <Text style={styles.descriptionHeader}>Description</Text>
                <Text style={styles.descriptionBody}>{product.description}</Text>
              </View>
            </ScrollView>
          )}

          {/* Footer Action */}
          {product && (
            <View style={styles.footerRow}>
              <View style={styles.totalPayableBlock}>
                <Text style={styles.totalPayableLabel}>Total Payable</Text>
                <Text style={styles.totalPayablePrice}>₹{product.price}</Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.88}
                onPress={handleAddAndClose}
                style={styles.addOrderButton}
              >
                <Text style={styles.addOrderButtonText}>Add to Coach Order</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 16,
    paddingTop: 10,
    maxHeight: '84%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
  },
  dragHandleWrapper: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 4,
  },
  dragHandle: {
    width: 44,
    height: 4.5,
    backgroundColor: '#CBD5E1',
    borderRadius: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  deliveryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deliveryBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#08763A',
    letterSpacing: 0.3,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingVertical: 14,
  },
  visualContainer: {
    width: '100%',
    aspectRatio: 1.4,
    backgroundColor: '#F2F9F5',
    borderRadius: 20,
    borderWidth: 1.2,
    borderColor: '#D1E7DD',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  coachRatingPill: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  coachRatingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B',
  },
  metaRow: {
    marginTop: 14,
  },
  weightBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E7F8EE',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  weightBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#08763A',
  },
  productTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 6,
    letterSpacing: -0.2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginTop: 8,
  },
  priceCurrent: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
  },
  priceMrp: {
    fontSize: 14,
    fontWeight: '500',
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  discountBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#E11D48',
  },
  guaranteeCardsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  guaranteeCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 10,
  },
  guaranteeCardContent: {
    flex: 1,
  },
  guaranteeCardTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#1E293B',
  },
  guaranteeCardSubtitle: {
    fontSize: 10,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 1,
  },
  descriptionSection: {
    marginTop: 16,
  },
  descriptionHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
  },
  descriptionBody: {
    fontSize: 12,
    fontWeight: '400',
    color: '#475569',
    marginTop: 4,
    lineHeight: 18,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  totalPayableBlock: {
    flexDirection: 'column',
  },
  totalPayableLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  totalPayablePrice: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  addOrderButton: {
    backgroundColor: '#159447',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: '#159447',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  addOrderButtonText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

export default ProductDetailModal;
