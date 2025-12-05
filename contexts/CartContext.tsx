import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product, CartItem, CartContextType } from '../types';
import { updateProductStock, getProductById } from '../services/productService';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  setCartItems as setCartItemsRedux, 
  addItem, 
  updateItemQuantity, 
  removeItem, 
  clearCart as clearCartRedux 
} from '../store/slices/cartSlice';
import { updateProductStock as updateProductStockRedux } from '../store/slices/productsSlice';

const CART_STORAGE_KEY = '@shopping_cart';

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from AsyncStorage on mount
  useEffect(() => {
    loadCart();
  }, []);

  // Save cart to AsyncStorage whenever it changes (skip initial load)
  useEffect(() => {
    if (isInitialized) {
      saveCart();
    }
  }, [cartItems, isInitialized]);

  const loadCart = async () => {
    try {
      const cartData = await AsyncStorage.getItem(CART_STORAGE_KEY);
      if (cartData) {
        const items = JSON.parse(cartData);
        dispatch(setCartItemsRedux(items));
      }
      setIsInitialized(true);
    } catch (error) {
      console.error('Error loading cart:', error);
      setIsInitialized(true);
    }
  };

  const saveCart = async () => {
    try {
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  };

  const addToCart = async (product: Product, quantity: number) => {
    try {
      const existingItem = cartItems.find((item) => item.product.id === product.id);
      const currentCartQuantity = existingItem ? existingItem.quantity : 0;
      const totalQuantity = currentCartQuantity + quantity;

      // Get product from Redux store first (faster than Firestore)
      const storeProduct = product;
      
      if (totalQuantity > storeProduct.stock) {
        throw new Error(`Only ${storeProduct.stock} items available in stock`);
      }

      const newStock = storeProduct.stock - quantity;

      // OPTIMISTIC UPDATE: Update UI immediately
      dispatch(updateProductStockRedux({ productId: product.id, stock: newStock }));
      dispatch(addItem({ product: { ...product, stock: newStock }, quantity }));

      // Update Firestore in background (non-blocking)
      updateProductStock(product.id, newStock).catch((error) => {
        console.error('Background stock update failed:', error);
        // Rollback on failure
        dispatch(updateProductStockRedux({ productId: product.id, stock: storeProduct.stock }));
        dispatch(removeItem(product.id));
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      const itemToRemove = cartItems.find((item) => item.product.id === productId);
      
      if (itemToRemove) {
        const restoredStock = itemToRemove.product.stock + itemToRemove.quantity;
        
        // OPTIMISTIC UPDATE: Update UI immediately
        dispatch(updateProductStockRedux({ productId, stock: restoredStock }));
        dispatch(removeItem(productId));

        // Update Firestore in background
        updateProductStock(productId, restoredStock).catch((error) => {
          console.error('Background stock restoration failed:', error);
        });
      } else {
        dispatch(removeItem(productId));
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  };

  const updateQuantity = async (productId: string, newQuantity: number) => {
    try {
      if (newQuantity <= 0) {
        await removeFromCart(productId);
        return;
      }

      const cartItem = cartItems.find((item) => item.product.id === productId);
      if (!cartItem) return;

      const quantityDifference = newQuantity - cartItem.quantity;

      // Check stock from current cart item (already has latest stock)
      if (quantityDifference > 0 && quantityDifference > cartItem.product.stock) {
        throw new Error(`Only ${cartItem.product.stock} more items available`);
      }

      const newStock = cartItem.product.stock - quantityDifference;

      // OPTIMISTIC UPDATE: Update UI immediately
      dispatch(updateProductStockRedux({ productId, stock: newStock }));
      dispatch(updateItemQuantity({ productId, quantity: newQuantity }));

      // Update Firestore in background
      updateProductStock(productId, newStock).catch((error) => {
        console.error('Background quantity update failed:', error);
      });
    } catch (error) {
      console.error('Error updating quantity:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      // Store items for restoration
      const itemsToRestore = [...cartItems];

      // OPTIMISTIC UPDATE: Clear UI immediately
      dispatch(clearCartRedux());
      await AsyncStorage.removeItem(CART_STORAGE_KEY);

      // Restore stock in background
      Promise.all(
        itemsToRestore.map(async (item) => {
          const restoredStock = item.product.stock + item.quantity;
          await updateProductStock(item.product.id, restoredStock);
          dispatch(updateProductStockRedux({ productId: item.product.id, stock: restoredStock }));
        })
      ).catch((error) => {
        console.error('Background stock restoration failed:', error);
      });
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  };

  const completeOrder = async () => {
    try {
      // Save order to Firestore before clearing
      const orderItems = cartItems.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
      }));

      const orderNumber = `ORD${Date.now().toString().slice(-8)}`;
      const total = getCartTotal();

      // Import user from auth context
      const auth = require('../firebaseConfig').auth;
      const { collection, addDoc, serverTimestamp } = require('firebase/firestore');
      const db = require('../firebaseConfig').db;

      if (auth.currentUser) {
        await addDoc(collection(db, 'orders'), {
          userId: auth.currentUser.uid,
          orderNumber,
          items: orderItems,
          total,
          status: 'processing',
          createdAt: serverTimestamp(),
        });
      }

      // Clear cart WITHOUT restoring stock (order is completed)
      dispatch(clearCartRedux());
      await AsyncStorage.removeItem(CART_STORAGE_KEY);
    } catch (error) {
      console.error('Error completing order:', error);
      throw error;
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0);
  };

  const getCartItemsCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        completeOrder,
        getCartTotal,
        getCartItemsCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
