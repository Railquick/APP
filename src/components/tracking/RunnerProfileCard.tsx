import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Image } from 'expo-image';
import { BadgeCheck, Phone, MessageSquare, Shield } from 'lucide-react-native';
import { RunnerInfo } from '../../types/order';

interface RunnerProfileCardProps {
  runner: RunnerInfo;
}

export const RunnerProfileCard: React.FC<RunnerProfileCardProps> = ({ runner }) => {
  const handleCall = () => {
    Alert.alert(
      'Call Station Runner',
      `Connecting to ${runner.name} (${runner.phone})...\nRunner is standing at Coach marker line on Platform.`,
      [{ text: 'Dismiss' }]
    );
  };

  const handleChat = () => {
    Alert.alert(
      'In-App Runner Chat',
      `Chat session opened with ${runner.name}.\n"Hello passenger! I have your sealed order and I'm at your coach."`,
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.card}>
      {/* Runner Info Row */}
      <View style={styles.profileRow}>
        <View style={styles.avatarWrapper}>
          <Image
            source={{ uri: runner.avatarUrl }}
            style={styles.avatarImage}
            contentFit="cover"
          />
          <View style={styles.verifiedIconBadge}>
            <BadgeCheck size={12} color="#FFFFFF" strokeWidth={2.8} />
          </View>
        </View>

        <View style={styles.profileTexts}>
          <Text style={styles.runnerName}>{runner.name}</Text>
          <Text style={styles.runnerTitle}>{runner.title}</Text>
          <View style={styles.ratingRow}>
            <Text style={styles.ratingStar}>★ {runner.rating}</Text>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.deliveriesText}>
              {runner.totalDeliveries}+ Berth Deliveries
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.actionBtn}
          activeOpacity={0.8}
          onPress={handleCall}
        >
          <Phone size={16} color="#006b2f" />
          <Text style={styles.actionBtnText}>Call Runner</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          activeOpacity={0.8}
          onPress={handleChat}
        >
          <MessageSquare size={16} color="#006b2f" />
          <Text style={styles.actionBtnText}>Chat</Text>
        </TouchableOpacity>
      </View>

      {/* Uniform Tag Reassurance */}
      <View style={styles.uniformBanner}>
        <Shield size={14} color="#006b2f" />
        <Text style={styles.uniformText}>{runner.uniformTag}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarWrapper: {
    position: 'relative',
    width: 52,
    height: 52,
  },
  avatarImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#deecdf',
  },
  verifiedIconBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#006b2f',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileTexts: {
    flex: 1,
    minWidth: 0,
  },
  runnerName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#121e16',
  },
  runnerTitle: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#006d34',
    marginTop: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  ratingStar: {
    fontSize: 11,
    fontWeight: '800',
    color: '#755b00',
  },
  bulletDot: {
    fontSize: 10,
    color: '#bdcabb',
  },
  deliveriesText: {
    fontSize: 11,
    color: '#3e4a3e',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    height: 38,
    backgroundColor: '#deecdf',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#121e16',
  },
  uniformBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#e9f7ea',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  uniformText: {
    fontSize: 11,
    color: '#3e4a3e',
    fontWeight: '500',
  },
});

export default RunnerProfileCard;

