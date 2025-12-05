import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  setFavorites as setFavoritesRedux, 
  toggleFavorite as toggleFavoriteRedux 
} from '../store/slices/favoritesSlice';

interface FavoritesContextType {
  favorites: string[]; // Array of product IDs
  addToFavorites: (productId: string) => Promise<void>;
  removeFromFavorites: (productId: string) => Promise<void>;
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const favorites = useAppSelector((state) => state.favorites.favoriteIds);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    loadFavorites();
  }, []);

  useEffect(() => {
    if (isInitialized) {
      saveFavorites();
    }
  }, [favorites, isInitialized]);

  const loadFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem('@favorites');
      if (storedFavorites) {
        dispatch(setFavoritesRedux(JSON.parse(storedFavorites)));
      }
      setIsInitialized(true);
    } catch (error) {
      console.error('Error loading favorites:', error);
      setIsInitialized(true);
    }
  };

  const saveFavorites = async () => {
    try {
      await AsyncStorage.setItem('@favorites', JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  };

  const addToFavorites = async (productId: string) => {
    if (!favorites.includes(productId)) {
      dispatch(toggleFavoriteRedux(productId));
    }
  };

  const removeFromFavorites = async (productId: string) => {
    if (favorites.includes(productId)) {
      dispatch(toggleFavoriteRedux(productId));
    }
  };

  const isFavorite = (productId: string): boolean => {
    return favorites.includes(productId);
  };

  const toggleFavorite = async (productId: string) => {
    dispatch(toggleFavoriteRedux(productId));
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
        toggleFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
