import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Product } from '../../types';
import { getAllProducts } from '../../services/productService';
import { useCart } from '../../contexts/CartContext';
import { useFavorites } from '../../contexts/FavoritesContext';

const FILTER_CATEGORIES = [
  'Mango',
  'Avocado',
  'Sweet Fruit',
  'Grape',
  'Bread',
  'Pineapple',
  'Raw Meat',
];

export default function SearchScreen() {
  const [searchText, setSearchText] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { getCartItemsCount } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToCart } = useCart();

  const cartCount = getCartItemsCount();

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchText, selectedFilters, products]);

  const loadProducts = async () => {
    try {
      const fetchedProducts = await getAllProducts();
      setProducts(fetchedProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Filter by search text
    if (searchText.trim()) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchText.toLowerCase()) ||
          product.description.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Filter by selected categories
    if (selectedFilters.length > 0) {
      filtered = filtered.filter((product) => {
        // Check if product tags include any of the selected filters
        if (product.tags && product.tags.length > 0) {
          return selectedFilters.some((filter) =>
            product.tags!.some((tag) => tag.toLowerCase().includes(filter.toLowerCase()))
          );
        }
        // Fallback to checking product name
        return selectedFilters.some((filter) =>
          product.name.toLowerCase().includes(filter.toLowerCase())
        );
      });
    }

    setFilteredProducts(filtered);
  };

  const toggleFilter = (filter: string) => {
    setSelectedFilters((prev) => {
      if (prev.includes(filter)) {
        return prev.filter((f) => f !== filter);
      } else {
        return [...prev, filter];
      }
    });
  };

  const clearFilters = () => {
    setSelectedFilters([]);
  };

  const handleAddToCart = async (product: Product) => {
    try {
      await addToCart(product, 1);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={Colors.text} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Search Groceries</Text>
      <TouchableOpacity style={styles.cartButton} onPress={() => router.push('/(tabs)/cart')}>
        <Ionicons name="cart-outline" size={28} color={Colors.text} />
        {cartCount > 0 && (
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{cartCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderSearchBar = () => (
    <View style={styles.searchSection}>
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#34C759" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search fresh groceries"
            placeholderTextColor={Colors.placeholder}
            value={searchText}
            onChangeText={setSearchText}
            autoFocus={false}
          />
          {searchText && (
            <TouchableOpacity 
              style={styles.clearInputButton}
              onPress={() => setSearchText('')}
            >
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options-outline" size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>
      {selectedFilters.length > 0 && (
        <View style={styles.activeFiltersRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {selectedFilters.map((filter) => (
              <View key={filter} style={styles.activeFilterChip}>
                <Text style={styles.activeFilterText}>{filter}</Text>
                <TouchableOpacity onPress={() => toggleFilter(filter)}>
                  <Ionicons name="close" size={16} color="#34C759" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity 
            style={styles.clearAllButton}
            onPress={() => setSelectedFilters([])}
          >
            <Text style={styles.clearAllText}>Clear</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderFilters = () => {
    // Hide filters when search is active
    if (searchText || selectedFilters.length > 0) {
      return null;
    }
    
    return (
      <View style={styles.filtersSection}>
        <View style={styles.filterHeader}>
          <Text style={styles.filterTitle}>Title</Text>
          {selectedFilters.length > 0 && (
            <TouchableOpacity onPress={clearFilters}>
              <Text style={styles.removeText}>remove</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.filterChips}>
          {FILTER_CATEGORIES.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterChip,
                selectedFilters.includes(filter) && styles.filterChipActive,
              ]}
              onPress={() => toggleFilter(filter)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedFilters.includes(filter) && styles.filterChipTextActive,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderProduct = ({ item }: { item: Product }) => {
    const favorite = isFavorite(item.id);
    
    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => router.push(`/product/${item.id}`)}
      >
        <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.priceRow}>
            <Text style={styles.productPrice}>$ {item.price}</Text>
            <Text style={styles.priceUnit}>/kg</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(item.id)}
        >
          <Ionicons
            name={favorite ? 'heart' : 'heart-outline'}
            size={20}
            color={Colors.error}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => handleAddToCart(item)}
        >
          <Ionicons name="add" size={20} color={Colors.white} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderResults = () => (
    <View style={styles.resultsSection}>
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>Found {filteredProducts.length} Results</Text>
        <TouchableOpacity style={styles.viewToggle}>
          <Ionicons name="apps-outline" size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item, index) => `search_${item.id}_${index}`}
        scrollEnabled={false}
        contentContainerStyle={styles.productList}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={64} color={Colors.textSecondary} />
              <Text style={styles.emptyText}>No products found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
            </View>
          ) : null
        }
      />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top']}>
        {renderHeader()}
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {renderHeader()}
      <ScrollView showsVerticalScrollIndicator={false}>
        {renderSearchBar()}
        {renderFilters()}
        {renderResults()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 60,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingLeft: 18,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
    textAlign: 'center',
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
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    paddingHorizontal: 12,
    minHeight: 50,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    height: '100%',
  },
  clearInputButton: {
    padding: 4,
  },
  activeFiltersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  activeFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    marginRight: 8,
  },
  activeFilterText: {
    fontSize: 14,
    color: '#34C759',
    fontWeight: '500',
  },
  clearAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearAllText: {
    fontSize: 14,
    color: '#34C759',
    fontWeight: '600',
  },
  filterButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  filterTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
  },
  removeText: {
    fontSize: 14,
    color: Colors.error,
    fontWeight: '500',
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterChipActive: {
    backgroundColor: '#34C759',
    borderColor: '#34C759',
  },
  filterChipText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: Colors.white,
  },
  resultsSection: {
    paddingTop: 12,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  resultsText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
  },
  viewToggle: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#F8F8F8',
    borderRadius: 20,
    marginBottom: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    position: 'relative',
  },
  productImage: {
    width: 90,
    height: 90,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34C759',
  },
  priceUnit: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 2,
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  addButton: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    backgroundColor: '#34C759',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
  },
});

