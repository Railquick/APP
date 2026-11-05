import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { ShoppingBag, Plus, Minus, Leaf } from 'lucide-react-native';
import { ProductItem } from '../../types/product';
import ProductVisual from '../marketplace/ProductVisual';

interface CartItemData extends ProductItem {
  quantity: number;
  subtotal: number;
}

interface CartItemsListProps {
  items: CartItemData[];
  onIncrement: (productId: string) => void;
  onDecrement: (productId: string) => void;
}

export const CartItemsList: React.FC<CartItemsListProps> = ({
  items,
  onIncrement,
  onDecrement,
}) => {
  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <ShoppingBag size={18} color="#006b2f" />
          <Text style={styles.title}>Items in Cart ({items.length})</Text>
        </View>
        <View style={styles.fulfillmentBadge}>
          <Text style={styles.fulfillmentText}>Fast Fulfillment</Text>
        </View>
      </View>

      {/* Item List */}
      <View style={styles.itemsContainer}>
        {items.map((item, idx) => {
          const discountPercent =
            item.mrp > item.price
              ? `${Math.round(((item.mrp - item.price) / item.mrp) * 100)}% off`
              : item.discountBadge || null;

          return (
            <React.Fragment key={item.id}>
              {idx > 0 && <View style={styles.divider} />}

              <View style={styles.itemRow}>
                {/* Product Thumbnail */}
                <View style={styles.thumbnailBox}>
                  {item.localImage ? (
                    <Image
                      source={item.localImage}
                      style={styles.thumbnailImage}
                      contentFit="contain"
                    />
                  ) : item.imageUrl ? (
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={styles.thumbnailImage}
                      contentFit="contain"
                    />
                  ) : (
                    <ProductVisual product={item} size={42} />
                  )}
                </View>

                {/* Details */}
                <View style={styles.detailsCol}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.itemWeight} numberOfLines={1}>
                    {item.weight || item.specs}
                  </Text>

                  <View style={styles.priceRow}>
                    <Text style={styles.currentPrice}>₹{item.price}</Text>
                    {item.mrp > item.price && (
                      <Text style={styles.mrpText}>₹{item.mrp}</Text>
                    )}
                    {discountPercent && (
                      <Text style={styles.discountBadge}>{discountPercent}</Text>
                    )}
                  </View>
                </View>

                {/* Quantity Stepper */}
                <View style={styles.stepperContainer}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => onDecrement(item.id)}
                    style={styles.stepBtn}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Minus size={14} color="#005226" strokeWidth={2.5} />
                  </TouchableOpacity>

                  <Text style={styles.quantityText}>{item.quantity}</Text>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => onIncrement(item.id)}
                    style={styles.stepBtn}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Plus size={14} color="#005226" strokeWidth={2.5} />
                  </TouchableOpacity>
                </View>
              </View>
            </React.Fragment>
          );
        })}
      </View>

      {/* Eco-Packaging Notice */}
      <View style={styles.ecoBanner}>
        <Leaf size={16} color="#006d34" />
        <Text style={styles.ecoText}>
          Free discreet brown eco-paper packaging included
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#121e16',
  },
  fulfillmentBadge: {
    backgroundColor: 'rgba(149, 244, 170, 0.45)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  fulfillmentText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#005226',
  },
  itemsContainer: {
    paddingVertical: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  thumbnailBox: {
    width: 58,
    height: 58,
    borderRadius: 10,
    backgroundColor: '#e9f7ea',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    padding: 4,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  detailsCol: {
    flex: 1,
    minWidth: 0,
  },
  itemName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#121e16',
  },
  itemWeight: {
    fontSize: 11,
    color: '#3e4a3e',
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 3,
  },
  currentPrice: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#121e16',
  },
  mrpText: {
    fontSize: 11,
    color: '#6e7a6d',
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#006b2f',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#95f4aa',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 3,
    shadowColor: '#006d34',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 1,
  },
  stepBtn: {
    width: 26,
    height: 26,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    minWidth: 22,
    textAlign: 'center',
    fontSize: 12.5,
    fontWeight: '800',
    color: '#00210b',
  },
  divider: {
    height: 1,
    backgroundColor: '#deecdf',
    marginVertical: 4,
  },
  ecoBanner: {
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#e9f7ea',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ecoText: {
    fontSize: 11,
    color: '#3e4a3e',
    fontWeight: '500',
  },
});

export default CartItemsList;

