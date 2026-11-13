import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Image } from 'expo-image';
import { CreditCard, Lock } from 'lucide-react-native';
import { PaymentMethodId } from '../../types/payment';

interface PaymentMethod {
  id: PaymentMethodId;
  title: string;
  description: string;
  badge?: string;
  badgeType?: 'fastest' | 'seat';
  chips: string[];
  disabled?: boolean;
}

const METHODS: PaymentMethod[] = [
  {
    id: 'razorpay',
    title: 'PhonePe',
    badge: '⚡ Recommended',
    badgeType: 'fastest',
    description: 'Pay instantly via PhonePe UPI. Secure, fast, and instant confirmation.',
    chips: ['UPI', 'PhonePe', 'GPay', 'Paytm', 'Cards'],
  },
  {
    id: 'cod',
    title: 'Cash on Delivery',
    badge: 'COD',
    badgeType: 'seat',
    description: 'Pay cash to the delivery runner at your berth.',
    chips: ['Cash', 'Pay on Arrival'],
    disabled: true,
  },
];

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethodId;
  onSelectMethod: (method: PaymentMethodId) => void;
  coach: string;
  berth: string;
  station: string;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onSelectMethod,
  coach,
  berth,
  station,
}) => {
  const handleMethodPress = (method: PaymentMethod) => {
    if (method.disabled) {
      Alert.alert(
        'Not Available',
        'Cash on Delivery is not available during the testing phase. Please use PhonePe UPI to place your order.',
        [{ text: 'OK' }]
      );
      return;
    }
    onSelectMethod(method.id);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <CreditCard size={18} color="#006b2f" />
          <Text style={styles.title}>Select Payment Method</Text>
        </View>

        <View style={styles.verifiedBadge}>
          <Text style={styles.verifiedText}>Safe & Verified</Text>
        </View>
      </View>

      {/* Methods List */}
      <View style={styles.cardsList}>
        {METHODS.map((method) => {
          const isSelected = selectedMethod === method.id;
          const isDisabled = !!method.disabled;

          return (
            <TouchableOpacity
              key={method.id}
              activeOpacity={isDisabled ? 0.6 : 0.9}
              onPress={() => handleMethodPress(method)}
              style={[
                styles.methodCard,
                isSelected ? styles.cardActive : styles.cardInactive,
                isDisabled && styles.cardDisabled,
              ]}
            >
              {/* Disabled lock banner */}
              {isDisabled && (
                <View style={styles.disabledBanner}>
                  <Lock size={11} color="#9CA3AF" strokeWidth={2.5} />
                  <Text style={styles.disabledBannerText}>Not available in testing phase</Text>
                </View>
              )}

              <View style={styles.cardHeader}>
                {/* Radio Circle / Lock icon */}
                {isDisabled ? (
                  <View style={[styles.radioCircle, styles.radioCircleDisabled]}>
                    <Lock size={10} color="#9CA3AF" strokeWidth={2.5} />
                  </View>
                ) : (
                  <View
                    style={[
                      styles.radioCircle,
                      isSelected ? styles.radioCircleActive : styles.radioCircleInactive,
                    ]}
                  >
                    {isSelected && <View style={styles.radioInnerDot} />}
                  </View>
                )}

                {/* Details */}
                <View style={styles.cardContent}>
                  <View style={styles.cardTitleRow}>
                    {/* Real PhonePe logo */}
                    {method.id === 'razorpay' && (
                      <Image
                        source={require('../../assets/images/Phonepaylogo.png')}
                        style={styles.phonepeLogoImage}
                        contentFit="contain"
                      />
                    )}
                    <Text style={[styles.cardTitle, isDisabled && styles.cardTitleDisabled]} numberOfLines={1}>
                      {method.title}
                    </Text>

                    {method.badge && (
                      <View
                        style={[
                          styles.methodBadge,
                          method.badgeType === 'fastest'
                            ? styles.badgeFastest
                            : styles.badgeSeat,
                          isDisabled && styles.badgeDisabled,
                        ]}
                      >
                        <Text
                          style={[
                            styles.methodBadgeText,
                            method.badgeType === 'fastest'
                              ? styles.badgeTextFastest
                              : styles.badgeTextSeat,
                            isDisabled && styles.badgeTextDisabled,
                          ]}
                        >
                          {method.badge}
                        </Text>
                      </View>
                    )}
                  </View>

                  <Text style={[styles.cardDescription, isDisabled && styles.cardDescriptionDisabled]}>
                    {method.description}
                  </Text>

                  {/* Brand Chips */}
                  <View style={styles.chipsRow}>
                    {method.chips.map((chip, idx) => (
                      <View key={idx} style={[styles.chipPill, isDisabled && styles.chipPillDisabled]}>
                        <Text style={[styles.chipText, isDisabled && styles.chipTextDisabled]}>{chip}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#121e16',
  },
  verifiedBadge: {
    backgroundColor: '#95f4aa',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  verifiedText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#005226',
  },
  cardsList: {
    gap: 10,
  },
  methodCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
  },
  cardActive: {
    borderColor: '#006b2f',
    shadowColor: '#006b2f',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  cardInactive: {
    borderColor: '#deecdf',
    opacity: 0.9,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioCircleActive: {
    backgroundColor: '#006b2f',
  },
  radioCircleInactive: {
    borderWidth: 1.5,
    borderColor: '#bdcabb',
    backgroundColor: '#FFFFFF',
  },
  radioInnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  cardContent: {
    flex: 1,
    minWidth: 0,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 6,
  },
  cardTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#121e16',
  },
  methodBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  badgeFastest: {
    backgroundColor: '#88faa0',
  },
  badgeSeat: {
    backgroundColor: '#deecdf',
  },
  methodBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  badgeTextFastest: {
    color: '#005323',
  },
  badgeTextSeat: {
    color: '#3e4a3e',
  },
  cardDescription: {
    fontSize: 12,
    color: '#3e4a3e',
    lineHeight: 17,
    marginTop: 4,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  chipPill: {
    backgroundColor: '#e3f2e5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  chipText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#3e4a3e',
  },
  // Disabled state styles
  cardDisabled: {
    opacity: 0.72,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  cardTitleDisabled: {
    color: '#9CA3AF',
  },
  cardDescriptionDisabled: {
    color: '#9CA3AF',
  },
  radioCircleDisabled: {
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    backgroundColor: '#F3F4F6',
  },
  badgeDisabled: {
    backgroundColor: '#E5E7EB',
  },
  badgeTextDisabled: {
    color: '#9CA3AF',
  },
  chipPillDisabled: {
    backgroundColor: '#F3F4F6',
  },
  chipTextDisabled: {
    color: '#9CA3AF',
  },
  disabledBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  disabledBannerText: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '600',
  },
  phonepeLogoImage: {
    width: 36,
    height: 36,
    marginRight: 6,
    borderRadius: 8,
  },
});

export default PaymentMethodSelector;
