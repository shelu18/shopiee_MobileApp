import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FavoritesState {
  favoriteIds: string[];
}

const initialState: FavoritesState = {
  favoriteIds: [],
};

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    setFavorites: (state, action: PayloadAction<string[]>) => {
      state.favoriteIds = action.payload;
    },
    toggleFavorite: (state, action: PayloadAction<string>) => {
      const index = state.favoriteIds.indexOf(action.payload);
      if (index > -1) {
        state.favoriteIds.splice(index, 1);
      } else {
        state.favoriteIds.push(action.payload);
      }
    },
    clearFavorites: (state) => {
      state.favoriteIds = [];
    },
  },
});

export const { setFavorites, toggleFavorite, clearFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer;
