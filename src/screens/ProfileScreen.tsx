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

      {/* ================= FIXED TOP HEADER ================= */}
      <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 12) }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={onNavigateBack}
            style={styles.backButton}
          >
            <ArrowLeft size={20} color="#0F172A" strokeWidth={2.4} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>My Profile</Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onNavigateToCart}
            style={styles.cartIconButton}
          >
            <ShoppingBag size={18} color="#159447" strokeWidth={2.4} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= 1. USER PROFILE IDENTITY CARD (Connected to Real Backend Auth & Users) ================= */}
        <View style={styles.profileCard}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarCircle}>
              {user.avatarUrl ? (
                <Image
                  source={{ uri: user.avatarUrl }}
                  style={styles.avatarImage}
                  contentFit="cover"
                />
              ) : (
                <Text style={styles.avatarInitial}>
                  {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
                </Text>
              )}
              <View style={styles.verifiedTick}>
                <Check size={11} color="#FFFFFF" strokeWidth={3} />
              </View>
            </View>

            <View style={styles.identityCol}>
              <View style={styles.nameRow}>
                <Text style={styles.userNameText} numberOfLines={1}>
                  {user.name}
                </Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setIsEditProfileVisible(true)}
                  style={styles.editProfileBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Edit3 size={14} color="#159447" />
                </TouchableOpacity>
              </View>

              <View style={styles.irctcBadgeRow}>
                <View style={styles.irctcBadge}>
                  <ShieldCheck size={11} color="#159447" />
                  <Text style={styles.irctcBadgeText}>IRCTC Verified</Text>
                </View>
              </View>

              <View style={styles.contactLine}>
                <Mail size={12} color="#64748B" />
                <Text style={styles.contactText}>{user.email}</Text>
              </View>

              <View style={styles.contactLine}>
                <Phone size={12} color="#64748B" />
                <Text style={styles.contactText}>+91 {user.phone}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ================= 2. TWO HIGHLIGHT ACTION BOXES ================= */}
        <View style={styles.highlightBoxesRow}>
          {/* Box 1: Your Orders */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={onNavigateToOrders}
            style={[styles.highlightBox, styles.ordersBox]}
          >
            <View style={styles.highlightTopRow}>
              <View style={[styles.highlightIconBox, { backgroundColor: '#E7F8EE' }]}>
                <Package size={22} color="#159447" strokeWidth={2.3} />
              </View>
              {runningOrders.length > 0 ? (
                <View style={styles.liveOrderPill}>
                  <View style={styles.livePulseDot} />
                  <Text style={styles.liveOrderPillText}>1 Live</Text>
                </View>
              ) : (
                <View style={styles.ordersCountPill}>
                  <Text style={styles.ordersCountText}>{orders.length} total</Text>
                </View>
              )}
            </View>

            <Text style={styles.highlightTitle}>Your Orders</Text>
            <Text style={styles.highlightSubtitle}>
              {runningOrders.length > 0
                ? 'Track runner & reorder past meals'
                : 'View order history & receipts'}
            </Text>

            <View style={styles.highlightActionRow}>
              <Text style={styles.highlightActionText}>View Orders</Text>
              <ChevronRight size={14} color="#159447" strokeWidth={2.4} />
            </View>
          </TouchableOpacity>

          {/* Box 2: Need Help? */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => setIsHelpModalVisible(true)}
            style={[styles.highlightBox, styles.helpBox]}
          >
            <View style={styles.highlightTopRow}>
              <View style={[styles.highlightIconBox, { backgroundColor: '#EFF6FF' }]}>
                <Headphones size={22} color="#2563EB" strokeWidth={2.3} />
              </View>
              <View style={styles.helpOnlinePill}>
                <View style={[styles.livePulseDot, { backgroundColor: '#3B82F6' }]} />
                <Text style={styles.helpOnlineText}>24x7</Text>
              </View>
            </View>

            <Text style={styles.highlightTitle}>Need Help?</Text>
            <Text style={styles.highlightSubtitle}>
              Coach delivery support, refund & FAQs
            </Text>

            <View style={styles.highlightActionRow}>
              <Text style={[styles.highlightActionText, { color: '#2563EB' }]}>
                Get Help
              </Text>
              <ChevronRight size={14} color="#2563EB" strokeWidth={2.4} />
            </View>
          </TouchableOpacity>
        </View>

        {/* ================= 3. SECTION: YOUR INFORMATION ================= */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>YOUR INFORMATION</Text>
        </View>

        {/* Card 1: Address Book */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setIsAddressModalVisible(true)}
          style={styles.infoCard}
        >
          <View style={[styles.infoCardIcon, { backgroundColor: '#E7F8EE' }]}>
            <MapPin size={20} color="#159447" strokeWidth={2.2} />
          </View>
          <View style={styles.infoCardContent}>
            <View style={styles.infoCardTitleRow}>
              <Text style={styles.infoCardTitle}>Address Book</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{savedAddresses.length} Saved</Text>
              </View>
            </View>
            <Text style={styles.infoCardSubtitle} numberOfLines={1}>
              {savedAddresses[0]?.station} • {savedAddresses[0]?.platform}
            </Text>
          </View>
          <ChevronRight size={18} color="#94A3B8" />
        </TouchableOpacity>

        {/* Card 2: Seat Details */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setIsSeatModalVisible(true)}
          style={styles.infoCard}
        >
          <View style={[styles.infoCardIcon, { backgroundColor: '#FEF3C7' }]}>
            <Train size={20} color="#D97706" strokeWidth={2.2} />
          </View>
          <View style={styles.infoCardContent}>
            <View style={styles.infoCardTitleRow}>
              <Text style={styles.infoCardTitle}>Seat Details</Text>
              <View style={styles.activeSeatPill}>
                <Text style={styles.activeSeatPillText}>Coach {journey.coach} • Berth {journey.berth}</Text>
              </View>
            </View>
            <Text style={styles.infoCardSubtitle} numberOfLines={1}>
              {journey.trainName} • {journey.station}
            </Text>
          </View>
          <ChevronRight size={18} color="#94A3B8" />
        </TouchableOpacity>

        {/* Card 3: Your Wishlist */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setIsWishlistModalVisible(true)}
          style={styles.infoCard}
        >
          <View style={[styles.infoCardIcon, { backgroundColor: '#FCE7F3' }]}>
            <Heart size={20} color="#E11D48" strokeWidth={2.2} fill="#E11D48" />
          </View>
          <View style={styles.infoCardContent}>
            <View style={styles.infoCardTitleRow}>
              <Text style={styles.infoCardTitle}>Your Wishlist</Text>
              <View style={[styles.countBadge, { backgroundColor: '#FFE4E6' }]}>
                <Text style={[styles.countBadgeText, { color: '#E11D48' }]}>
                  {wishlistCount} {wishlistCount === 1 ? 'item' : 'items'}
                </Text>
              </View>
            </View>
            <Text style={styles.infoCardSubtitle}>
              Saved essentials for your upcoming train halts
            </Text>
          </View>
          <ChevronRight size={18} color="#94A3B8" />
        </TouchableOpacity>

        {/* Card 4: Sign Out */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleConfirmSignOut}
          style={[styles.infoCard, styles.signOutCard]}
        >
          <View style={[styles.infoCardIcon, { backgroundColor: '#FEE2E2' }]}>
            <LogOut size={20} color="#DC2626" strokeWidth={2.2} />
          </View>
          <View style={styles.infoCardContent}>
            <Text style={[styles.infoCardTitle, { color: '#DC2626' }]}>Sign Out</Text>
            <Text style={styles.infoCardSubtitle}>
              Sign out from this device
            </Text>
          </View>
          <ChevronRight size={18} color="#F87171" />
        </TouchableOpacity>

        {/* ================= 4. APP VERSION & FOOTER ================= */}
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

  // Fixed Header
  headerContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9DFC7',
    paddingHorizontal: 16,
    paddingBottom: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  cartIconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#E7F8EE',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#C3EDD1',
  },

  // Scroll Content
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 40,
  },

  // 1. Profile Card
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#159447',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginRight: 14,
    shadowColor: '#159447',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarInitial: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  avatarImage: {
    width: 58,
    height: 58,
    borderRadius: 29,
  },
  editProfileBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E7F8EE',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#C3EDD1',
  },
  irctcBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
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
  verifiedTick: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#059669',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  identityCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    flexWrap: 'wrap',
    gap: 6,
  },
  userNameText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  irctcBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#E7F8EE',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  irctcBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#159447',
  },
  contactLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  contactText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },

  // 2. Highlight Action Boxes
  highlightBoxesRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  highlightBox: {
    flex: 1,
    borderRadius: 20,
    padding: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1.2,
  },
  ordersBox: {
    backgroundColor: '#FFFFFF',
    borderColor: '#BBF7D0',
  },
  helpBox: {
    backgroundColor: '#FFFFFF',
    borderColor: '#BFDBFE',
  },
  highlightTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  highlightIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveOrderPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#159447',
  },
  liveOrderPillText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#B45309',
  },
  ordersCountPill: {
    backgroundColor: '#E7F8EE',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  ordersCountText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#159447',
  },
  helpOnlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  helpOnlineText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#2563EB',
  },
  highlightTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 3,
  },
  highlightSubtitle: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
    marginBottom: 10,
    minHeight: 30,
  },
  highlightActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  highlightActionText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#159447',
  },

  // 3. Section: Your Information
  sectionHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  signOutCard: {
    borderColor: '#FEE2E2',
    marginTop: 6,
  },
  infoCardIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoCardContent: {
    flex: 1,
  },
  infoCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoCardTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  countBadge: {
    backgroundColor: '#E7F8EE',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 8,
  },
  countBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#159447',
  },
  activeSeatPill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 8,
  },
  activeSeatPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706',
  },
  infoCardSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 3,
  },

  // 4. Version Footer
  versionFooter: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    paddingBottom: 20,
  },
  versionHeading: {
    fontSize: 17,
    fontWeight: '900',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  versionNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    marginTop: 3,
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

