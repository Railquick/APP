import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Linking,
  Platform,
} from 'react-native';
import {
  Headset,
  PhoneCall,
  MessageCircle,
  X,
  ShieldCheck,
  Clock,
  ExternalLink,
} from 'lucide-react-native';
import {
  SUPPORT_CONFIG,
  getCallUrl,
  getWhatsAppUrl,
} from '../../config/constants';

/**
 * Universal safe opener for phone calls across web and native
 */
export const openStationCall = async (
  phone: string = SUPPORT_CONFIG.PHONE_NUMBER
): Promise<void> => {
  const url = getCallUrl(phone);
  try {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.open(url, '_self');
    } else {
      const canOpen = await Linking.canOpenURL(url).catch(() => true);
      if (canOpen) {
        await Linking.openURL(url);
      }
    }
  } catch (err) {
    console.warn('[RailQuick Support] Failed to launch phone dialer:', err);
  }
};

/**
 * Universal safe opener for WhatsApp chat across web and native
 */
export const openStationWhatsApp = async (
  phone: string = SUPPORT_CONFIG.WHATSAPP_NUMBER,
  message: string = SUPPORT_CONFIG.DEFAULT_WHATSAPP_MESSAGE
): Promise<void> => {
  const url = getWhatsAppUrl(phone, message);
  try {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      const canOpen = await Linking.canOpenURL(url).catch(() => true);
      if (canOpen) {
        await Linking.openURL(url);
      }
    }
  } catch (err) {
    console.warn('[RailQuick Support] Failed to open WhatsApp:', err);
  }
};

export interface SupportHelpModalProps {
  visible: boolean;
  onClose: () => void;
  stationName?: string;
  runnerName?: string;
  orderId?: string;
  coach?: string;
  berth?: string;
}

/**
 * Lightweight Modal offering Call Station Hub and WhatsApp Chat
 */
export const SupportHelpModal: React.FC<SupportHelpModalProps> = ({
  visible,
  onClose,
  stationName = SUPPORT_CONFIG.STATION_NAME,
  runnerName,
  orderId,
  coach,
  berth,
}) => {
  const customMessage =
    orderId && coach && berth
      ? `Hi RailQuick, I need help with Order ${orderId} at ${stationName} (Coach ${coach}, Berth ${berth})`
      : runnerName
      ? `Hi RailQuick, I need help connecting with runner ${runnerName} at ${stationName} Station`
      : SUPPORT_CONFIG.DEFAULT_WHATSAPP_MESSAGE;

  const handleCall = () => {
    openStationCall(SUPPORT_CONFIG.PHONE_NUMBER);
    onClose();
  };

  const handleWhatsApp = () => {
    openStationWhatsApp(SUPPORT_CONFIG.WHATSAPP_NUMBER, customMessage);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.modalSheet}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIconCircle}>
                <Headset size={20} color="#006b2f" />
              </View>
              <View>
                <Text style={styles.modalTitle}>24x7 Station Ops Support</Text>
                <Text style={styles.modalSubtitle}>
                  {stationName} ({SUPPORT_CONFIG.STATION_CODE}) • Platform Hub
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <X size={20} color="#556055" />
            </TouchableOpacity>
          </View>

          {/* Guarantee Pill */}
          <View style={styles.infoBanner}>
            <Clock size={14} color="#006b2f" />
            <Text style={styles.infoBannerText}>
              Platform runners are active now • Direct berth fulfillment line
            </Text>
          </View>

          {/* Action 1: Call Station Hub / Runner */}
          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.85}
            onPress={handleCall}
          >
            <View style={[styles.actionIconWrapper, styles.callIconBg]}>
              <PhoneCall size={20} color="#006b2f" />
            </View>
            <View style={styles.actionDetails}>
              <Text style={styles.actionTitle}>Call Station Hub / Runner</Text>
              <Text style={styles.actionSubtitle}>
                {SUPPORT_CONFIG.PHONE_DISPLAY} • Instant connect
              </Text>
            </View>
            <ExternalLink size={16} color="#758275" />
          </TouchableOpacity>

          {/* Action 2: Chat on WhatsApp */}
          <TouchableOpacity
            style={[styles.actionCard, styles.whatsAppCard]}
            activeOpacity={0.85}
            onPress={handleWhatsApp}
          >
            <View style={[styles.actionIconWrapper, styles.whatsAppIconBg]}>
              <MessageCircle size={20} color="#128C7E" />
            </View>
            <View style={styles.actionDetails}>
              <Text style={styles.actionTitle}>Chat on WhatsApp</Text>
              <Text style={styles.actionSubtitle}>
                Live chat with NZM station runner desk
              </Text>
            </View>
            <ExternalLink size={16} color="#128C7E" />
          </TouchableOpacity>

          {/* Trust reassurance badge */}
          <View style={styles.trustFooter}>
            <ShieldCheck size={14} color="#006b2f" />
            <Text style={styles.trustText}>
              IRCTC darkstore coordination • Safe berth delivery
            </Text>
          </View>

          {/* Dismiss button */}
          <TouchableOpacity
            style={styles.cancelButton}
            activeOpacity={0.8}
            onPress={onClose}
          >
            <Text style={styles.cancelButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export interface SupportHelpButtonProps {
  variant?: 'floating' | 'contextual' | 'inline';
  stationName?: string;
  runnerName?: string;
  orderId?: string;
  coach?: string;
  berth?: string;
  title?: string;
  subtitle?: string;
}

export const SupportHelpButton: React.FC<SupportHelpButtonProps> = ({
  variant = 'floating',
  stationName = SUPPORT_CONFIG.STATION_NAME,
  runnerName,
  orderId,
  coach,
  berth,
  title,
  subtitle,
}) => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const openModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);

  if (variant === 'contextual') {
    return (
      <>
        <View style={styles.contextualCard}>
          <View style={styles.contextualHeader}>
            <View style={styles.contextualIconCircle}>
              <Headset size={18} color="#006b2f" />
            </View>
            <View style={styles.contextualTexts}>
              <Text style={styles.contextualTitle}>
                {title || 'Need help with delivery or halt time?'}
              </Text>
              <Text style={styles.contextualSubtitle}>
                {subtitle ||
                  `Our ${stationName} station runners are available 24x7 to ensure your order arrives on time.`}
              </Text>
            </View>
          </View>

          <View style={styles.contextualActionsRow}>
            <TouchableOpacity
              style={styles.contextualCallBtn}
              activeOpacity={0.85}
              onPress={() => openStationCall()}
            >
              <PhoneCall size={14} color="#006b2f" />
              <Text style={styles.contextualCallBtnText}>Call Ops</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contextualWhatsAppBtn}
              activeOpacity={0.85}
              onPress={() => openStationWhatsApp()}
            >
              <MessageCircle size={14} color="#128C7E" />
              <Text style={styles.contextualWhatsAppBtnText}>WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contextualDetailsBtn}
              activeOpacity={0.85}
              onPress={openModal}
            >
              <Text style={styles.contextualDetailsBtnText}>More Info</Text>
            </TouchableOpacity>
          </View>
        </View>

        <SupportHelpModal
          visible={modalVisible}
          onClose={closeModal}
          stationName={stationName}
          runnerName={runnerName}
          orderId={orderId}
          coach={coach}
          berth={berth}
        />
      </>
    );
  }

  if (variant === 'inline') {
    return (
      <>
        <TouchableOpacity
          style={styles.inlineButton}
          activeOpacity={0.85}
          onPress={openModal}
        >
          <Headset size={15} color="#006b2f" />
          <Text style={styles.inlineButtonText}>
            {title || '24x7 Station Support'}
          </Text>
        </TouchableOpacity>

        <SupportHelpModal
          visible={modalVisible}
          onClose={closeModal}
          stationName={stationName}
          runnerName={runnerName}
          orderId={orderId}
          coach={coach}
          berth={berth}
        />
      </>
    );
  }

  // Default: Floating button (FAB)
  return (
    <>
      <TouchableOpacity
        style={styles.floatingButton}
        activeOpacity={0.9}
        onPress={openModal}
        accessibilityLabel="24x7 Station Ops Support"
      >
        <View style={styles.floatingPulseDot} />
        <Headset size={18} color="#FFFFFF" />
        <Text style={styles.floatingText}>24x7 Station Ops</Text>
      </TouchableOpacity>

      <SupportHelpModal
        visible={modalVisible}
        onClose={closeModal}
        stationName={stationName}
        runnerName={runnerName}
        orderId={orderId}
        coach={coach}
        berth={berth}
      />
    </>
  );
};

