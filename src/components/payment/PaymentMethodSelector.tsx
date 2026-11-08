import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { CreditCard, Lock, Clock, AlertCircle } from 'lucide-react-native';
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
  const handleMethodPress = (methodId: PaymentMethodId, isDisabled?: boolean) => {
    if (isDisabled) {
      Alert.alert(
        'Prepaid Only for NZM Station',
        `Cash & QR collection at berth is unavailable during the short 5-minute halt at ${station || 'Hazrat Nizamuddin'}. Pre-paid UPI/Razorpay ensures your runner delivers directly to Coach ${coach}, Berth ${berth} with zero delay.`,
        [{ text: 'Got it' }]
      );
      return;
    }
    onSelectMethod(methodId);
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

      {/* Pilot Phase Notice Banner */}
      <View style={styles.prepaidNoticeBanner}>
        <Clock size={14} color="#006b2f" />
        <Text style={styles.prepaidNoticeText}>
          Hazrat Nizamuddin (NZM) Pilot: 100% Pre-paid for 5-min express berth delivery.
        </Text>
      </View>

      {/* Methods List */}
      <View style={styles.cardsList}>
        {PAYMENT_METHODS.map((method) => {
          const isSelected = selectedMethod === method.id;
          const isDisabled = !!method.disabled;

          // Dynamically tailor descriptions with seat / station
          const description =
            method.id === 'cod'
              ? method.disabledReason ||
                `Prepaid only for ${station || 'NZM'} station. Cash/QR at berth is disabled to guarantee fast handover.`
              : method.description;

          return (
            <TouchableOpacity
              key={method.id}
              activeOpacity={isDisabled ? 0.75 : 0.9}
              onPress={() => handleMethodPress(method.id, isDisabled)}
              style={[
                styles.methodCard,
                isSelected ? styles.cardActive : styles.cardInactive,
                isDisabled && styles.cardDisabled,
              ]}
            >
              <View style={styles.cardHeader}>
                {/* Radio Circle / Lock Indicator */}
                <View
                  style={[
                    styles.radioCircle,
                    isSelected
                      ? styles.radioCircleActive
                      : isDisabled
                      ? styles.radioCircleDisabled
                      : styles.radioCircleInactive,
                  ]}
                >
                  {isSelected ? (
                    <View style={styles.radioInnerDot} />
                  ) : isDisabled ? (
                    <Lock size={10} color="#8a958a" />
                  ) : null}
                </View>

                {/* Details */}
                <View style={styles.cardContent}>
                  <View style={styles.cardTitleRow}>
                    <Text
                      style={[
                        styles.cardTitle,
                        isDisabled && styles.cardTitleDisabled,
                      ]}
                      numberOfLines={1}
                    >
                      {method.title}
                    </Text>

                    {method.badge && (
                      <View
                        style={[
                          styles.methodBadge,
                          method.badgeType === 'fastest'
                            ? styles.badgeFastest
                            : method.badgeType === 'disabled'
                            ? styles.badgeDisabled
                            : styles.badgeSeat,
                        ]}
                      >
                        {method.badgeType === 'disabled' && (
                          <AlertCircle size={10} color="#b42318" style={{ marginRight: 3 }} />
                        )}
                        <Text
                          style={[
                            styles.methodBadgeText,
                            method.badgeType === 'fastest'
                              ? styles.badgeTextFastest
                              : method.badgeType === 'disabled'
                              ? styles.badgeTextDisabled
                              : styles.badgeTextSeat,
                          ]}
                        >
                          {method.disabledBadge || method.badge}
                        </Text>
                      </View>
                    )}
                  </View>

                  <Text
                    style={[
                      styles.cardDescription,
                      isDisabled && styles.cardDescriptionDisabled,
                    ]}
                  >
                    {description}
                  </Text>

                  {/* Brand Chips */}
                  <View style={styles.chipsRow}>
                    {method.chips.map((chip, idx) => (
                      <View
                        key={idx}
                        style={[
                          styles.chipPill,
                          isDisabled && styles.chipPillDisabled,
                        ]}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            isDisabled && styles.chipTextDisabled,
                          ]}
                        >
                          {chip}
                        </Text>
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
  prepaidNoticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#effdf0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#c6e7c9',
  },
  prepaidNoticeText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#005223',
    flex: 1,
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
  cardDisabled: {
    borderColor: '#e2e7e2',
    backgroundColor: '#fbfcfb',
    opacity: 0.75,
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
  radioCircleDisabled: {
    borderWidth: 1.5,
    borderColor: '#c8d2c8',
    backgroundColor: '#edf2ed',
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
  cardTitleDisabled: {
    color: '#556055',
  },
  methodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 999,
  },
  badgeFastest: {
    backgroundColor: '#88faa0',
  },
  badgeSeat: {
    backgroundColor: '#deecdf',
  },
  badgeDisabled: {
    backgroundColor: '#fef3f2',
    borderWidth: 1,
    borderColor: '#fee4e2',
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
  badgeTextDisabled: {
    color: '#b42318',
  },
  cardDescription: {
    fontSize: 12,
    color: '#3e4a3e',
    lineHeight: 17,
    marginTop: 4,
  },
  cardDescriptionDisabled: {
    color: '#6e7a6e',
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
  chipPillDisabled: {
    backgroundColor: '#f0f3f0',
    borderWidth: 0.5,
    borderColor: '#dbe2db',
  },
  chipText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#3e4a3e',
  },
  chipTextDisabled: {
    color: '#707d70',
  },
});

export default PaymentMethodSelector;
