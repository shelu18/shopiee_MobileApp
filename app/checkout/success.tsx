import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCart } from '../../contexts/CartContext';
import { Colors } from '../../constants/colors';

export default function CheckoutSuccessScreen() {
  const { completeOrder } = useCart();
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Complete order - clear cart without restoring stock
    completeOrder();

    // Animate checkmark
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleContinueShopping = () => {
    router.replace('/(tabs)/home');
  };

  const handleViewOrders = () => {
    // Navigate to orders screen (you can implement this later)
    router.replace('/(tabs)/home');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        {/* Success Icon with Animation */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark" size={80} color={Colors.white} />
          </View>
        </Animated.View>

        {/* Success Message */}
        <Animated.View style={[styles.messageContainer, { opacity: fadeAnim }]}>
          <Text style={styles.successTitle}>Order Placed!</Text>
          <Text style={styles.successSubtitle}>
            Your order has been successfully placed.
          </Text>
          <Text style={styles.orderInfo}>
            You will receive a confirmation email shortly.
          </Text>

          {/* Order Details Card */}
          <View style={styles.orderCard}>
            <View style={styles.orderRow}>
              <Ionicons name="receipt-outline" size={24} color="#34C759" />
              <View style={styles.orderTextContainer}>
                <Text style={styles.orderLabel}>Order Number</Text>
                <Text style={styles.orderValue}>#{Math.floor(Math.random() * 100000)}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.orderRow}>
              <Ionicons name="time-outline" size={24} color="#34C759" />
              <View style={styles.orderTextContainer}>
                <Text style={styles.orderLabel}>Estimated Delivery</Text>
                <Text style={styles.orderValue}>20-30 minutes</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View style={[styles.buttonContainer, { opacity: fadeAnim }]}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleViewOrders}>
            <Text style={styles.primaryButtonText}>Track Order</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleContinueShopping}>
            <Text style={styles.secondaryButtonText}>Continue Shopping</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  iconContainer: {
    marginBottom: 32,
  },
  iconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  successTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 12,
  },
  successSubtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 26,
  },
  orderInfo: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 32,
  },
  orderCard: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  orderLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  orderValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3436',
  },
  divider: {
    height: 1,
    backgroundColor: '#E8E8E8',
    marginVertical: 20,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 20,
  },
  primaryButton: {
    backgroundColor: '#34C759',
    paddingVertical: 18,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: Colors.white,
    paddingVertical: 18,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#34C759',
  },
  secondaryButtonText: {
    color: '#34C759',
    fontSize: 18,
    fontWeight: '600',
  },
});
