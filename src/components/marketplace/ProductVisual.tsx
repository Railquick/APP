import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Image } from 'expo-image';
import Svg, {
  Path,
  Rect,
  Circle,
  G,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import { ProductItem } from '../../data/marketplaceData';

interface ProductVisualProps {
  product: ProductItem;
  size?: number;
}

export const ProductVisual: React.FC<ProductVisualProps> = ({ product, size = 80 }) => {
  // If product has a local asset image (like charger or sanitary pads)
  if (product.localImage) {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Image
          source={product.localImage}
          style={styles.image}
          contentFit="contain"
          transition={200}
        />
      </View>
    );
  }

  // Custom vector illustrations for products
  const renderVectorIcon = () => {
    switch (product.iconType) {
      case 'cable':
        return (
          <Svg width={size * 0.65} height={size * 0.65} viewBox="0 0 24 24" fill="none">
            {/* Cable with RailQuick styling */}
            <Path
              d="M17 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 1-4-4V7"
              stroke="#08763A"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <Rect x="3" y="2" width="4" height="6" rx="1.5" fill="#159447" />
            <Path d="M5 2V0M5 8v1" stroke="#08763A" strokeWidth="2" strokeLinecap="round" />
            <Rect x="15" y="19" width="4" height="5" rx="1.5" fill="#159447" />
          </Svg>
        );

      case 'battery':
        return (
          <View style={styles.centerCol}>
            <Svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none">
              <Rect
                x="2"
                y="6"
                width="18"
                height="12"
                rx="3"
                stroke="#159447"
                strokeWidth="2"
              />
              <Path d="M22 10v4" stroke="#159447" strokeWidth="2" strokeLinecap="round" />
              <Path
                d="M11 9l-3 4h4l-1 4 4-5h-3l2-3z"
                fill="#159447"
              />
            </Svg>
            <Text style={styles.subMicroLabel}>10,000 mAh</Text>
          </View>
        );

      case 'headphones':
        return (
          <Svg width={size * 0.65} height={size * 0.65} viewBox="0 0 24 24" fill="none">
            <Path
              d="M3 18v-6a9 9 0 0 1 18 0v6"
              stroke="#4338CA"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <Path
              d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"
              fill="#4338CA"
            />
          </Svg>
        );

      case 'flower':
        return (
          <Svg width={size * 0.65} height={size * 0.65} viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="12" r="3" fill="#F43F5E" />
            <Path
              d="M12 2a4 4 0 0 0-4 4 4 4 0 0 0 8 0 4 4 0 0 0-4-4zm0 12a4 4 0 0 0-4 4 4 4 0 0 0 8 0 4 4 0 0 0-4-4zm10-4a4 4 0 0 0-4-4 4 4 0 0 0 0 8 4 4 0 0 0 4-4zM2 10a4 4 0 0 0 4 4 4 4 0 0 0 0-8 4 4 0 0 0-4 4z"
              fill="#FDA4AF"
            />
          </Svg>
        );

      case 'med-bag':
        return (
          <Svg width={size * 0.65} height={size * 0.65} viewBox="0 0 24 24" fill="none">
            <Rect
              x="2"
              y="7"
              width="20"
              height="14"
              rx="3"
              stroke="#0D9488"
              strokeWidth="2"
            />
            <Path
              d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"
              stroke="#0D9488"
              strokeWidth="2"
            />
            <Path d="M12 11v6M9 14h6" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round" />
          </Svg>
        );

      case 'seat-cover':
        return (
          <Svg width={size * 0.65} height={size * 0.65} viewBox="0 0 24 24" fill="none">
            <Circle cx="8" cy="5" r="2" fill="#0284C7" />
            <Path d="M6 21v-6a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v6" stroke="#0284C7" strokeWidth="2" />
            <Circle cx="16" cy="5" r="2" fill="#0284C7" />
            <Path d="M14 21v-4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v4" stroke="#0284C7" strokeWidth="2" />
          </Svg>
        );

      case 'wipes':
        return (
          <Svg width={size * 0.65} height={size * 0.65} viewBox="0 0 24 24" fill="none">
            <Rect x="3" y="8" width="18" height="12" rx="3" stroke="#059669" strokeWidth="2" />
            <Path
              d="M7 8V6a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v2"
              stroke="#10B981"
              strokeWidth="2"
            />
            <Circle cx="12" cy="14" r="2" fill="#10B981" />
          </Svg>
        );

      case 'baby-carriage':
        return (
          <Svg width={size * 0.65} height={size * 0.65} viewBox="0 0 24 24" fill="none">
            <Path
              d="M19 14a6 6 0 0 1-6 6H7a6 6 0 0 1-6-6V9a4 4 0 0 1 4-4h6a6 6 0 0 1 6 6v3"
              stroke="#D97706"
              strokeWidth="2"
            />
            <Circle cx="7" cy="19" r="2" fill="#D97706" />
            <Circle cx="15" cy="19" r="2" fill="#D97706" />
            <Path d="M19 7h2a2 2 0 0 1 2 2v2" stroke="#D97706" strokeWidth="2" />
          </Svg>
        );

      case 'water-wipes':
        return (
          <Svg width={size * 0.65} height={size * 0.65} viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"
              fill="#FDE68A"
              stroke="#D97706"
              strokeWidth="1.8"
            />
            <Path
              d="M12 10a2.5 2.5 0 0 0-2.5 2.5"
              stroke="#B45309"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </Svg>
        );

      case 'pillow':
        return (
          <Svg width={size * 0.65} height={size * 0.65} viewBox="0 0 24 24" fill="none">
            <Path
              d="M4 18v-2a7 7 0 0 1 14 0v2M8 12a4 4 0 0 1 8 0"
              stroke="#4F46E5"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <Circle cx="7" cy="18" r="2" fill="#4F46E5" />
            <Circle cx="17" cy="18" r="2" fill="#4F46E5" />
          </Svg>
        );

      case 'eye-off':
        return (
          <Svg width={size * 0.65} height={size * 0.65} viewBox="0 0 24 24" fill="none">
            <Path
              d="M2 2l20 20M9.88 9.88a3 3 0 1 0 4.24 4.24"
              stroke="#4338CA"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <Path
              d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"
              stroke="#4338CA"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </Svg>
        );

      case 'bug':
        return (
          <Svg width={size * 0.65} height={size * 0.65} viewBox="0 0 24 24" fill="none">
            <Rect x="8" y="9" width="8" height="11" rx="4" stroke="#059669" strokeWidth="2" />
            <Path
              d="M12 9V5M9 7l6 0M4 11l4 2M20 11l-4 2M4 17l4-1M20 17l-4-1"
              stroke="#059669"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </Svg>
        );

      case 'firstaid':
        return (
          <Svg width={size * 0.65} height={size * 0.65} viewBox="0 0 24 24" fill="none">
            <Rect x="3" y="3" width="18" height="18" rx="4" fill="#FEE2E2" stroke="#DC2626" strokeWidth="1.8" />
            <Path d="M12 7v10M7 12h10" stroke="#DC2626" strokeWidth="3.2" strokeLinecap="round" />
          </Svg>
        );

      case 'lock':
        return (
          <Svg width={size * 0.65} height={size * 0.65} viewBox="0 0 24 24" fill="none">
            <Rect x="5" y="11" width="14" height="10" rx="2.5" fill="#475569" />
            <Path
              d="M8 11V7a4 4 0 0 1 8 0v4"
              stroke="#475569"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <Circle cx="12" cy="16" r="1.5" fill="#FFFFFF" />
          </Svg>
        );

      default:
        return (
          <Svg width={size * 0.65} height={size * 0.65} viewBox="0 0 24 24" fill="none">
            <Path
              d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"
              stroke="#159447"
              strokeWidth="2"
            />
            <Path d="M3 6h18M16 10a4 4 0 0 1-8 0" stroke="#159447" strokeWidth="2" />
          </Svg>
        );
    }
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {renderVectorIcon()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '92%',
    height: '92%',
  },
  centerCol: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  subMicroLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 2,
  },
});

export default ProductVisual;

