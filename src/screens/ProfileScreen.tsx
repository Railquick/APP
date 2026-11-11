import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Package,
  HelpCircle,
  MapPin,
  Train,
  Heart,
  LogOut,
  ChevronRight,
  ChevronDown,
  Edit3,
  Check,
  X,
  MessageSquare,
  Plus,
  Trash2,
  ShoppingBag,
  ShieldCheck,
  Headphones,
  Sparkles,
  Zap,
  Moon,
  Sliders,
  Smartphone,
} from 'lucide-react-native';
import { useJourney } from '../context/JourneyContext';
import { useOrder } from '../context/OrderContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface ProfileScreenProps {
  onNavigateBack: () => void;
  onNavigateToOrders: () => void;
  onNavigateToCart: () => void;
  onSignOut: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onNavigateBack,
  onNavigateToOrders,
  onNavigateToCart,
  onSignOut,
}) => {
  const insets = useSafeAreaInsets();
  const { user, updateProfile: updateAuthProfile, signOut: authSignOut } = useAuth();
  const { journey, updateSeat, updateStation, updatePassenger } = useJourney();
  const { orders, getRunningOrders } = useOrder();
  const { wishlistItems, wishlistCount, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const runningOrders = getRunningOrders();

  // Modals state
  const [isHelpModalVisible, setIsHelpModalVisible] = useState(false);
  const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);
  const [isSeatModalVisible, setIsSeatModalVisible] = useState(false);
  const [isWishlistModalVisible, setIsWishlistModalVisible] = useState(false);
  const [isEditProfileVisible, setIsEditProfileVisible] = useState(false);

  // Edit Profile form state (PUT /api/v1/users/me)
  const [editName, setEditName] = useState(user.name);
  const [editPhone, setEditPhone] = useState(user.phone);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Sync edit form state when user changes
  React.useEffect(() => {
    if (user) {
      setEditName(user.name);
      setEditPhone(user.phone);
    }
  }, [user]);

  // Address Book state
  const [savedAddresses, setSavedAddresses] = useState([
    {
      id: 'addr-1',
      title: 'Primary Boarding Station',
      station: 'Hazrat Nizamuddin (NZM)',
      platform: 'Platform 1, Overhead Bridge',
      tag: 'Default',
    },
    {
      id: 'addr-2',
      title: 'Upcoming Route Station',
      station: 'Kanpur Central (CNB)',
      platform: 'Platform 2, Near Waiting Room',
      tag: 'Connecting',
    },
  ]);
  const [newStationTitle, setNewStationTitle] = useState('');
  const [newStationName, setNewStationName] = useState('');
  const [newStationPlatform, setNewStationPlatform] = useState('');

  // Seat Update form state
  const [seatCoach, setSeatCoach] = useState(journey.coach || 'B2');
  const [seatBerth, setSeatBerth] = useState(journey.berth || '36');
  const [seatBerthType, setSeatBerthType] = useState(journey.berthType || 'Lower Berth (LB)');
  const [seatStation, setSeatStation] = useState(journey.station || 'Hazrat Nizamuddin (NZM)');
  const [seatPlatform, setSeatPlatform] = useState(journey.platform || 'PF 1');

  // Handle Save Profile to backend (PUT /api/v1/users/me)
  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert('Required', 'Please enter your name.');
      return;
    }
    const cleaned = editPhone.replace(/\D/g, '');
    if (cleaned.length !== 10) {
      Alert.alert('Invalid Mobile', 'Please enter a valid 10-digit mobile number.');
      return;
    }

    try {
      setIsSavingProfile(true);
      await updateAuthProfile(editName.trim(), cleaned);
      updatePassenger(editName.trim(), cleaned);
      setIsEditProfileVisible(false);
      Alert.alert('Profile Updated! ✅', 'Your changes have been saved.');
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to update profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveSeatDetails = () => {
    if (!seatCoach.trim() || !seatBerth.trim()) {
      Alert.alert('Incomplete Details', 'Please provide coach and berth number.');
      return;
    }
    updateSeat(seatCoach.trim().toUpperCase(), seatBerth.trim(), seatBerthType);
    updateStation(seatStation.trim(), seatPlatform.trim(), 10, 5);
    setIsSeatModalVisible(false);
    Alert.alert(
      'Seat Details Updated! 🚆',
      `Active Seat: Coach ${seatCoach.trim().toUpperCase()}, Berth ${seatBerth.trim()} (${seatBerthType}) at ${seatStation.trim()}.`
    );
  };

  const handleAddAddress = () => {
    if (!newStationName.trim()) {
      Alert.alert('Required', 'Please enter a station name.');
      return;
    }
    const newEntry = {
      id: `addr-${Date.now()}`,
      title: newStationTitle.trim() || 'Saved Station',
      station: newStationName.trim(),
      platform: newStationPlatform.trim() || 'PF 1',
      tag: 'Custom',
    };
    setSavedAddresses((prev) => [...prev, newEntry]);
    setNewStationTitle('');
    setNewStationName('');
    setNewStationPlatform('');
    Alert.alert('Station Added', 'Your station address has been saved to Address Book.');
  };

  const handleDeleteAddress = (id: string) => {
    setSavedAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  const handleAddWishlistToCart = (productId: string, productName: string) => {
    addToCart(productId);
    Alert.alert('Added to Cart! 🛒', `${productName} is ready in your cart.`);
  };

  const handleConfirmSignOut = () => {
    Alert.alert(
      'Sign Out of RailQuick?',
      'Are you sure you want to sign out? You will need to sign in again with your Google account to access your orders and seat deliveries.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await authSignOut();
            onSignOut();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* ================= TOP FLOATING NAVIGATION BAR ================= */}
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 14) }]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onNavigateBack}
          style={styles.circleNavBtn}
        >
          <ArrowLeft size={20} color="#0F172A" strokeWidth={2.4} />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onNavigateToCart}
          style={styles.circleCartBtn}
        >
          <ShoppingBag size={18} color="#159447" strokeWidth={2.4} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= 1. CENTERED PROFILE HERO SECTION ================= */}
        <View style={styles.heroSection}>
          {/* Subtle Ambient Radial Glow behind Avatar */}
          <View style={styles.ambientGlow} />

          {/* Centered Avatar */}
          <View style={styles.centeredAvatarContainer}>
            <View style={styles.avatarCircleLarge}>
              {user.avatarUrl ? (
                <Image
                  source={{ uri: user.avatarUrl }}
                  style={styles.avatarImageLarge}
                  contentFit="cover"
                />
              ) : (
                <Text style={styles.avatarInitialLarge}>
                  {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
                </Text>
              )}
              <View style={styles.verifiedTickLarge}>
                <Check size={12} color="#FFFFFF" strokeWidth={3} />
              </View>
            </View>
          </View>

          {/* User Name / Account Title */}
          <View style={styles.userNameRow}>
            <Text style={styles.accountHeading}>
              {user.name || 'Your account'}
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setIsEditProfileVisible(true)}
              style={styles.miniEditBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Edit3 size={13} color="#159447" strokeWidth={2.4} />
            </TouchableOpacity>
          </View>

          {/* Phone Number & IRCTC Badge */}
          <Text style={styles.userPhoneSubtitle}>
            +91 {user.phone}
          </Text>

          <View style={styles.irctcTagRow}>
            <View style={styles.irctcBadge}>
              <ShieldCheck size={11} color="#159447" />
              <Text style={styles.irctcBadgeText}>IRCTC Verified Passenger</Text>
            </View>
          </View>
        </View>

        {/* ================= 2. BANNER CARD (e.g. In-Berth Delivery / Journey Perk) ================= */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setIsSeatModalVisible(true)}
          style={styles.bannerCard}
        >
          <LinearGradient
            colors={['#FFFBEB', '#FEF3C7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.bannerGradient}
          >
            <View style={styles.bannerLeft}>
              <Text style={styles.bannerTitle}>Active Train Journey</Text>
              <View style={styles.bannerActionRow}>
                <Text style={styles.bannerActionText}>
                  Coach {journey.coach} • Berth {journey.berth} ({journey.berthType})
                </Text>
                <ChevronRight size={13} color="#B45309" strokeWidth={2.6} />
              </View>
            </View>

            <View style={styles.bannerGraphicBox}>
              <View style={styles.bannerIconCircle}>
                <Train size={24} color="#D97706" strokeWidth={2.2} />
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* ================= 3. THREE QUICK ACTION CARDS (1 ROW, 3 EQUAL COLUMNS) ================= */}
        <View style={styles.threeActionRow}>
          {/* Action 1: Your orders */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={onNavigateToOrders}
            style={styles.actionColumnCard}
          >
            <View style={[styles.actionIconBox, { backgroundColor: '#E7F8EE' }]}>
              <Package size={22} color="#159447" strokeWidth={2.3} />
            </View>
            <Text style={styles.actionCardTitle}>Your orders</Text>
            {runningOrders.length > 0 ? (
              <View style={styles.livePulsePill}>
                <View style={styles.pulseDot} />
                <Text style={styles.livePillText}>1 Live</Text>
              </View>
            ) : (
              <Text style={styles.actionCardSub}>{orders.length} total</Text>
            )}
          </TouchableOpacity>

          {/* Action 2: Seat details */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => setIsSeatModalVisible(true)}
            style={styles.actionColumnCard}
          >
            <View style={[styles.actionIconBox, { backgroundColor: '#FEF3C7' }]}>
              <Train size={22} color="#D97706" strokeWidth={2.3} />
            </View>
            <Text style={styles.actionCardTitle}>Seat details</Text>
            <Text style={styles.actionCardSub}>Coach {journey.coach}</Text>
          </TouchableOpacity>

          {/* Action 3: Need help? */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => setIsHelpModalVisible(true)}
            style={styles.actionColumnCard}
          >
            <View style={[styles.actionIconBox, { backgroundColor: '#EFF6FF' }]}>
              <Headphones size={22} color="#2563EB" strokeWidth={2.3} />
            </View>
            <Text style={styles.actionCardTitle}>Need help?</Text>
            <Text style={styles.actionCardSub}>24x7 desk</Text>
          </TouchableOpacity>
        </View>

        {/* ================= 4. WIDE ACTION CARD (App update / Partner) ================= */}
        <View style={styles.wideStatusCard}>
          <View style={styles.wideCardIconBox}>
            <Smartphone size={20} color="#0F172A" strokeWidth={2.2} />
          </View>
          <View style={styles.wideCardTextCol}>
            <Text style={styles.wideCardTitle}>RailQuick Express</Text>
            <Text style={styles.wideCardSub}>Official IRCTC Berth Express Delivery</Text>
          </View>
          <View style={styles.versionPill}>
            <Text style={styles.versionPillText}>v1.4.2</Text>
          </View>
        </View>

        {/* ================= 5. SETTING / PREFERENCE ROWS ================= */}
        {/* Appearance Row */}
        <View style={styles.settingCardRow}>
          <View style={styles.settingLeft}>
            <Moon size={18} color="#0F172A" strokeWidth={2.2} />
            <Text style={styles.settingLabel}>Appearance</Text>
          </View>
          <View style={styles.settingRight}>
            <Text style={styles.settingValueText}>SYSTEM</Text>
            <ChevronDown size={14} color="#64748B" strokeWidth={2.2} />
          </View>
        </View>

        {/* Content / Seat Preferences Row (Highlighted with Green border) */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => setIsSeatModalVisible(true)}
          style={styles.highlightPreferenceCard}
        >
          <View style={styles.settingLeft}>
            <Sliders size={18} color="#159447" strokeWidth={2.2} />
            <Text style={[styles.settingLabel, { color: '#0F172A' }]}>
              Content & seat preferences
            </Text>
          </View>
          <View style={styles.newBadgePill}>
            <Text style={styles.newBadgeText}>NEW</Text>
            <ChevronRight size={13} color="#FFFFFF" strokeWidth={2.5} />
          </View>
        </TouchableOpacity>

        {/* ================= 6. SECTION: YOUR INFORMATION ================= */}
        <Text style={styles.yourInfoHeading}>Your information</Text>

        <View style={styles.groupedInfoCard}>
          {/* Row 1: Address Book */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => setIsAddressModalVisible(true)}
            style={styles.groupedRow}
          >
            <View style={[styles.groupedRowIcon, { backgroundColor: '#E7F8EE' }]}>
              <MapPin size={18} color="#159447" strokeWidth={2.2} />
            </View>
            <View style={styles.groupedRowTextCol}>
              <Text style={styles.groupedRowTitle}>Address book</Text>
              <Text style={styles.groupedRowSub}>
                {savedAddresses.length} saved boarding & route stations
              </Text>
            </View>
            <ChevronRight size={16} color="#94A3B8" strokeWidth={2.2} />
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          {/* Row 2: Station & Berth Details */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => setIsSeatModalVisible(true)}
            style={styles.groupedRow}
          >
            <View style={[styles.groupedRowIcon, { backgroundColor: '#FEF3C7' }]}>
              <Train size={18} color="#D97706" strokeWidth={2.2} />
            </View>
            <View style={styles.groupedRowTextCol}>
              <Text style={styles.groupedRowTitle}>Station & berth details</Text>
              <Text style={styles.groupedRowSub}>
                {journey.trainName} • {journey.station}
              </Text>
            </View>
            <ChevronRight size={16} color="#94A3B8" strokeWidth={2.2} />
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          {/* Row 3: Your Wishlist */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => setIsWishlistModalVisible(true)}
            style={styles.groupedRow}
          >
            <View style={[styles.groupedRowIcon, { backgroundColor: '#FCE7F3' }]}>
              <Heart size={18} color="#E11D48" strokeWidth={2.2} fill="#E11D48" />
            </View>
            <View style={styles.groupedRowTextCol}>
              <Text style={styles.groupedRowTitle}>Your wishlist</Text>
              <Text style={styles.groupedRowSub}>
                {wishlistCount} {wishlistCount === 1 ? 'item' : 'items'} saved for train halts
              </Text>
            </View>
            <ChevronRight size={16} color="#94A3B8" strokeWidth={2.2} />
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          {/* Row 4: Edit Profile & Passenger Info */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => setIsEditProfileVisible(true)}
            style={styles.groupedRow}
          >
            <View style={[styles.groupedRowIcon, { backgroundColor: '#EDE9FE' }]}>
              <User size={18} color="#7C3AED" strokeWidth={2.2} />
            </View>
            <View style={styles.groupedRowTextCol}>
              <Text style={styles.groupedRowTitle}>Profile & passenger details</Text>
              <Text style={styles.groupedRowSub}>
                {user.name} • +91 {user.phone}
              </Text>
            </View>
            <ChevronRight size={16} color="#94A3B8" strokeWidth={2.2} />
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          {/* Row 5: Sign Out */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={handleConfirmSignOut}
            style={styles.groupedRow}
          >
            <View style={[styles.groupedRowIcon, { backgroundColor: '#FEE2E2' }]}>
              <LogOut size={18} color="#DC2626" strokeWidth={2.2} />
            </View>
            <View style={styles.groupedRowTextCol}>
              <Text style={[styles.groupedRowTitle, { color: '#DC2626' }]}>Sign Out</Text>
              <Text style={styles.groupedRowSub}>Sign out from this device</Text>
            </View>
            <ChevronRight size={16} color="#F87171" strokeWidth={2.2} />
          </TouchableOpacity>
        </View>

        {/* ================= 7. APP VERSION & FOOTER ================= */}
        <View style={styles.versionFooter}>
          <Text style={styles.versionHeading}>RailQuick</Text>
          <Text style={styles.versionNumber}>Version 1.4.2 • Build 2026.11.07</Text>
          <Text style={styles.versionSubText}>
            Official IRCTC Berth Express Delivery Partner
          </Text>
          <Text style={styles.versionTagline}>
            Made with ❤️ for Indian Railways Passengers
          </Text>
        </View>
      </ScrollView>

      {/* ================= MODAL: NEED HELP? ================= */}
      <Modal
        visible={isHelpModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsHelpModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <Headphones size={22} color="#2563EB" strokeWidth={2.4} />
                <View>
                  <Text style={styles.modalTitle}>Need Help?</Text>
                  <Text style={styles.modalSubtitle}>24x7 In-Berth Delivery Assistance</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setIsHelpModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Chat with Support Box (UI Ready for chat integration) */}
            <View style={styles.chatSupportBox}>
              <View style={styles.chatIconCircle}>
                <MessageSquare size={24} color="#159447" strokeWidth={2.3} />
              </View>
              <View style={styles.chatInfoCol}>
                <Text style={styles.chatBoxTitle}>Live Support Chat</Text>
                <Text style={styles.chatBoxSubtitle}>
                  Chat directly with our railway station desk for order status, runner ETA, or item changes.
                </Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={() => {
                  Alert.alert(
                    'Support Chat',
                    'Connecting you to our station dispatch desk. A support agent will respond in less than 60 seconds.',
                    [{ text: 'OK' }]
                  );
                }}
                style={styles.startChatBtn}
              >
                <Text style={styles.startChatBtnText}>Start Chat</Text>
              </TouchableOpacity>
            </View>

            {/* Quick Helplines */}
            <Text style={styles.helpSectionLabel}>DIRECT HELPLINES:</Text>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                Alert.alert('Calling Railway Helpline', 'Dialing 139 for Indian Railways passenger support.');
              }}
              style={styles.helplineRow}
            >
              <View style={[styles.helpMiniIcon, { backgroundColor: '#E7F8EE' }]}>
                <Phone size={16} color="#159447" />
              </View>
              <View style={styles.helplineCol}>
                <Text style={styles.helplineTitle}>RailQuick Express Desk</Text>
                <Text style={styles.helplineNumber}>1800-245-8910 (Toll Free)</Text>
              </View>
              <Text style={styles.callNowPill}>Call Free</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                Alert.alert('Indian Railways Official Helpline', 'Dialing 139 for Train Security and Medical Aid.');
              }}
              style={styles.helplineRow}
            >
              <View style={[styles.helpMiniIcon, { backgroundColor: '#FEE2E2' }]}>
                <Phone size={16} color="#DC2626" />
              </View>
              <View style={styles.helplineCol}>
                <Text style={styles.helplineTitle}>Indian Railways National Helpline</Text>
                <Text style={styles.helplineNumber}>139 (Security, Medical, PNR)</Text>
              </View>
              <Text style={[styles.callNowPill, { color: '#DC2626', borderColor: '#FECACA' }]}>
                Dial 139
              </Text>
            </TouchableOpacity>

            {/* FAQs Accordion */}
            <Text style={[styles.helpSectionLabel, { marginTop: 14 }]}>COMMON QUESTIONS:</Text>
            <View style={styles.faqCard}>
              <Text style={styles.faqQ}>Q: What happens if my train halt is only 2 minutes?</Text>
              <Text style={styles.faqA}>
                Our runners stand ready on your exact coach marker before train arrival and hand over your sealed package in under 45 seconds.
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL: SEAT DETAILS UPDATE ================= */}
      <Modal
        visible={isSeatModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsSeatModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <Train size={22} color="#D97706" strokeWidth={2.4} />
                <View>
                  <Text style={styles.modalTitle}>Update Seat Details</Text>
                  <Text style={styles.modalSubtitle}>Sync with your active train journey</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setIsSeatModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Coach & Berth Inputs */}
              <View style={styles.twoInputsRow}>
                <View style={styles.halfInputCol}>
                  <Text style={styles.inputLabel}>COACH</Text>
                  <TextInput
                    value={seatCoach}
                    onChangeText={setSeatCoach}
                    placeholder="e.g. B2, A1, C3"
                    placeholderTextColor="#94A3B8"
                    style={styles.modalTextInput}
                    autoCapitalize="characters"
                    maxLength={5}
                  />
                </View>

                <View style={styles.halfInputCol}>
                  <Text style={styles.inputLabel}>BERTH / SEAT NO.</Text>
                  <TextInput
                    value={seatBerth}
                    onChangeText={setSeatBerth}
                    placeholder="e.g. 36"
                    placeholderTextColor="#94A3B8"
                    style={styles.modalTextInput}
                    keyboardType="numeric"
                    maxLength={4}
                  />
                </View>
              </View>

              {/* Berth Type */}
              <Text style={styles.inputLabel}>BERTH POSITION / TYPE</Text>
              <View style={styles.berthTypeChipsRow}>
                {['Lower Berth (LB)', 'Middle Berth (MB)', 'Upper Berth (UB)', 'Side Lower (SL)', 'Window Seat (WS)'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    activeOpacity={0.8}
                    onPress={() => setSeatBerthType(type)}
                    style={[
                      styles.berthTypeChip,
                      seatBerthType === type && styles.berthTypeChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.berthTypeChipText,
                        seatBerthType === type && styles.berthTypeChipTextActive,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Station & Platform */}
              <Text style={[styles.inputLabel, { marginTop: 12 }]}>DELIVERY STATION</Text>
              <TextInput
                value={seatStation}
                onChangeText={setSeatStation}
                placeholder="e.g. Hazrat Nizamuddin (NZM)"
                placeholderTextColor="#94A3B8"
                style={styles.modalTextInput}
              />

              <Text style={[styles.inputLabel, { marginTop: 10 }]}>PLATFORM</Text>
              <TextInput
                value={seatPlatform}
                onChangeText={setSeatPlatform}
                placeholder="e.g. PF 1"
                placeholderTextColor="#94A3B8"
                style={styles.modalTextInput}
              />

              {/* Save Button */}
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={handleSaveSeatDetails}
                style={styles.saveBtn}
              >
                <Check size={16} color="#FFFFFF" strokeWidth={2.6} />
                <Text style={styles.saveBtnText}>Save Seat Details</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL: ADDRESS BOOK ================= */}
      <Modal
        visible={isAddressModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsAddressModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <MapPin size={22} color="#159447" strokeWidth={2.4} />
                <View>
                  <Text style={styles.modalTitle}>Address Book</Text>
                  <Text style={styles.modalSubtitle}>Saved delivery stations & halt points</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setIsAddressModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {savedAddresses.map((addr) => (
                <View key={addr.id} style={styles.addressItemCard}>
                  <View style={styles.addressItemTop}>
                    <Text style={styles.addressItemTitle}>{addr.title}</Text>
                    <View style={styles.addressItemTag}>
                      <Text style={styles.addressItemTagText}>{addr.tag}</Text>
                    </View>
                  </View>
                  <Text style={styles.addressItemStation}>{addr.station}</Text>
                  <Text style={styles.addressItemPlatform}>{addr.platform}</Text>

                  <View style={styles.addressActionsRow}>
                    <TouchableOpacity
                      onPress={() => {
                        updateStation(addr.station, addr.platform, 10, 5);
                        Alert.alert('Active Station Set', `Active delivery station set to ${addr.station}.`);
                        setIsAddressModalVisible(false);
                      }}
                      style={styles.useThisBtn}
                    >
                      <Text style={styles.useThisBtnText}>Set as Active Station</Text>
                    </TouchableOpacity>

                    {savedAddresses.length > 1 && (
                      <TouchableOpacity
                        onPress={() => handleDeleteAddress(addr.id)}
                        style={styles.deleteAddrBtn}
                      >
                        <Trash2 size={15} color="#EF4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}

              {/* Add New Station Address Form */}
              <View style={styles.addAddressBox}>
                <Text style={styles.addAddressHeading}>+ Add New Station Point</Text>
                <TextInput
                  value={newStationTitle}
                  onChangeText={setNewStationTitle}
                  placeholder="Label (e.g. Return Journey Station)"
                  placeholderTextColor="#94A3B8"
                  style={styles.smallTextInput}
                />
                <TextInput
                  value={newStationName}
                  onChangeText={setNewStationName}
                  placeholder="Station Name & Code (e.g. Bhopal Jn BPL)"
                  placeholderTextColor="#94A3B8"
                  style={styles.smallTextInput}
                />
                <TextInput
                  value={newStationPlatform}
                  onChangeText={setNewStationPlatform}
                  placeholder="Platform / Pillar (e.g. PF 3 Near Coach C2)"
                  placeholderTextColor="#94A3B8"
                  style={styles.smallTextInput}
                />
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleAddAddress}
                  style={styles.addAddrSubmitBtn}
                >
                  <Plus size={15} color="#FFFFFF" strokeWidth={2.4} />
                  <Text style={styles.addAddrSubmitText}>Save to Address Book</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL: WISHLIST ================= */}
      <Modal
        visible={isWishlistModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsWishlistModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <Heart size={22} color="#E11D48" strokeWidth={2.4} fill="#E11D48" />
                <View>
                  <Text style={styles.modalTitle}>Your Wishlist</Text>
                  <Text style={styles.modalSubtitle}>
                    {wishlistCount} {wishlistCount === 1 ? 'item saved' : 'items saved'} for next journey
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setIsWishlistModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {wishlistItems.length === 0 ? (
                <View style={styles.emptyWishlistBox}>
                  <Heart size={36} color="#FDA4AF" />
                  <Text style={styles.emptyWishlistTitle}>Your Wishlist is Empty</Text>
                  <Text style={styles.emptyWishlistDesc}>
                    Tap the heart icon on any essential product to save it here for quick coach orders.
                  </Text>
                </View>
              ) : (
                wishlistItems.map((prod) => (
                  <View key={prod.id} style={styles.wishlistCard}>
                    <View style={styles.wishlistCardLeft}>
                      <Text style={styles.wishlistProdName} numberOfLines={1}>
                        {prod.name}
                      </Text>
                      <Text style={styles.wishlistProdWeight}>{prod.weight || '5-Min Drop'}</Text>
                      <View style={styles.wishlistPriceRow}>
                        <Text style={styles.wishlistPrice}>₹{prod.price}</Text>
                        <Text style={styles.wishlistMrp}>₹{prod.mrp}</Text>
                        <View style={styles.wishlistDiscountBadge}>
                          <Text style={styles.wishlistDiscountText}>
                            {Math.round(((prod.mrp - prod.price) / prod.mrp) * 100)}% OFF
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.wishlistCardActions}>
                      <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => handleAddWishlistToCart(prod.id, prod.name)}
                        style={styles.wishlistAddBtn}
                      >
                        <ShoppingBag size={14} color="#FFFFFF" strokeWidth={2.4} />
                        <Text style={styles.wishlistAddBtnText}>Add</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => removeFromWishlist(prod.id)}
                        style={styles.wishlistRemoveBtn}
                      >
                        <Trash2 size={15} color="#94A3B8" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ================= EDIT PROFILE MODAL (PUT /api/v1/users/me) ================= */}
      <Modal
        visible={isEditProfileVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsEditProfileVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <Edit3 size={20} color="#159447" strokeWidth={2.4} />
                <View>
                  <Text style={styles.modalTitle}>Edit Profile</Text>
                  <Text style={styles.modalSubtitle}>Syncs to RailQuick users API</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setIsEditProfileVisible(false)}
                style={styles.modalCloseBtn}
              >
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>FULL NAME</Text>
              <TextInput
                value={editName}
                onChangeText={setEditName}
                placeholder="e.g. Ayush Mishra"
                placeholderTextColor="#94A3B8"
                style={styles.modalTextInput}
              />

              <Text style={[styles.inputLabel, { marginTop: 12 }]}>PHONE NUMBER (10 DIGITS)</Text>
              <TextInput
                value={editPhone}
                onChangeText={setEditPhone}
                placeholder="e.g. 9876543210"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                maxLength={10}
                style={styles.modalTextInput}
              />

              <Text style={[styles.inputLabel, { marginTop: 12 }]}>EMAIL ADDRESS (GOOGLE ACCOUNT)</Text>
              <View style={[styles.modalTextInput, styles.disabledInput]}>
                <Text style={styles.disabledInputText}>{user.email}</Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.88}
                onPress={handleSaveProfile}
                style={[styles.saveBtn, isSavingProfile && { opacity: 0.7 }, { marginTop: 20 }]}
                disabled={isSavingProfile}
              >
                <Check size={16} color="#FFFFFF" strokeWidth={2.6} />
                <Text style={styles.saveBtnText}>
                  {isSavingProfile ? 'Saving Changes...' : 'Save Profile'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF5EA',
  },

  // Floating Top Navigation Bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  circleNavBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#EBE4D5',
  },
  circleCartBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#EBE4D5',
  },

  // Scroll Content
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 40,
  },

  // 1. Centered Profile Hero Section
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    marginBottom: 16,
    position: 'relative',
  },
  ambientGlow: {
    position: 'absolute',
    top: -15,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(217, 119, 6, 0.08)',
  },
  centeredAvatarContainer: {
    marginBottom: 12,
  },
  avatarCircleLarge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#159447',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 3.5,
    borderColor: '#FFFFFF',
    shadowColor: '#159447',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 6,
  },
  avatarImageLarge: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  avatarInitialLarge: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  verifiedTickLarge: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#059669',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 3,
  },
  accountHeading: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  miniEditBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E7F8EE',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#C3EDD1',
  },
  userPhoneSubtitle: {
    fontSize: 13.5,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 8,
  },
  irctcTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  irctcBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E7F8EE',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C3EDD1',
  },
  irctcBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#159447',
  },

  // 2. Banner Card (In-Berth Delivery Perk)
  bannerCard: {
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  bannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  bannerLeft: {
    flex: 1,
    marginRight: 12,
  },
  bannerTitle: {
    fontSize: 14.5,
    fontWeight: '900',
    color: '#92400E',
    marginBottom: 3,
  },
  bannerActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  bannerActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309',
  },
  bannerGraphicBox: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(253, 230, 138, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 3. Three Quick Action Cards (1 row, 3 columns)
  threeActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  actionColumnCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EBE4D5',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  actionIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionCardTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 2,
  },
  actionCardSub: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '600',
    textAlign: 'center',
  },
  livePulsePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3.5,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 2,
  },
  pulseDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#159447',
  },
  livePillText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#B45309',
  },

  // 4. Wide Action Card
  wideStatusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EBE4D5',
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  wideCardIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  wideCardTextCol: {
    flex: 1,
  },
  wideCardTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  wideCardSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
    fontWeight: '500',
  },
  versionPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  versionPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#159447',
  },

  // 5. Setting / Preference Rows
  settingCardRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#EBE4D5',
    marginBottom: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  settingLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  settingValueText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  highlightPreferenceCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#159447',
    marginBottom: 18,
  },
  newBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#159447',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },

  // 6. Section: Your Information
  yourInfoHeading: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.2,
    marginBottom: 10,
    marginLeft: 2,
  },
  groupedInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EBE4D5',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  groupedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  groupedRowIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  groupedRowTextCol: {
    flex: 1,
    marginRight: 8,
  },
  groupedRowTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  groupedRowSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#F1EAD9',
    marginLeft: 64,
  },

  // 7. Version Footer
  versionFooter: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    paddingBottom: 24,
  },
  versionHeading: {
    fontSize: 16,
    fontWeight: '900',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  versionNumber: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#94A3B8',
    marginTop: 2,
  },
  versionSubText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '600',
  },
  versionTagline: {
    fontSize: 10.5,
    color: '#94A3B8',
    marginTop: 2,
    fontStyle: 'italic',
  },

  // Modal Text Input Helper Styles (used in Edit Profile & Seat modal)
  disabledInput: {
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  disabledInputText: {
    fontSize: 13.5,
    color: '#64748B',
    fontWeight: '500',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  modalCloseBtn: {
    padding: 6,
  },

  // Chat Support Box
  chatSupportBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
    alignItems: 'center',
  },
  chatIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  chatInfoCol: {
    alignItems: 'center',
    marginBottom: 12,
  },
  chatBoxTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  chatBoxSubtitle: {
    fontSize: 11.5,
    color: '#475569',
    textAlign: 'center',
    marginTop: 3,
    lineHeight: 16,
  },
  startChatBtn: {
    backgroundColor: '#159447',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    shadowColor: '#159447',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  startChatBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  helpSectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.7,
    marginBottom: 8,
  },
  helplineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  helpMiniIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  helplineCol: {
    flex: 1,
  },
  helplineTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  helplineNumber: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  callNowPill: {
    fontSize: 11,
    fontWeight: '800',
    color: '#159447',
    borderWidth: 1,
    borderColor: '#86EFAC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  faqCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  faqQ: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  faqA: {
    fontSize: 11,
    color: '#475569',
    marginTop: 4,
    lineHeight: 16,
  },

  // Form Inputs
  twoInputsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  halfInputCol: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  modalTextInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  berthTypeChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  berthTypeChip: {
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  berthTypeChipActive: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  berthTypeChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  berthTypeChipTextActive: {
    color: '#B45309',
    fontWeight: '800',
  },
  saveBtn: {
    backgroundColor: '#159447',
    borderRadius: 14,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 18,
    marginBottom: 10,
    shadowColor: '#159447',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },

  // Address Modal
  addressItemCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  addressItemTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  addressItemTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  addressItemTag: {
    backgroundColor: '#E7F8EE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  addressItemTagText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#159447',
  },
  addressItemStation: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  addressItemPlatform: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  addressActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  useThisBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#86EFAC',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  useThisBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#159447',
  },
  deleteAddrBtn: {
    padding: 6,
  },
  addAddressBox: {
    backgroundColor: '#F0FDF4',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.2,
    borderColor: '#BBF7D0',
    marginTop: 6,
  },
  addAddressHeading: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#159447',
    marginBottom: 8,
  },
  smallTextInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    paddingHorizontal: 10,
    height: 38,
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 6,
  },
  addAddrSubmitBtn: {
    backgroundColor: '#159447',
    borderRadius: 10,
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
  },
  addAddrSubmitText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  // Wishlist Modal
  emptyWishlistBox: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyWishlistTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 10,
  },
  emptyWishlistDesc: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 17,
    maxWidth: 260,
  },
  wishlistCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  wishlistCardLeft: {
    flex: 1,
    marginRight: 10,
  },
  wishlistProdName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  wishlistProdWeight: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 2,
  },
  wishlistPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  wishlistPrice: {
    fontSize: 13.5,
    fontWeight: '900',
    color: '#159447',
  },
  wishlistMrp: {
    fontSize: 11.5,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  wishlistDiscountBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  wishlistDiscountText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#D97706',
  },
  wishlistCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  wishlistAddBtn: {
    backgroundColor: '#159447',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  wishlistAddBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  wishlistRemoveBtn: {
    padding: 6,
  },
});

export default ProfileScreen;

