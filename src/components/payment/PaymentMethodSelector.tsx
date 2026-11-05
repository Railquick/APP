import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CreditCard, Check } from 'lucide-react-native';
import { PAYMENT_METHODS } from '../../data/paymentMethods';
import { PaymentMethodId } from '../../types/payment';

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
        {PAYMENT_METHODS.map((method) => {
          const isSelected = selectedMethod === method.id;

          // Dynamically tailor descriptions with seat / station
          const description =
            method.id === 'cod'
              ? `Hand exact cash or scan the delivery runner's live QR at Berth ${berth} during ${station} halt.`
              : method.description;

          return (
            <TouchableOpacity
              key={method.id}
              activeOpacity={0.9}
              onPress={() => onSelectMethod(method.id)}
              style={[
                styles.methodCard,
                isSelected ? styles.cardActive : styles.cardInactive,
              ]}
            >
              <View style={styles.cardHeader}>
                {/* Radio Circle */}
                <View
                  style={[
                    styles.radioCircle,
                    isSelected ? styles.radioCircleActive : styles.radioCircleInactive,
                  ]}
                >
                  {isSelected && <View style={styles.radioInnerDot} />}
                </View>

                {/* Details */}
                <View style={styles.cardContent}>
                  <View style={styles.cardTitleRow}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {method.title}
                    </Text>

                    {method.badge && (
                      <View
                        style={[
                          styles.methodBadge,
                          method.badgeType === 'fastest'
                            ? styles.badgeFastest
                            : styles.badgeSeat,
                        ]}
                      >
                        <Text
                          style={[
                            styles.methodBadgeText,
                            method.badgeType === 'fastest'
                              ? styles.badgeTextFastest
                              : styles.badgeTextSeat,
                          ]}
                        >
                          {method.badge}
                        </Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.cardDescription}>{description}</Text>

                  {/* Brand Chips */}
                  <View style={styles.chipsRow}>
                    {method.chips.map((chip, idx) => (
                      <View key={idx} style={styles.chipPill}>
                        <Text style={styles.chipText}>{chip}</Text>
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
});

export default PaymentMethodSelector;
