import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
  PanResponder,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCart } from '../../contexts/CartContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { Colors } from '../../constants/colors';

const { width } = Dimensions.get('window');
const SWIPE_THRESHOLD = -80;

interface CartItemProps {
  item: any;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
  onDelete: () => void;
  swipedItemId: string | null;
  setSwipedItemId: (id: string | null) => void;
}

const CartItemComponent = ({
  item,
  isFavorite: favorite,
  onToggleFavorite,
  onIncrement,
  onDecrement,
  onDelete,
  swipedItemId,
  setSwipedItemId,
}: CartItemProps) => {
  const translateX = React.useRef(new Animated.Value(0)).current;

  const onSwipeLeft = () => {
    Animated.spring(translateX, {
      toValue: SWIPE_THRESHOLD,
      useNativeDriver: true,
      tension: 40,
      friction: 7,
    }).start();
    setSwipedItemId(item.product.id);
  };

  const onSwipeReset = () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      tension: 40,
      friction: 7,
    }).start();
  };

  React.useEffect(() => {
    if (swipedItemId && swipedItemId !== item.product.id) {
      onSwipeReset();
    }
  }, [swipedItemId]);

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          translateX.setValue(Math.max(gestureState.dx, SWIPE_THRESHOLD));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -60) {
          onSwipeLeft();
        } else {
          onSwipeReset();
        }
      },
    })
  ).current;

  return (
    <View style={styles.cartItemWrapper}>
      {/* Delete button background */}
      <View style={styles.deleteBackground}>
        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
          <Ionicons name="trash-outline" size={28} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Swipeable card */}
      <Animated.View
        style={[styles.cartItemContainer, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        <View style={styles.cartItem}>
          <Image source={{ uri: item.product.imageUrl }} style={styles.cartItemImage} />
          <View style={styles.cartItemInfo}>
            <Text style={styles.cartItemName}>{item.product.name}</Text>
            <Text style={styles.cartItemWeight}>{item.quantity} kg</Text>
            <Text style={styles.cartItemPrice}>
              $ {(item.product.price * item.quantity).toFixed(1)}
            </Text>
          </View>

          {/* Favorite Button */}
          <TouchableOpacity style={styles.favoriteButton} onPress={onToggleFavorite}>
            <Ionicons
              name={favorite ? 'heart' : 'heart-outline'}
              size={20}
              color={Colors.error}
            />
          </TouchableOpacity>

          {/* Quantity Controls */}
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={[styles.quantityButton, item.quantity === 1 && styles.quantityButtonDisabled]}
              onPress={onDecrement}
              disabled={item.quantity === 1}
            >
              <Text
                style={[
                  styles.quantityButtonText,
                  item.quantity === 1 && styles.quantityButtonTextDisabled,
                ]}
              >
                −
              </Text>
            </TouchableOpacity>
            <Text style={styles.quantityValue}>{item.quantity}</Text>
            <TouchableOpacity
              style={[
                styles.quantityButton,
                item.quantity >= item.product.stock && styles.quantityButtonDisabled,
              ]}
              onPress={onIncrement}
              disabled={item.quantity >= item.product.stock}
            >
              <Text
                style={[
                  styles.quantityButtonText,
                  item.quantity >= item.product.stock && styles.quantityButtonTextDisabled,
                ]}
              >
                +
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

export default function CartScreen() {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [swipedItemId, setSwipedItemId] = React.useState<string | null>(null);

  const handleIncrement = async (productId: string, currentQuantity: number, stock: number) => {
    if (currentQuantity < stock) {
      try {
        await updateQuantity(productId, currentQuantity + 1);
      } catch (error: any) {
        Alert.alert('Error', error.message || 'Failed to update quantity');
      }
    }
  };

  const handleDecrement = async (productId: string, currentQuantity: number) => {
    if (currentQuantity > 1) {
      try {
        await updateQuantity(productId, currentQuantity - 1);
      } catch (error: any) {
        Alert.alert('Error', error.message || 'Failed to update quantity');
      }
    }
  };

  const handleDelete = async (productId: string) => {
    try {
      await removeFromCart(productId);
      setSwipedItemId(null);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to remove item');
    }
  };

  const renderEmptyCart = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emojiContainer}>
        <Text style={styles.emoji}>😢</Text>
      </View>
      <Text style={styles.emptyTitle}>It's lonely here</Text>
      <Text style={styles.emptySubtitle}>Start and add more items to the bag.</Text>
    </View>
  );

  const renderCartItem = ({ item }: { item: any }) => {
    const favorite = isFavorite(item.product.id);

    return (
      <CartItemComponent
        item={item}
        isFavorite={favorite}
        onToggleFavorite={() => toggleFavorite(item.product.id)}
        onIncrement={() => handleIncrement(item.product.id, item.quantity, item.product.stock)}
        onDecrement={() => handleDecrement(item.product.id, item.quantity)}
        onDelete={() => handleDelete(item.product.id)}
        swipedItemId={swipedItemId}
        setSwipedItemId={setSwipedItemId}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#2D3436" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>My Bag</Text>
          <Text style={styles.itemCount}>{cartItems.length} items</Text>
        </View>
      </View>

      {cartItems.length === 0 ? (
        renderEmptyCart()
      ) : (
        <>
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.product.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />

          {/* Total and Checkout */}
          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalPrice}>$ {getCartTotal().toFixed(1)}</Text>
            </View>
            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={() => {
                router.push('/checkout/success');
              }}
            >
              <Text style={styles.checkoutButtonText}>Proceed To Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.white,
  },
  backButton: {
    width: 60,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2D5F3F',
  },
  itemCount: {
    fontSize: 16,
    color: '#999',
    fontWeight: '400',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emojiContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emoji: {
    fontSize: 56,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D5F3F',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 24,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  cartItemWrapper: {
    marginBottom: 16,
    position: 'relative',
  },
  deleteBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 100,
    backgroundColor: '#FF6B6B',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    width: 80,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartItemContainer: {
    backgroundColor: Colors.white,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    position: 'relative',
  },
  cartItemImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: Colors.white,
  },
  cartItemInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  cartItemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 4,
  },
  cartItemWeight: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  cartItemPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#34C759',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quantityControls: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingHorizontal: 4,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  quantityButtonDisabled: {
    opacity: 0.3,
  },
  quantityButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#34C759',
  },
  quantityButtonTextDisabled: {
    color: '#999',
  },
  quantityValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3436',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  footer: {
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '400',
    color: '#2D3436',
  },
  totalPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#34C759',
  },
  checkoutButton: {
    backgroundColor: '#34C759',
    borderRadius: 20,
    paddingVertical: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  checkoutButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
});
