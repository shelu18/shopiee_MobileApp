import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { getProductById } from '../../services/productService';
import { useCart } from '../../contexts/CartContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { Colors } from '../../constants/colors';
import { Product } from '../../types';

const { width } = Dimensions.get('window');

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart, getCartItemsCount } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();

  const cartCount = getCartItemsCount();

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      if (id) {
        const fetchedProduct = await getProductById(id);
        setProduct(fetchedProduct);
      }
    } catch (error) {
      console.error('Error loading product:', error);
      Alert.alert('Error', 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToBag = async () => {
    if (!product) return;

    if (product.stock < quantity) {
      Alert.alert('Out of Stock', 'Not enough items in stock');
      return;
    }

    try {
      await addToCart(product, quantity);
      Alert.alert('Success', `${quantity} ${product.name}${quantity > 1 ? 's' : ''} added to bag`, [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'View Cart',
          onPress: () => router.push('/(tabs)/cart'),
        },
      ]);
      
      // Reset quantity after adding
      setQuantity(1);
      // No need to reload - Redux already updated the stock
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add item to cart');
    }
  };

  const incrementQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleQuantityChange = (text: string) => {
    // Remove non-numeric characters
    const numericValue = text.replace(/[^0-9]/g, '');
    
    if (numericValue === '') {
      setQuantity(1);
      return;
    }

    const newQuantity = parseInt(numericValue, 10);
    
    if (isNaN(newQuantity) || newQuantity < 1) {
      setQuantity(1);
    } else if (product && newQuantity > product.stock) {
      Alert.alert(
        'Stock Limit Exceeded',
        `Only ${product.stock} units available. Setting quantity to maximum.`,
        [{ text: 'OK' }]
      );
      setQuantity(product.stock);
    } else {
      setQuantity(newQuantity);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#34C759" />
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={Colors.textSecondary} />
        <Text style={styles.errorText}>Product not found</Text>
        <TouchableOpacity style={styles.goBackButton} onPress={() => router.back()}>
          <Text style={styles.goBackButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const favorite = isFavorite(product.id);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header with Back and Cart */}
        <SafeAreaView edges={['top']} style={styles.headerContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => router.push('/(tabs)/cart')}
          >
            <Ionicons name="bag-outline" size={28} color={Colors.text} />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </SafeAreaView>

        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => toggleFavorite(product.id)}
          >
            <Ionicons
              name={favorite ? 'heart' : 'heart-outline'}
              size={28}
              color={Colors.white}
            />
          </TouchableOpacity>
        </View>

        {/* Product Info */}
        <View style={styles.infoContainer}>
          {/* Free Shipping Badge */}
          <View style={styles.shippingBadge}>
            <Ionicons name="car-outline" size={20} color="#34C759" />
            <Text style={styles.shippingText}>Free shipping</Text>
          </View>

          {/* Product Name */}
          <Text style={styles.productName}>{product.name}</Text>

          {/* Rating and Category */}
          <View style={styles.metaRow}>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={16} color="#FFC107" />
              <Text style={styles.ratingText}>4.7</Text>
            </View>
            <View style={styles.categoryBadge}>
              <Ionicons name="nutrition-outline" size={16} color="#34C759" />
              <Text style={styles.categoryText}>{product.category || 'Fruits'}</Text>
            </View>
          </View>

          {/* Price */}
          <Text style={styles.price}>
            $ {product.price}
            <Text style={styles.priceUnit}>/kg</Text>
          </Text>

          {/* Stock Indicator */}
          <View style={styles.stockContainer}>
            {product.stock === 0 ? (
              <View style={[styles.stockBadge, styles.stockOutOfStock]}>
                <Ionicons name="close-circle" size={16} color="#FF3B30" />
                <Text style={[styles.stockText, styles.stockTextDanger]}>Out of Stock</Text>
              </View>
            ) : product.stock <= 4 ? (
              <View style={[styles.stockBadge, styles.stockLow]}>
                <Ionicons name="alert-circle" size={16} color="#FF9500" />
                <Text style={[styles.stockText, styles.stockTextWarning]}>
                  Only {product.stock} left!
                </Text>
              </View>
            ) : product.stock <= 10 ? (
              <View style={[styles.stockBadge, styles.stockMedium]}>
                <Ionicons name="information-circle" size={16} color="#FF9500" />
                <Text style={[styles.stockText, styles.stockTextWarning]}>
                  {product.stock} units available
                </Text>
              </View>
            ) : (
              <View style={[styles.stockBadge, styles.stockHigh]}>
                <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                <Text style={[styles.stockText, styles.stockTextSuccess]}>In Stock</Text>
              </View>
            )}
          </View>

          {/* Description */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{product.description}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Section with Quantity and Add to Bag */}
      <SafeAreaView edges={['bottom']} style={styles.bottomContainer}>
        <View style={styles.bottomContent}>
          {/* Quantity Selector */}
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={[styles.quantityButton, quantity === 1 && styles.quantityButtonDisabled]}
              onPress={decrementQuantity}
              disabled={quantity === 1}
            >
              <Ionicons name="remove" size={24} color={quantity === 1 ? '#CCC' : '#34C759'} />
            </TouchableOpacity>
            <TextInput
              style={styles.quantityText}
              value={quantity.toString()}
              onChangeText={handleQuantityChange}
              keyboardType="number-pad"
              maxLength={4}
              selectTextOnFocus
            />
            <TouchableOpacity
              style={[
                styles.quantityButton,
                quantity >= product.stock && styles.quantityButtonDisabled,
              ]}
              onPress={incrementQuantity}
              disabled={quantity >= product.stock}
            >
              <Ionicons
                name="add"
                size={24}
                color={quantity >= product.stock ? '#CCC' : '#34C759'}
              />
            </TouchableOpacity>
          </View>

          {/* Add to Bag Button */}
          <TouchableOpacity
            style={[styles.addToBagButton, product.stock === 0 && styles.buttonDisabled]}
            onPress={handleAddToBag}
            disabled={product.stock === 0}
          >
            <Text style={styles.addToBagText}>
              {product.stock === 0 ? 'Out of Stock' : 'Add to bag'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginTop: 16,
    marginBottom: 24,
  },
  goBackButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#34C759',
    borderRadius: 8,
  },
  goBackButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    zIndex: 10,
  },
  backButton: {
    width: 60,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cartButton: {
    position: 'relative',
    padding: 8,
  },
  cartBadge: {
    position: 'absolute',
    right: 4,
    top: 4,
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  imageContainer: {
    width: width,
    height: width * 1.1,
    backgroundColor: '#F5F5F5',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  favoriteButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  infoContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  shippingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  shippingText: {
    fontSize: 16,
    color: '#34C759',
    fontWeight: '600',
    marginLeft: 8,
  },
  productName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1E1E1E',
    marginBottom: 16,
    lineHeight: 42,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E1E1E',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E1E1E',
  },
  price: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#34C759',
    marginBottom: 24,
  },
  priceUnit: {
    fontSize: 20,
    color: '#999',
    fontWeight: '400',
  },
  descriptionContainer: {
    marginTop: 8,
  },
  descriptionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E1E1E',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    color: '#999',
    lineHeight: 24,
  },
  stockContainer: {
    marginTop: 12,
    marginBottom: 8,
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  stockHigh: {
    backgroundColor: '#E8F8EC',
  },
  stockMedium: {
    backgroundColor: '#FFF4E6',
  },
  stockLow: {
    backgroundColor: '#FFF4E6',
  },
  stockOutOfStock: {
    backgroundColor: '#FFE8E6',
  },
  stockText: {
    fontSize: 13,
    fontWeight: '600',
  },
  stockTextSuccess: {
    color: '#34C759',
  },
  stockTextWarning: {
    color: '#FF9500',
  },
  stockTextDanger: {
    color: '#FF3B30',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 12,
  },
  bottomContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 8,
  },
  quantityButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonDisabled: {
    opacity: 0.3,
  },
  quantityText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1E1E1E',
    marginHorizontal: 20,
    minWidth: 60,
    textAlign: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  addToBagButton: {
    flex: 1,
    backgroundColor: '#34C759',
    paddingVertical: 18,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: Colors.textSecondary,
  },
  addToBagText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
});
