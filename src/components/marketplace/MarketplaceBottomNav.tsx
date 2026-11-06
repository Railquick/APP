import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Home,
  LayoutGrid,
  Receipt,
  Train,
  User,
} from 'lucide-react-native';

export type BottomNavTab = 'home' | 'categories' | 'orders' | 'status' | 'profile';

interface MarketplaceBottomNavProps {
  activeTab: BottomNavTab;
  onTabPress: (tab: BottomNavTab) => void;
  /** Pass true when user is scrolling down — pill hides. False to show it. */
  hidden?: boolean;
}

export const MarketplaceBottomNav: React.FC<MarketplaceBottomNavProps> = ({
  activeTab,
  onTabPress,
  hidden = false,
}) => {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 8);

  // Height of the pill + bottom safe area
  const pillHeight = 54 + bottomPad;

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: withTiming(hidden ? pillHeight + 20 : 0, {
            duration: 280,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          }),
        },
      ],
      opacity: withTiming(hidden ? 0 : 1, { duration: 220 }),
    };
  });

  const tabs: { id: BottomNavTab; label: string; icon: any }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'categories', label: 'Categories', icon: LayoutGrid },
    { id: 'orders', label: 'Orders', icon: Receipt },
    { id: 'status', label: 'Train', icon: Train },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <Animated.View
      style={[
        styles.floatingWrapper,
        { bottom: bottomPad + 8 },
        animatedStyle,
      ]}
      pointerEvents={hidden ? 'none' : 'auto'}
    >
      <View style={styles.pill}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const IconComponent = tab.icon;
          const color = isActive ? '#159447' : '#64748B';

          return (
            <TouchableOpacity
              key={tab.id}
              activeOpacity={0.7}
              onPress={() => onTabPress(tab.id)}
              style={styles.tabButton}
            >
              {isActive && <View style={styles.activeIndicator} />}
              <IconComponent
                size={21}
                color={color}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <Text
                style={[
                  styles.tabLabel,
                  { color, fontWeight: isActive ? '800' : '500' },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  floatingWrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 50,
  },
  pill: {
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 8,
    paddingHorizontal: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    paddingHorizontal: 10,
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    top: -4,
    width: 20,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#159447',
  },
  tabLabel: {
    fontSize: 9.5,
    marginTop: 3,
    letterSpacing: 0.1,
  },
});

export default MarketplaceBottomNav;

