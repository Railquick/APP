import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useOrder } from '../context/OrderContext';
import { useJourney } from '../context/JourneyContext';
import CheckoutHeader from '../components/common/CheckoutHeader';
import StepProgressHeader from '../components/common/StepProgressHeader';
import SuccessHeadlineBanner from '../components/tracking/SuccessHeadlineBanner';
import TrainHaltHeroCard from '../components/tracking/TrainHaltHeroCard';
import StationFulfillmentTimeline from '../components/tracking/StationFulfillmentTimeline';
import RunnerProfileCard from '../components/tracking/RunnerProfileCard';
import OrderSummaryAccordion from '../components/tracking/OrderSummaryAccordion';
import DepartureGuaranteePolicy from '../components/tracking/DepartureGuaranteePolicy';
import TrackingBottomActions from '../components/tracking/TrackingBottomActions';
import { SupportHelpButton } from '../components/common/SupportHelpButton';
import { DEFAULT_RUNNER, generateTrackingSteps } from '../services/trackingService';

interface OrderConfirmationScreenProps {
  onNavigateHome: () => void;
}

export const OrderConfirmationScreen: React.FC<OrderConfirmationScreenProps> = ({
  onNavigateHome,
}) => {
  const { activeOrder } = useOrder();
  const { journey } = useJourney();

  // Fallback demo order for direct preview/testing if no active order is set
  const orderId = activeOrder?.orderId || 'RQ-88219';
  const otp = activeOrder?.otp || '4829';
  const runner = activeOrder?.runner || DEFAULT_RUNNER;
  const currentJourney = activeOrder?.journey || journey;

  const trackingSteps =
    activeOrder?.trackingSteps ||
    generateTrackingSteps(
      currentJourney.station,
      currentJourney.coach,
      currentJourney.berth,
      currentJourney.platform,
      otp,
      'RQ82'
    );

  const items = activeOrder?.items || [
    {
      id: 'prod-cable',
      name: 'Fast 65W Type-C Braided Cable',
      quantity: 1,
      price: 149,
      mrp: 299,
      subtotal: 149,
    },
    {
      id: 'prod-ors',
      name: 'Cipla ORS Electral Sachet',
      quantity: 1,
      price: 20,
      mrp: 20,
      subtotal: 20,
    },
    {
      id: 'prod-lays',
      name: 'Lays Spanish Tomato / Classic',
      quantity: 1,
      price: 20,
      mrp: 20,
      subtotal: 20,
    },
  ];

  const totalAmount = activeOrder?.totalAmount || 189;
  const paymentMethodTitle =
    activeOrder?.payment.methodTitle || 'UPI • Razorpay';

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Fixed Header */}
      <CheckoutHeader
        title="Live Delivery Tracking"
        onBackPress={onNavigateHome}
      />

      {/* Sticky Step Progress Tracker (Step 3 Active) */}
      <StepProgressHeader currentStep={3} />

      {/* Scrollable Tracking Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.innerContent}>
          {/* Order Verified Headline Banner */}
          <SuccessHeadlineBanner
            orderId={orderId}
            statusBadge={activeOrder?.statusBadge || 'Placed - Delivery at Hazrat Nizamuddin'}
            deliveryOtp={otp}
          />

          {/* Train, Berth & Station Countdown Hero Card */}
          <TrainHaltHeroCard journey={currentJourney} />

          {/* Station Fulfillment & Live Tracking Timeline */}
          <StationFulfillmentTimeline steps={trackingSteps} otp={otp} />

          {/* Assigned Station Runner Profile Card */}
          <RunnerProfileCard
            runner={runner}
            coach={currentJourney.coach}
            berth={currentJourney.berth}
            orderId={orderId}
          />

          {/* Contact Station Runner & 24x7 Support Widget */}
          <SupportHelpButton
            variant="contextual"
            title={`Contact your ${currentJourney.station || 'Hazrat Nizamuddin'} station runner`}
            subtitle={`Runner ${runner.name} is on platform standby. Need emergency berth delivery coordination or halt details?`}
            stationName={currentJourney.station}
            runnerName={runner.name}
            orderId={orderId}
            coach={currentJourney.coach}
            berth={currentJourney.berth}
          />

          {/* Order Summary Collapsible Accordion */}
          <OrderSummaryAccordion
            items={items}
            totalAmount={totalAmount}
            paymentMethodTitle={paymentMethodTitle}
          />

          {/* 100% Departure Guarantee Policy */}
          <DepartureGuaranteePolicy
            coach={currentJourney.coach}
            station={currentJourney.station}
          />

          {/* Action Buttons: Help & Back to Home */}
          <TrackingBottomActions
            onBackToHome={onNavigateHome}
            station={currentJourney.station}
            runnerName={runner.name}
            orderId={orderId}
            coach={currentJourney.coach}
            berth={currentJourney.berth}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#effdf0',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
  },
  innerContent: {
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
    gap: 12,
  },
});

export default OrderConfirmationScreen;