const styles = StyleSheet.create({
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'web' ? 24 : 16,
    paddingHorizontal: 16,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalSheet: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e9f7ea',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#121e16',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#556055',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f4f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#effdf0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#c6e7c9',
  },
  infoBannerText: {
    fontSize: 11.5,
    color: '#005223',
    fontWeight: '600',
    flex: 1,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#f7faf7',
    borderWidth: 1,
    borderColor: '#deecdf',
    gap: 12,
  },
  whatsAppCard: {
    backgroundColor: '#f3fbf7',
    borderColor: '#c7edd9',
  },
  actionIconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callIconBg: {
    backgroundColor: '#e9f7ea',
  },
  whatsAppIconBg: {
    backgroundColor: '#e4f8ed',
  },
  actionDetails: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#121e16',
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#556055',
    marginTop: 2,
  },
  trustFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 4,
  },
  trustText: {
    fontSize: 11.5,
    color: '#495549',
    fontWeight: '500',
  },
  cancelButton: {
    height: 42,
    borderRadius: 10,
    backgroundColor: '#f1f4f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  cancelButtonText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#414941',
  },

  // Contextual Card styles
  contextualCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#cbe7ce',
    gap: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  contextualHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  contextualIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e9f7ea',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contextualTexts: {
    flex: 1,
  },
  contextualTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#121e16',
  },
  contextualSubtitle: {
    fontSize: 11.5,
    color: '#4b574b',
    marginTop: 2,
    lineHeight: 16,
  },
  contextualActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  contextualCallBtn: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#e9f7ea',
    borderWidth: 1,
    borderColor: '#c6e7c9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  contextualCallBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#006b2f',
  },
  contextualWhatsAppBtn: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#e4f8ed',
    borderWidth: 1,
    borderColor: '#bbf0d4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  contextualWhatsAppBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#128C7E',
  },
  contextualDetailsBtn: {
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#f1f4f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contextualDetailsBtnText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#414941',
  },

  // Inline Button styles
  inlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#e9f7ea',
    borderWidth: 1,
    borderColor: '#c6e7c9',
  },
  inlineButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#006b2f',
  },

  // Floating Button styles
  floatingButton: {
    position: 'absolute',
    bottom: 90,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#006b2f',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 999,
  },
  floatingPulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ade80',
  },
  floatingText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
});

export default SupportHelpButton;
