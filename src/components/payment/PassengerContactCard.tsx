import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { User, Phone, MapPin, Lock, AlertCircle } from 'lucide-react-native';
import { JourneyDetails } from '../../types/journey';

interface PassengerContactCardProps {
  journey: JourneyDetails;
  passengerName: string;
  passengerPhone: string;
  onNameChange: (name: string) => void;
  onPhoneChange: (phone: string) => void;
  errorMessage?: string | null;
}

export const PassengerContactCard: React.FC<PassengerContactCardProps> = ({
  journey,
  passengerName,
  passengerPhone,
  onNameChange,
  onPhoneChange,
  errorMessage,
}) => {
  const isPhoneValid = passengerPhone.replace(/\D/g, '').length === 10;

  return (
    <View style={styles.card}>
      {/* Station Lock Indicator */}
      <View style={styles.headerRow}>
        <View style={styles.hubTitleRow}>
          <MapPin size={16} color="#006b2f" />
          <Text style={styles.hubTitle}>Delivery Station (Pilot Locked)</Text>
        </View>
        <View style={styles.lockBadge}>
          <Lock size={11} color="#005226" />
          <Text style={styles.lockBadgeText}>NZM PILOT HUB</Text>
        </View>
      </View>

      <View style={styles.stationInfoBox}>
        <Text style={styles.stationName}>Hazrat Nizamuddin (NZM)</Text>
        <Text style={styles.stationSubtitle}>
          Platform 1 Concourse • Direct Runner Berth Handover
        </Text>
      </View>

      <View style={styles.divider} />

      {/* Seat & Coach Row */}
      <View style={styles.seatRow}>
        <View style={styles.seatCol}>
          <Text style={styles.fieldLabel}>COACH</Text>
          <View style={styles.readOnlyPill}>
            <Text style={styles.readOnlyText}>{journey.coach || 'B2'}</Text>
          </View>
        </View>

        <View style={styles.seatCol}>
          <Text style={styles.fieldLabel}>BERTH / SEAT</Text>
          <View style={styles.readOnlyPill}>
            <Text style={styles.readOnlyText}>{journey.berth || '36'}</Text>
          </View>
        </View>

        <View style={[styles.seatCol, { flex: 1.5 }]}>
          <Text style={styles.fieldLabel}>TRAIN</Text>
          <View style={styles.readOnlyPill}>
            <Text style={styles.readOnlyText} numberOfLines={1}>
              #{journey.trainNumber || '12424'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Passenger Name & Phone Inputs */}
      <Text style={styles.sectionHeader}>Passenger & Contact Information</Text>

      {/* Passenger Name Input */}
      <View style={styles.inputWrapper}>
        <View style={styles.inputIconBox}>
          <User size={16} color="#006b2f" />
        </View>
        <TextInput
          style={styles.textInput}
          value={passengerName}
          onChangeText={onNameChange}
          placeholder="Passenger Name"
          placeholderTextColor="#8a9a8d"
          autoCapitalize="words"
        />
      </View>

      {/* Passenger Phone Input */}
      <View style={[styles.inputWrapper, !isPhoneValid && passengerPhone.length > 0 && styles.inputWarning]}>
        <View style={styles.inputIconBox}>
          <Phone size={16} color="#006b2f" />
        </View>
        <Text style={styles.prefixText}>+91</Text>
        <TextInput
          style={styles.textInput}
          value={passengerPhone}
          onChangeText={(val) => {
            const digits = val.replace(/\D/g, '').slice(0, 10);
            onPhoneChange(digits);
          }}
          placeholder="10-digit mobile number"
          placeholderTextColor="#8a9a8d"
          keyboardType="phone-pad"
          maxLength={10}
        />
      </View>

      {!isPhoneValid && passengerPhone.length > 0 && (
        <View style={styles.warningRow}>
          <AlertCircle size={13} color="#dc2626" />
          <Text style={styles.warningText}>
            Enter valid 10-digit mobile number for berth delivery updates
          </Text>
        </View>
      )}

      {errorMessage && (
        <View style={styles.errorBox}>
          <AlertCircle size={16} color="#dc2626" />
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      )}

      <Text style={styles.contactHint}>
        ⚡ Platform delivery runner will call you right as the train halts at Hazrat Nizamuddin.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    gap: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hubTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hubTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#121e16',
  },
  lockBadge: {
    backgroundColor: '#95f4aa',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lockBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#005226',
    letterSpacing: 0.3,
  },
  stationInfoBox: {
    backgroundColor: '#effdf0',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#d0f0d6',
  },
  stationName: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#006b2f',
  },
  stationSubtitle: {
    fontSize: 11,
    color: '#3e4a3e',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f4f1',
  },
  seatRow: {
    flexDirection: 'row',
    gap: 8,
  },
  seatCol: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#6e7a6d',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  readOnlyPill: {
    backgroundColor: '#f4f6f4',
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e6e3',
  },
  readOnlyText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#121e16',
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: '#121e16',
    marginTop: 2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9faf9',
    borderRadius: 10,
    borderWidth: 1.2,
    borderColor: '#e2e6e3',
    height: 44,
    paddingHorizontal: 10,
    gap: 8,
  },
  inputWarning: {
    borderColor: '#fca5a5',
    backgroundColor: '#fff5f5',
  },
  inputIconBox: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prefixText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#121e16',
  },
  textInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#121e16',
    fontWeight: '600',
    height: '100%',
    padding: 0,
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: -4,
  },
  warningText: {
    fontSize: 11,
    color: '#dc2626',
    fontWeight: '600',
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#991b1b',
    fontWeight: '600',
    flex: 1,
  },
  contactHint: {
    fontSize: 10.5,
    color: '#006b2f',
    fontWeight: '600',
    marginTop: 2,
    lineHeight: 15,
  },
});

export default PassengerContactCard;
