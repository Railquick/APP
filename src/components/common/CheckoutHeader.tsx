import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, User } from 'lucide-react-native';

interface CheckoutHeaderProps {
  title: string;
  onBackPress: () => void;
  onProfilePress?: () => void;
}

export const CheckoutHeader: React.FC<CheckoutHeaderProps> = ({
  title,
  onBackPress,
  onProfilePress,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 12) }]}>
      <View style={styles.headerRow}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={onBackPress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ArrowLeft size={22} color="#121e16" />
        </TouchableOpacity>

        {/* Center Title */}
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>

        {/* User Profile Avatar */}
        <TouchableOpacity
          style={styles.profileButton}
          activeOpacity={0.8}
          onPress={onProfilePress}
        >
          <User size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(239, 253, 240, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    zIndex: 50,
  },
  headerRow: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#121e16',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  profileButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#006b2f',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#006b2f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
});

export default CheckoutHeader;

