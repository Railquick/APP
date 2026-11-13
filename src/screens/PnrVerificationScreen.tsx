import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  Keyboard,
} from 'react-native';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Receipt,
  CheckCircle2,
  RefreshCw,
  MapPin,
  Clock,
  Zap,
  ArrowRight,
  Compass,
  Train,
  IndianRupee,
  Phone,
  MessageSquare,
  Star,
  Check,
  X,
  Search,
  Sparkles,
} from 'lucide-react-native';
import {
  DEMO_PNR_RECORDS,
  PnrDemoRecord,
  lookupPnrDetails,
  isStationServiceable,
} from '../data/pnrDemoData';
import { useJourney } from '../context/JourneyContext';
import { verifyPNR } from '../services/trainService';

interface PnrVerificationScreenProps {
  onContinueToMarketplace: () => void;
  onStationComingSoon: (record: PnrDemoRecord) => void;
}

export const PnrVerificationScreen: React.FC<PnrVerificationScreenProps> = ({
  onContinueToMarketplace,
  onStationComingSoon,
}) => {
  const { setJourney } = useJourney();

  // PNR flow state
  // Initial state: User must enter PNR first.
  const [pnrInput, setPnrInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [verifiedRecord, setVerifiedRecord] = useState<PnrDemoRecord | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Format PNR as XXXX-XXXX-XX or clean digits
  const handlePnrChange = (text: string) => {
    // Keep only numbers and hyphens
    const cleaned = text.replace(/[^0-9]/g, '');
    setPnrInput(cleaned);
    setErrorMessage(null);
  };

  const handleFetchPnrDetails = async (pnrToFetch?: string) => {
    const target = (pnrToFetch || pnrInput).trim();
    const digitsOnly = target.replace(/[^0-9]/g, '');

    if (digitsOnly.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit Indian Railways PNR number');
      return;
    }

    Keyboard.dismiss();
    setIsLoading(true);
    setErrorMessage(null);
    setVerifiedRecord(null);

    try {
      const res = await verifyPNR(digitsOnly);

      const record: PnrDemoRecord = {
        pnr: res.pnr,
        trainNumber: res.train_number,
        trainName: res.train_name,
        station: 'Hazrat Nizamuddin (NZM)',
        stationCode: res.station_code || 'NZM',
        platform: 'PF 1',
        coach: res.coach || 'B2',
        berth: res.seat || '36',
        berthType: 'Confirmed Seat',
        deliveryMinutes: 5,
        haltMinutes: 5,
        scheduledArrivalMins: 14,
        haltDurationMins: 5,
        statusText: res.pnr_status || 'CONFIRMED BERTH',
        passengerName: 'Passenger',
        isLive: true,
        arrivalTime: res.arrival_time || '16:30',
      };

      setVerifiedRecord(record);

      // On success, update JourneyContext with returned train_name, train_number, coach, seat, station_code ('NZM'), and arrivalTime
      setJourney({
        pnr: record.pnr,
        trainNumber: record.trainNumber,
        trainName: record.trainName,
        station: record.station,
        stationCode: record.stationCode,
        platform: record.platform,
        coach: record.coach,
        berth: record.berth,
        berthType: record.berthType,
        passengerName: record.passengerName,
        passengerPhone: '9876543210',
        deliveryMinutes: record.deliveryMinutes,
        haltMinutes: record.haltMinutes,
        scheduledArrivalMins: record.scheduledArrivalMins,
        haltDurationMins: record.haltDurationMins,
        statusText: record.statusText,
        arrivalTime: record.arrivalTime,
      });
    } catch (err: any) {
      const errorMsg =
        err?.message ||
        'RailQuick delivery is currently available only for trains halting at Hazrat Nizamuddin (NZM)';
      setErrorMessage(errorMsg);
      Alert.alert('Delivery Unavailable', errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDemoPnr = (record: PnrDemoRecord) => {
    const cleanDigits = record.pnr.replace(/[^0-9]/g, '');
    setPnrInput(cleanDigits);
    setErrorMessage(null);
    handleFetchPnrDetails(cleanDigits);
  };

  const handleResetPnr = () => {
    setVerifiedRecord(null);
    setPnrInput('');
    setErrorMessage(null);
  };

  const handleContinueOrder = () => {
    if (!verifiedRecord) return;

    // Sync the verified journey data to JourneyContext
    setJourney({
      pnr: verifiedRecord.pnr,
      trainNumber: verifiedRecord.trainNumber,
      trainName: verifiedRecord.trainName,
      station: verifiedRecord.station,
      stationCode: verifiedRecord.stationCode,
      platform: verifiedRecord.platform,
      coach: verifiedRecord.coach,
      berth: verifiedRecord.berth,
      berthType: verifiedRecord.berthType,
      passengerName: verifiedRecord.passengerName,
      passengerPhone: '9876543210',
      deliveryMinutes: verifiedRecord.deliveryMinutes,
      haltMinutes: verifiedRecord.haltMinutes,
      scheduledArrivalMins: verifiedRecord.scheduledArrivalMins,
      haltDurationMins: verifiedRecord.haltDurationMins,
      statusText: verifiedRecord.statusText,
      arrivalTime: verifiedRecord.arrivalTime || '16:30',
    });

    // If station is NZM (Hazrat Nizamuddin) -> Marketplace
    // If not NZM -> Coming Soon screen
    if (
      isStationServiceable(verifiedRecord.stationCode) ||
      isStationServiceable(verifiedRecord.station)
    ) {
      onContinueToMarketplace();
    } else {
      onStationComingSoon(verifiedRecord);
    }
  };

  const handleUtilityPress = (type: string) => {
    const station = verifiedRecord?.station || 'Hazrat Nizamuddin (NZM)';
    const train = verifiedRecord?.trainName || '12424 • DBRT Rajdhani Express';
    const platform = verifiedRecord?.platform || 'PF 1';

    switch (type) {
      case 'platform':
        Alert.alert(
          'Platform Locator',
          `${train}\nExpected Platform: ${platform} at ${station}.\nCoaches B1-B4 stop near middle overhead bridge.`
        );
        break;
      case 'refund':
        Alert.alert(
          'IRCTC Refund Calculator',
          'TDR and cancellation refund estimator based on official Indian Railways charts.'
        );
        break;
      case 'timetable':
        Alert.alert(
          'Train Schedule & Halt',
          `${train}\nStation: ${station}\nArrival: in 14 mins\nHalt Duration: 5 minutes.`
        );
        break;
      case 'helpline':
        Alert.alert(
          'Railways Helpline',
          'Railway Security / Medical / Assistance: Dial 139.\nRailQuick Coach Support: +91 800-RAIL-QUICK'
        );
        break;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ================= 1. HERO HEADER AREA ================= */}
        <View style={styles.heroWrapper}>
          {/* Background train/platform atmosphere */}
          <Image
            source={require('../assets/images/vande_bharat_banner.jpg')}
            style={styles.heroBackground}
            contentFit="cover"
          />

          {/* Clean fade gradient overlay */}
          <LinearGradient
            colors={['rgba(240, 248, 242, 0.45)', 'rgba(235, 245, 238, 0.92)', '#EBF5EE']}
            locations={[0, 0.65, 1]}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.heroContent}>
            {/* Berth Express Hub Badge */}
            <View style={styles.hubBadge}>
              <Zap size={13} color="#159447" fill="#159447" />
              <Text style={styles.hubBadgeText}>BERTH EXPRESS HUB</Text>
            </View>

            {/* Main Headline */}
            <Text style={styles.heroTitle}>
              Delivered to <Text style={styles.heroTitleAccent}>your</Text>{'\n'}seat.
            </Text>

            {/* Subtitle */}
            <Text style={styles.heroSubtitle}>
              Tasty snacks, drinks, chargers & comfort kits delivered right to your coach.
            </Text>
          </View>
        </View>

        {/* ================= 2. PNR ENTRY & VERIFICATION CARD ================= */}
        <View style={styles.pnrCard}>
          {/* Header Row */}
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderLeft}>
              <View style={styles.receiptIconCircle}>
                <Receipt size={16} color="#159447" strokeWidth={2.4} />
              </View>
              <Text style={styles.cardHeaderLabel}>PNR / Ticket Number</Text>
            </View>

            {verifiedRecord && (
              <View style={styles.verifiedBadge}>
                <CheckCircle2 size={13} color="#159447" strokeWidth={2.6} />
                <Text style={styles.verifiedBadgeText}>Verified</Text>
              </View>
            )}
          </View>

          {/* --- CASE A: USER HAS NOT VERIFIED YET (INPUT MODE) --- */}
          {!verifiedRecord && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputInstruction}>
                Enter your 10-digit PNR to detect your train, station, coach & berth:
              </Text>

              {/* Text Input Row */}
              <View
                style={[
                  styles.textInputWrapper,
                  errorMessage ? styles.textInputError : null,
                ]}
              >
                <TextInput
                  value={pnrInput}
                  onChangeText={handlePnrChange}
                  placeholder="e.g. 2458910236"
                  placeholderTextColor="#94A3B8"
                  style={styles.pnrTextInput}
                  keyboardType="numeric"
                  maxLength={10}
                  editable={!isLoading}
                  autoFocus={false}
                />
                {pnrInput.length > 0 && !isLoading && (
                  <TouchableOpacity
                    onPress={() => setPnrInput('')}
                    style={styles.clearBtn}
                  >
                    <X size={16} color="#94A3B8" />
                  </TouchableOpacity>
                )}
              </View>

              {errorMessage && (
                <Text style={styles.errorText}>{errorMessage}</Text>
              )}

              {/* Loading State Spinner */}
              {isLoading && (
                <View style={styles.loadingBox}>
                  <ActivityIndicator size="small" color="#159447" />
                  <Text style={styles.loadingText}>
                    Fetching live IRCTC journey details...
                  </Text>
                </View>
              )}

              {/* Submit / Check PNR Button */}
              {!isLoading && (
                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={() => handleFetchPnrDetails()}
                  disabled={pnrInput.length === 0}
                  style={[
                    styles.fetchDetailsBtn,
                    pnrInput.length === 0 ? styles.fetchDetailsBtnDisabled : null,
                  ]}
                >
                  <Search size={16} color="#FFFFFF" strokeWidth={2.5} />
                  <Text style={styles.fetchDetailsBtnText}>
                    Fetch Journey Details
                  </Text>
                </TouchableOpacity>
              )}

              {/* Quick Preset Station Test Chips */}
              <View style={styles.quickPresetsSection}>
                <Text style={styles.quickPresetsTitle}>
                  TEST WITH DEMO PNR:
                </Text>
                <View style={styles.presetChipsRow}>
                  {/* NZM (Live) */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleSelectDemoPnr(DEMO_PNR_RECORDS[0])}
                    style={[styles.presetChip, styles.presetChipLive]}
                  >
                    <View style={[styles.chipDot, { backgroundColor: '#159447' }]} />
                    <Text style={styles.presetChipTextBold}>NZM (Hazrat Nizamuddin)</Text>
                    <View style={styles.liveTagPill}>
                      <Text style={styles.liveTagPillText}>LIVE</Text>
                    </View>
                  </TouchableOpacity>

                  {/* Kanpur Central (Coming Soon) */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleSelectDemoPnr(DEMO_PNR_RECORDS[1])}
                    style={[styles.presetChip, styles.presetChipSoon]}
                  >
                    <View style={[styles.chipDot, { backgroundColor: '#EA580C' }]} />
                    <Text style={styles.presetChipText}>Kanpur Central (CNB)</Text>
                    <View style={styles.soonTagPill}>
                      <Text style={styles.soonTagPillText}>SOON</Text>
                    </View>
                  </TouchableOpacity>

                  {/* New Delhi (Coming Soon) */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleSelectDemoPnr(DEMO_PNR_RECORDS[2])}
                    style={[styles.presetChip, styles.presetChipSoon]}
                  >
                    <View style={[styles.chipDot, { backgroundColor: '#EA580C' }]} />
                    <Text style={styles.presetChipText}>New Delhi (NDLS)</Text>
                    <View style={styles.soonTagPill}>
                      <Text style={styles.soonTagPillText}>SOON</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* --- CASE B: PNR VERIFIED -> SHOW TRAIN DETAILS & CONTINUE BUTTON --- */}
          {verifiedRecord && (
            <View style={styles.verifiedSection}>
              {/* PNR Number Display & Change Button */}
              <View style={styles.pnrInputRow}>
                <Text style={styles.pnrNumberText}>{verifiedRecord.pnr}</Text>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleResetPnr}
                  style={styles.updateButton}
                >
                  <RefreshCw size={13} color="#159447" strokeWidth={2.4} />
                  <Text style={styles.updateButtonText}>Change</Text>
                </TouchableOpacity>
              </View>

              {/* Train & Station Details Box */}
              <View style={styles.trainDetailsBox}>
                {/* Train Name & Halt Badge */}
                <View style={styles.trainTitleRow}>
                  <Text style={styles.trainNameText} numberOfLines={1}>
                    {verifiedRecord.trainName}
                  </Text>
                  <View style={styles.haltBadge}>
                    <Zap size={11} color="#D97706" fill="#D97706" />
                    <Text style={styles.haltBadgeText}>
                      {verifiedRecord.haltDurationMins}m Halt
                    </Text>
                  </View>
                </View>

                {/* Station & Arrival Time */}
                <View style={styles.stationRow}>
                  <MapPin size={14} color="#159447" style={styles.stationIcon} />
                  <Text style={styles.stationText} numberOfLines={1}>
                    {verifiedRecord.station} ({verifiedRecord.platform}) •
                  </Text>
                  <Text style={styles.arrivingText}>
                    {' '}Arriving in {verifiedRecord.scheduledArrivalMins} mins
                  </Text>
                </View>

                {/* Allocated Berth Sub-Card */}
                <View style={styles.berthSubCard}>
                  <View style={styles.seatIconCircle}>
                    <Train size={16} color="#159447" strokeWidth={2.4} />
                  </View>
                  <View style={styles.berthInfoColumn}>
                    <Text style={styles.berthLabel}>Allocated Berth</Text>
                    <Text style={styles.berthValueText}>
                      Coach {verifiedRecord.coach} • Berth {verifiedRecord.berth} (
                      {verifiedRecord.berthType.includes('Lower') ? 'LB' : 'MB'})
                    </Text>
                  </View>
                  <View style={styles.seatVerifiedBadge}>
                    <Text style={styles.seatVerifiedText}>Seat Verified</Text>
                  </View>
                </View>
              </View>

              {/* Continue Order CTA Button (ONLY VISIBLE ONCE PNR IS GIVEN) */}
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={handleContinueOrder}
                style={styles.continueButton}
              >
                <Text style={styles.continueButtonText}>Continue Order</Text>
                <ArrowRight size={17} color="#FFFFFF" strokeWidth={2.6} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ================= 3. TRAVEL UTILITIES ================= */}
        <View style={styles.sectionWrapper}>
          <View style={styles.sectionHeader}>
            <Compass size={16} color="#159447" />
            <Text style={styles.sectionHeaderText}>TRAVEL UTILITIES</Text>
          </View>

          <View style={styles.utilitiesRow}>
            {/* Utility 1: Platform */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleUtilityPress('platform')}
              style={styles.utilityCard}
            >
              <View style={[styles.utilityIconBox, { backgroundColor: '#E7F8EE' }]}>
                <Train size={20} color="#159447" strokeWidth={2.2} />
              </View>
              <Text style={styles.utilityLabel}>Platform</Text>
            </TouchableOpacity>

            {/* Utility 2: Refund Calc */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleUtilityPress('refund')}
              style={styles.utilityCard}
            >
              <View style={[styles.utilityIconBox, { backgroundColor: '#E8F5F1' }]}>
                <IndianRupee size={20} color="#0D9488" strokeWidth={2.2} />
              </View>
              <Text style={styles.utilityLabel}>Refund Calc</Text>
            </TouchableOpacity>

            {/* Utility 3: Timetable */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleUtilityPress('timetable')}
              style={styles.utilityCard}
            >
              <View style={[styles.utilityIconBox, { backgroundColor: '#E8F5F1' }]}>
                <Clock size={20} color="#0D9488" strokeWidth={2.2} />
              </View>
              <Text style={styles.utilityLabel}>Timetable</Text>
            </TouchableOpacity>

            {/* Utility 4: Helpline */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleUtilityPress('helpline')}
              style={styles.utilityCard}
            >
              <View style={[styles.utilityIconBox, { backgroundColor: '#FEE2E2' }]}>
                <Phone size={20} color="#DC2626" strokeWidth={2.2} />
              </View>
              <Text style={styles.utilityLabel}>Helpline</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ================= 4. WHAT OUR CUSTOMERS SAY ================= */}
        <View style={styles.sectionWrapper}>
          <View style={styles.sectionHeader}>
            <MessageSquare size={16} color="#159447" />
            <Text style={styles.sectionHeaderText}>WHAT OUR CUSTOMERS SAY</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.reviewsScrollContent}
          >
            {/* Review 1 */}
            <View style={styles.reviewCard}>
              <View style={styles.reviewUserRow}>
                <View style={[styles.avatarCircle, { backgroundColor: '#DCFCE7' }]}>
                  <Text style={[styles.avatarText, { color: '#159447' }]}>V</Text>
                </View>
                <View style={styles.userInfoCol}>
                  <Text style={styles.userName}>Varun</Text>
                  <Text style={styles.userRole}>Regular Commuter</Text>
                </View>
                <View style={styles.verifiedReviewBadge}>
                  <Check size={11} color="#159447" strokeWidth={3} />
                  <Text style={styles.verifiedReviewText}>Verified</Text>
                </View>
              </View>
              <Text style={styles.reviewQuote}>
                "Finding trusted products during a train journey is always a problem. RailQuick makes it simple, reliable, and stress-free."
              </Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={14} color="#F59E0B" fill="#F59E0B" />
                ))}
              </View>
            </View>

            {/* Review 2 */}
            <View style={styles.reviewCard}>
              <View style={styles.reviewUserRow}>
                <View style={[styles.avatarCircle, { backgroundColor: '#FEF3C7' }]}>
                  <Text style={[styles.avatarText, { color: '#D97706' }]}>G</Text>
                </View>
                <View style={styles.userInfoCol}>
                  <Text style={styles.userName}>Gaurav</Text>
                  <Text style={styles.userRole}>Business Traveler</Text>
                </View>
                <View style={styles.verifiedReviewBadge}>
                  <Check size={11} color="#159447" strokeWidth={3} />
                  <Text style={styles.verifiedReviewText}>Verified</Text>
                </View>
              </View>
              <Text style={styles.reviewQuote}>
                "Knowing that products are sealed gives confidence. Never miss a beat and get genuine items delivered right at coach."
              </Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={14} color="#F59E0B" fill="#F59E0B" />
                ))}
              </View>
            </View>

            {/* Review 3 */}
            <View style={styles.reviewCard}>
              <View style={styles.reviewUserRow}>
                <View style={[styles.avatarCircle, { backgroundColor: '#FCE7F3' }]}>
                  <Text style={[styles.avatarText, { color: '#DB2777' }]}>P</Text>
                </View>
                <View style={styles.userInfoCol}>
                  <Text style={styles.userName}>Priya</Text>
                  <Text style={styles.userRole}>Solo Traveler</Text>
                </View>
                <View style={styles.verifiedReviewBadge}>
                  <Check size={11} color="#159447" strokeWidth={3} />
                  <Text style={styles.verifiedReviewText}>Verified</Text>
                </View>
              </View>
              <Text style={styles.reviewQuote}>
                "Delivery right at my berth in coach B2! Runner was polite and arrived within 3 minutes of the train halting at NZM."
              </Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={14} color="#F59E0B" fill="#F59E0B" />
                ))}
              </View>
            </View>
          </ScrollView>
        </View>

        {/* ================= 5. FOOTER ================= */}
        <View style={styles.footerWrapper}>
          <Text style={styles.footerHeading}>Happy Travel!</Text>
          <Text style={styles.footerSubText}>See you on your train ride. ❤️</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EBF5EE',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // 1. Hero Area
  heroWrapper: {
    position: 'relative',
    height: 230,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 22,
  },
  heroBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    height: 230,
  },
  heroContent: {
    zIndex: 10,
  },
  hubBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#E7F8EE',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#C3EDD1',
    marginBottom: 8,
  },
  hubBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#159447',
    letterSpacing: 0.6,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0F172A',
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  heroTitleAccent: {
    color: '#159447',
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#475569',
    marginTop: 6,
    lineHeight: 18,
    maxWidth: 320,
  },

  // 2. Main PNR Card
  pnrCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 4,
    borderRadius: 22,
    padding: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  receiptIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#E7F8EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E7F8EE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  verifiedBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#159447',
  },

  // Input Mode Styles
  inputContainer: {
    marginTop: 2,
  },
  inputInstruction: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
    marginBottom: 10,
  },
  textInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
    marginBottom: 8,
  },
  textInputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  pnrTextInput: {
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  clearBtn: {
    padding: 6,
  },
  errorText: {
    fontSize: 11.5,
    color: '#EF4444',
    fontWeight: '600',
    marginBottom: 8,
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    paddingVertical: 14,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#159447',
  },
  fetchDetailsBtn: {
    backgroundColor: '#159447',
    borderRadius: 14,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
    shadowColor: '#159447',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  },
  fetchDetailsBtnDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  fetchDetailsBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Quick Preset Chips
  quickPresetsSection: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  quickPresetsTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  presetChipsRow: {
    gap: 8,
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 8,
  },
  presetChipLive: {
    borderColor: '#86EFAC',
    backgroundColor: '#F0FDF4',
  },
  presetChipSoon: {
    borderColor: '#FED7AA',
    backgroundColor: '#FFF7ED',
  },
  chipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  presetChipTextBold: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    flex: 1,
  },
  liveTagPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  liveTagPillText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#159447',
  },
  soonTagPill: {
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  soonTagPillText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#EA580C',
  },

  // Verified Section
  verifiedSection: {
    marginTop: 2,
  },
  pnrInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0FDF4',
    borderWidth: 1.2,
    borderColor: '#DCFCE7',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
  },
  pnrNumberText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 1.5,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  updateButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#159447',
  },

  // Train Details Box
  trainDetailsBox: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    marginBottom: 14,
  },
  trainTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  trainNameText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
  },
  haltBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  haltBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D97706',
  },
  stationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  stationIcon: {
    marginRight: 4,
  },
  stationText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  arrivingText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#159447',
  },

  // Allocated Berth Card
  berthSubCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  seatIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#E7F8EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  berthInfoColumn: {
    flex: 1,
  },
  berthLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
  },
  berthValueText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 1,
  },
  seatVerifiedBadge: {
    backgroundColor: '#E7F8EE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  seatVerifiedText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#159447',
  },

  // Continue CTA
  continueButton: {
    backgroundColor: '#006B2F',
    borderRadius: 14,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#006B2F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 4,
  },
  continueButtonText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // 3. Travel Utilities Section
  sectionWrapper: {
    marginHorizontal: 16,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 12,
  },
  sectionHeaderText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#159447',
    letterSpacing: 0.8,
  },
  utilitiesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  utilityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    width: '23%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  utilityIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  utilityLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    textAlign: 'center',
  },

  // 4. Customer Reviews
  reviewsScrollContent: {
    gap: 12,
    paddingRight: 10,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    width: 260,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  reviewUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '900',
  },
  userInfoCol: {
    flex: 1,
  },
  userName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  userRole: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 1,
  },
  verifiedReviewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#E7F8EE',
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 8,
  },
  verifiedReviewText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#159447',
  },
  reviewQuote: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 17,
    fontStyle: 'italic',
    marginBottom: 10,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },

  // 5. Footer
  footerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 34,
    paddingBottom: 16,
  },
  footerHeading: {
    fontSize: 22,
    fontWeight: '900',
    color: '#94A3B8',
    letterSpacing: -0.5,
  },
  footerSubText: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '600',
  },
});

export default PnrVerificationScreen;
