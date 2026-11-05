import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Plus, Minus, Heart, Clock } from 'lucide-react-native';
import { ProductItem } from '../../data/marketplaceData';
import { useCart } from '../../context/CartContext';
import ProductVisual from './ProductVisual';

interface MarketplaceProductCardProps {
  product: ProductItem;
  variant?: 'grid-2' | 'grid-3' | 'horizontal';
  onPress: (product: ProductItem) => void;
}

export const MarketplaceProductCard: React.FC<MarketplaceProductCardProps> = ({
  product,
  variant = 'grid-2',
  onPress,
}) => {
  const { getItemQuantity, addToCart, removeFromCart } = useCart();
  const quantity = getItemQuantity(product.id);
  const [isLiked, setIsLiked] = useState<boolean>(false);

  // Stepper & cart handlers
  const handleAddPress = (e: any) => {
    e.stopPropagation?.();
    addToCart(product.id);
  };

  const handleIncrement = (e: any) => {
    e.stopPropagation?.();
    addToCart(product.id);
  };

  const handleDecrement = (e: any) => {
    e.stopPropagation?.();
    removeFromCart(product.id);
  };

  const handleHeartPress = (e: any) => {
    e.stopPropagation?.();
    setIsLiked((prev) => !prev);
  };

  // Savings calculation (e.g. "₹150 OFF" in blue)
  const savings = product.mrp > product.price ? product.mrp - product.price : 0;
  const savingsText =
    savings > 0 ? `₹${savings} OFF` : product.discountBadge || 'Lowest in 30 days';

  // Tag chips (e.g. "Hair Fall", "Paraben Free" style from reference)
  const displayTags =
    product.tags && product.tags.length > 0
      ? product.tags
      : product.badge
      ? [product.badge]
      : ['Express Drop'];

  // ================= HORIZONTAL CARD LAYOUT =================
  if (variant === 'horizontal') {
    return (
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={() => onPress(product)}
        style={styles.horizontalCard}
      >
        {/* Left Visual Box with Heart & Weight Pill */}
        <View style={styles.horizontalImageBox}>
          <TouchableOpacity
            style={styles.horizontalHeartBtn}
            onPress={handleHeartPress}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Heart
              size={14}
              color={isLiked ? '#EF4444' : '#64748B'}
              fill={isLiked ? '#EF4444' : 'transparent'}
            />
          </TouchableOpacity>

          <ProductVisual product={product} size={58} />

          <View style={styles.horizontalWeightPill}>
            <Text style={styles.weightPillText} numberOfLines={1}>
              {product.weight}
            </Text>
          </View>
        </View>

        {/* Center Details */}
        <View style={styles.horizontalContent}>
          {/* Price & Savings */}
          <View style={styles.priceRow}>
            <View style={styles.yellowTicketBadge}>
              <Text style={styles.ticketPriceText}>₹{product.price}</Text>
            </View>
            <Text style={styles.mrpText}>₹{product.mrp}</Text>
          </View>

          <Text style={styles.savingsText}>{savingsText}</Text>

          {/* Title */}
          <Text style={styles.horizontalTitle} numberOfLines={1}>
            {product.name}
          </Text>

          {/* Tags */}
          <View style={styles.tagsRow}>
            {displayTags.slice(0, 2).map((tag, idx) => (
              <View key={idx} style={styles.tagChip}>
                <Text style={styles.tagChipText} numberOfLines={1}>
                  {tag}
                </Text>
              </View>
            ))}
          </View>

          {/* Delivery ETA */}
          <View style={styles.etaRow}>
            <Clock size={11} color="#08763A" />
            <Text style={styles.etaText}>5 mins</Text>
          </View>
        </View>

        {/* Right Action: Square Green-bordered Add Button / Stepper */}
        <View style={styles.horizontalActionBox}>
          {quantity === 0 ? (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleAddPress}
              style={styles.squareAddButton}
            >
              <Plus size={20} color="#FFFFFF" strokeWidth={3} />
            </TouchableOpacity>
          ) : (
            <View style={styles.squareStepperContainer}>
              <TouchableOpacity
                onPress={handleDecrement}
                style={styles.stepperActionBtn}
                hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
              >
                <Minus size={13} color="#FFFFFF" strokeWidth={3} />
              </TouchableOpacity>
              <Text style={styles.stepperValueText}>{quantity}</Text>
              <TouchableOpacity
                onPress={handleIncrement}
                style={styles.stepperActionBtn}
                hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
              >
                <Plus size={13} color="#FFFFFF" strokeWidth={3} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  // ================= GRID-3 (COMPACT) LAYOUT =================
  if (variant === 'grid-3') {
    return (
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={() => onPress(product)}
        style={styles.grid3Card}
      >
        {/* Top Image Container */}
        <View style={styles.grid3ImageBox}>
          <TouchableOpacity
            style={styles.grid3HeartBtn}
            onPress={handleHeartPress}
            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
          >
            <Heart
              size={13}
              color={isLiked ? '#EF4444' : '#64748B'}
              fill={isLiked ? '#EF4444' : 'transparent'}
            />
          </TouchableOpacity>

          <ProductVisual product={product} size={50} />

          {/* Weight Badge */}
          <View style={styles.grid3WeightPill}>
            <Text style={styles.grid3WeightText} numberOfLines={1}>
              {product.weight}
            </Text>
          </View>

          {/* Add Button */}
          <View style={styles.grid3AddPosition}>
            {quantity === 0 ? (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleAddPress}
                style={styles.grid3SquareAddBtn}
              >
                <Plus size={16} color="#FFFFFF" strokeWidth={3} />
              </TouchableOpacity>
            ) : (
              <View style={styles.grid3CompactStepper}>
                <TouchableOpacity onPress={handleDecrement} style={styles.compactStepBtn}>
                  <Minus size={10} color="#FFFFFF" strokeWidth={2.5} />
                </TouchableOpacity>
                <Text style={styles.compactStepVal}>{quantity}</Text>
                <TouchableOpacity onPress={handleIncrement} style={styles.compactStepBtn}>
                  <Plus size={10} color="#FFFFFF" strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Card Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.priceRow}>
            <View style={styles.yellowTicketBadge}>
              <Text style={styles.grid3TicketText}>₹{product.price}</Text>
            </View>
            <Text style={styles.grid3MrpText}>₹{product.mrp}</Text>
          </View>

          <Text style={styles.grid3SavingsText} numberOfLines={1}>
            {savingsText}
          </Text>

          <Text style={styles.grid3Title} numberOfLines={2}>
            {product.name}
          </Text>

          <View style={styles.etaRow}>
            <Clock size={10} color="#08763A" />
            <Text style={styles.grid3EtaText}>5 mins</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // ================= GRID-2 (EXACT REFERENCE DESIGN) =================
  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={() => onPress(product)}
      style={styles.cardContainer}
    >
      {/* 1. TOP IMAGE BOX */}
      <View style={styles.imageBox}>
        {/* Wishlist Heart Icon (Top-Right) */}
        <TouchableOpacity
          style={styles.heartButton}
          onPress={handleHeartPress}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Heart
            size={16}
            color={isLiked ? '#EF4444' : '#64748B'}
            fill={isLiked ? '#EF4444' : 'transparent'}
          />
        </TouchableOpacity>

        {/* Centered Product Visual */}
        <ProductVisual product={product} size={76} />

        {/* Bottom Row Inside Image Box: Weight Pill (Left) & Add Button (Right) */}
        <View style={styles.imageBoxBottomRow}>
          {/* Weight / Size Pill (e.g. "650 ml", "415 g", "1 meter", "20W") */}
          <View style={styles.weightPill}>
            <Text style={styles.weightPillText} numberOfLines={1}>
              {product.weight}
            </Text>
          </View>

          {/* Square Add Button with Green Border (matches reference) */}
          {quantity === 0 ? (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleAddPress}
              style={styles.squareAddButton}
            >
              <Plus size={20} color="#FFFFFF" strokeWidth={3} />
            </TouchableOpacity>
          ) : (
            <View style={styles.squareStepperContainer}>
              <TouchableOpacity
                onPress={handleDecrement}
                style={styles.stepperActionBtn}
                hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
              >
                <Minus size={13} color="#FFFFFF" strokeWidth={3} />
              </TouchableOpacity>
              <Text style={styles.stepperValueText}>{quantity}</Text>
              <TouchableOpacity
                onPress={handleIncrement}
                style={styles.stepperActionBtn}
                hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
              >
                <Plus size={13} color="#FFFFFF" strokeWidth={3} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* 2. CARD DETAILS BELOW IMAGE BOX */}
      <View style={styles.detailsContainer}>
        {/* Price Row: Yellow Coupon Ticket + Strikethrough MRP */}
        <View style={styles.priceRow}>
          <View style={styles.yellowTicketBadge}>
            <Text style={styles.ticketPriceText}>₹{product.price}</Text>
          </View>
          <Text style={styles.mrpText}>₹{product.mrp}</Text>
        </View>

        {/* Savings Text (e.g. "₹616 OFF" or "Lowest in 30 d...") in Cyan/Blue */}
        <Text style={styles.savingsText} numberOfLines={1}>
          {savingsText}
        </Text>

        {/* Product Title */}
        <Text style={styles.productTitle} numberOfLines={2}>
          {product.name}
        </Text>

        {/* Benefit / Feature Tag Chips (e.g. "Hair Fall", "Paraben Free") */}
        <View style={styles.tagsRow}>
          {displayTags.slice(0, 2).map((tag, idx) => (
            <View key={idx} style={styles.tagChip}>
              <Text style={styles.tagChipText} numberOfLines={1}>
                {tag}
              </Text>
            </View>
          ))}
        </View>

        {/* Delivery ETA Row (e.g. clock icon + "16 mins" or "5 mins") */}
        <View style={styles.etaRow}>
          <Clock size={11} color="#08763A" />
          <Text style={styles.etaText}>5 mins</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // ================= GRID-2 MAIN CARD STYLES =================
  cardContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E8ECE9',
    padding: 10,
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    minHeight: 285,
  },
  imageBox: {
    width: '100%',
    aspectRatio: 1.05,
    backgroundColor: '#F3F6F4',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E7EBE8',
  },
  heartButton: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  imageBoxBottomRow: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    right: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 4,
  },
  weightPill: {
    backgroundColor: '#0b6a31ff',
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 4,
    maxWidth: '58%',
  },
  weightPillText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  squareAddButton: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#32911aff',
    borderWidth: 2,
    borderColor: '#44432fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#159447',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  squareStepperContainer: {
    height: 38,
    borderRadius: 11,
    backgroundColor: '#16201A',
    borderWidth: 2,
    borderColor: '#159447',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    gap: 4,
  },
  stepperActionBtn: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  stepperValueText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    minWidth: 14,
    textAlign: 'center',
  },

  // ================= CARD DETAILS BELOW IMAGE =================
  detailsContainer: {
    marginTop: 8,
    flexDirection: 'column',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  yellowTicketBadge: {
    backgroundColor: '#FFD45A',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#EAB308',
    borderStyle: 'dashed',
  },
  ticketPriceText: {
    fontSize: 14.5,
    fontWeight: '900',
    color: '#17231B',
    letterSpacing: -0.2,
  },
  mrpText: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  savingsText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0284C7', // Striking cyan/blue from reference
    marginTop: 3,
  },
  productTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#17231B',
    lineHeight: 17,
    marginTop: 4,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 6,
  },
  tagChip: {
    backgroundColor: '#E9F8EF',
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderWidth: 0.5,
    borderColor: '#C3EDD1',
  },
  tagChipText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#08763A',
  },
  etaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  etaText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#08763A',
  },

  // ================= HORIZONTAL CARD STYLES =================
  horizontalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E8ECE9',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000000ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 10,
  },
  horizontalImageBox: {
    width: 82,
    height: 82,
    borderRadius: 14,
    backgroundColor: '#F3F6F4',
    borderWidth: 1,
    borderColor: '#E7EBE8',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  horizontalHeartBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  horizontalWeightPill: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: '#0b6a31ff',
    borderRadius: 5,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
  },
  horizontalContent: {
    flex: 1,
    paddingHorizontal: 10,
  },
  horizontalTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#17231B',
    marginTop: 2,
  },
  horizontalActionBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ================= GRID-3 COMPACT STYLES =================
  grid3Card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8ECE9',
    padding: 8,
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 230,
  },
  grid3ImageBox: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F3F6F4',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E7EBE8',
  },
  grid3HeartBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  grid3WeightPill: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: '#0b6a31ff',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1.5,
  },
  grid3WeightText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
  },
  grid3AddPosition: {
    position: 'absolute',
    bottom: 4,
    right: 4,
  },
  grid3SquareAddBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#166937ff',
    borderWidth: 1.5,
    borderColor: '#020303ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid3CompactStepper: {
    height: 28,
    borderRadius: 8,
    backgroundColor: '#16201A',
    borderWidth: 1.5,
    borderColor: '#159447',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 2,
    gap: 2,
  },
  compactStepBtn: {
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  compactStepVal: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  grid3TicketText: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#17231B',
  },
  grid3MrpText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  grid3SavingsText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#0284C7',
    marginTop: 2,
  },
  grid3Title: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#17231B',
    lineHeight: 15,
    marginTop: 2,
  },
  grid3EtaText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#08763A',
  },
});

export default MarketplaceProductCard;
