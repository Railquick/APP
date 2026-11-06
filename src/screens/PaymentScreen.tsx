import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useCart } from '../context/CartContext';
import { useJourney } from '../context/JourneyContext';
import { useOrder } from '../context/OrderContext';
import { PaymentMethodId } from '../types/payment';
import CheckoutHeader from '../components/common/CheckoutHeader';
import StepProgressHeader from '../components/common/StepProgressHeader';
import TrainSummaryMiniCard from '../components/payment/TrainSummaryMiniCard';
import PaymentMethodSelector from '../components/payment/PaymentMethodSelector';
import BerthDeliverySecurity from '../components/payment/BerthDeliverySecurity';
import PaymentSummaryCard from '../components/payment/PaymentSummaryCard';
import PaymentFloatingBottomBar from '../components/payment/PaymentFloatingBottomBar';

interface PaymentScreenProps {
  onNavigateBack: () => void;
  onPaymentSuccess: () => void;
}

export const PaymentScreen: React.FC<PaymentScreenProps> = ({
  onNavigateBack,
  onPaymentSuccess,
}) => {
  const { summary } = useCart();
  const { journey } = useJourney();
  const { placeOrder, isPlacingOrder } = useOrder();

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodId>('razorpay');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const handlePay = async () => {
    if (isPlacingOrder || isSuccess) return;

    try {
      await placeOrder(selectedMethod);
      setIsSuccess(true);

      // Brief delay to show "Order Placed!" feedback before transitioning
      setTimeout(() => {
        onPaymentSuccess();
      }, 750);
    } catch (err: any) {
      Alert.alert(
        'Payment Failed',
        err?.message || 'Could not process transaction. Please select another method.',
        [{ text: 'Try Again' }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Fixed Header */}
      <CheckoutHeader
        title="Cart & Checkout"
        onBackPress={onNavigateBack}
      />

      {/* Step Progress Tracker (Step 2 Active) */}
      <StepProgressHeader currentStep={2} />

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.innerContent}>
          {/* Train & Berth Mini-Card */}
          <TrainSummaryMiniCard
            journey={journey}
            totalCount={summary.totalCount}
            totalPayable={summary.totalPayable}
          />

          {/* Payment Method Selector */}
          <PaymentMethodSelector
            selectedMethod={selectedMethod}
            onSelectMethod={setSelectedMethod}
            coach={journey.coach}
            berth={journey.berth}
            station={journey.station}
          />

          {/* Berth Delivery Security Notice */}
          <BerthDeliverySecurity />

          {/* Payment Summary */}
          <PaymentSummaryCard summary={summary} />
        </View>
      </ScrollView>

      {/* Floating Bottom Bar */}
      <PaymentFloatingBottomBar
        coach={journey.coach}
        berth={journey.berth}
        totalPayable={summary.totalPayable}
        totalCount={summary.totalCount}
        selectedMethod={selectedMethod}
        isProcessing={isPlacingOrder}
        isSuccess={isSuccess}
        onPayPress={handlePay}
      />
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
});

export default PaymentScreen;

