import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { JourneyProvider } from './src/context/JourneyContext';
import { CartProvider } from './src/context/CartContext';
import { OrderProvider } from './src/context/OrderContext';
import { WishlistProvider } from './src/context/WishlistContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider style={styles.container}>
      {/*<AuthProvider>*/}
        <JourneyProvider>
          <CartProvider>
            <OrderProvider>
              <WishlistProvider>
                <AppNavigator />
              </WishlistProvider>
            </OrderProvider>
          </CartProvider>
        </JourneyProvider>
      {/*</AuthProvider>*/}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#04522B',
  },
});
