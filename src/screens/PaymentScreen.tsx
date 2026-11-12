import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Linking } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useCart } from '../context/CartContext';
import { useJourney } from '../context/JourneyContext';
import { useOrder } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { Order } from '../types/order';
import { PaymentMethodId } from '../types/payment';
import { paymentService } from '../services/paymentService';
import CheckoutHeader from '../components/common/CheckoutHeader';
import StepProgressHeader from '../components/common/StepProgressHeader';
import TrainSummaryMiniCard from '../components/payment/TrainSummaryMiniCard';
import PassengerContactCard from '../components/payment/PassengerContactCard';
import PaymentMethodSelector from '../components/payment/PaymentMethodSelector';
import BerthDeliverySecurity from '../components/payment/BerthDeliverySecurity';
import PaymentSummaryCard from '../components/payment/PaymentSummaryCard';
import PaymentFloatingBottomBar from '../components/payment/PaymentFloatingBottomBar';
import { SupportHelpModal } from '../components/common/SupportHelpButton';

interface PaymentScreenProps {
  onNavigateBack: () => void;
  onPaymentSuccess: () => void;
}

export const PaymentScreen: React.FC<PaymentScreenProps> = ({
  onNavigateBack,
  onPaymentSuccess,
}) => {
  const { summary, clearCart } = useCart();
  const { journey, updatePassenger } = useJourney();
  const { placeOrder, isPlacingOrder } = useOrder();
  const { user, updateProfile } = useAuth();

  // NZM Pilot: Default to PhonePe / UPI Online Payment (Pre-paid required)
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodId>('phonepe');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);
  const [passengerName, setPassengerName] = useState<string>(
    user?.name || journey.passengerName || 'Passenger'
  );
  const [passengerPhone, setPassengerPhone] = useState<string>(
    user?.phone || user?.phoneNumber || journey.passengerPhone || ''
  );
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [supportModalVisible, setSupportModalVisible] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  // Sync state if user profile is loaded asynchronously
  useEffect(() => {
    if (user?.name && (!passengerName || passengerName === 'Passenger')) {
      setPassengerName(user.name);
    }
    if ((user?.phone || user?.phoneNumber) && !passengerPhone) {
      setPassengerPhone(user.phone || user.phoneNumber || '');
    }
  }, [user]);

  const handlePay = async () => {
    if (isPlacingOrder || isSuccess || isRedirecting) return;

    // Strict guard against COD submission during NZM pilot phase
    if (selectedMethod === 'cod') {
      Alert.alert(
        'Prepaid Only for NZM Pilot',
        'Pay at berth is unavailable during the 5-minute halt at Hazrat Nizamuddin. Please use PhonePe / UPI for fast handover.',
        [{ text: 'OK' }]
      );
      setSelectedMethod('phonepe');
      return;
    }

    setCheckoutError(null);
    const cleanPhone = passengerPhone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setCheckoutError('Please enter a valid 10-digit mobile number for berth delivery updates.');
      Alert.alert(
        'Invalid Mobile Number',
        'Please enter a valid 10-digit mobile number so the platform runner can reach your berth.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Save passenger details in context
    updatePassenger(passengerName, cleanPhone);

    // Save/update phone number in user profile (Supabase / profiles table)
    if (updateProfile) {
      updateProfile(passengerName || user?.name || '', cleanPhone).catch((err) => {
        console.warn('Background profile phone sync error:', err);
      });
    }

    // If cart total changed since initial order creation, reset cached order reference
    let orderToPay = createdOrder;
    if (orderToPay && orderToPay.totalAmount !== summary.totalPayable) {
      orderToPay = null;
      setCreatedOrder(null);
    }

    try {
      // 1. Create and persist order record if not already created
      // Crucial: Pass { shouldClearCart: false } so cart items and total are preserved!
      if (!orderToPay) {
        orderToPay = await placeOrder(
          selectedMethod,
          {
            name: passengerName,
            phone: cleanPhone,
          },
          { shouldClearCart: false }
        );
        setCreatedOrder(orderToPay);
      }

      // 2. Initiate PhonePe payment session
      setIsRedirecting(true);
      try {
        const paymentUrl = await paymentService.initiatePhonePePayment(
          orderToPay.orderId,
          summary.totalPayable
        );

        if (paymentUrl) {
          // 3. ONLY call clearCart() after PhonePe initiation returns a valid payment_url and just before redirecting!
          clearCart();

          // Redirect user to PhonePe standard gateway
          if (typeof window !== 'undefined') {
            window.location.href = paymentUrl;
          } else {
            await Linking.openURL(paymentUrl);
          }
          return;
        } else {
          throw new Error('PhonePe gateway did not provide a valid redirect URL.');
        }
      } catch (gatewayErr: any) {
        console.warn('PhonePe gateway redirect error:', gatewayErr);
        setIsRedirecting(false);
        // Cart is NOT cleared - keep cart items and total amount intact so user can retry!
        const errorMsg =
          gatewayErr?.message ||
          'Unable to connect to PhonePe gateway. Please retry or contact support.';
        setCheckoutError(errorMsg);
        Alert.alert('Payment Gateway Issue', errorMsg, [{ text: 'OK' }]);
        return;
      }

      // If online redirect was skipped or for instant success fallback:
      clearCart();
      setIsSuccess(true);
      setTimeout(() => {
        onPaymentSuccess();
      }, 750);
    } catch (err: any) {
      setIsRedirecting(false);
      const errorMsg =
        err?.message ||
        'Could not process order. Please retry or choose another payment method.';
      setCheckoutError(errorMsg);

      const isCapacityError = errorMsg.includes('capacity');
      Alert.alert(
        isCapacityError ? 'NZM Hub at Full Capacity' : 'Order Placement Issue',
        errorMsg,
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Fixed Header with 24x7 Station Support trigger */}
      <CheckoutHeader
        title="Cart & Checkout"
        onBackPress={onNavigateBack}
        onSupportPress={() => setSupportModalVisible(true)}
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

          {/* Passenger & Station Contact Details */}
          <PassengerContactCard
            journey={journey}
            passengerName={passengerName}
            passengerPhone={passengerPhone}
            onNameChange={setPassengerName}
            onPhoneChange={setPassengerPhone}
            errorMessage={checkoutError}
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
        isRedirecting={isRedirecting}
        onPayPress={handlePay}
      />

      {/* Header Support Modal */}
      <SupportHelpModal
        visible={supportModalVisible}
        onClose={() => setSupportModalVisible(false)}
        stationName={journey.station}
        coach={journey.coach}
        berth={journey.berth}
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
