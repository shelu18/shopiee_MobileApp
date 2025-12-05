import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '../../types';

interface ProductsState {
  products: Product[];
  loading: boolean;
  error: string | null;
}

const initialState: ProductsState = {
  products: [],
  loading: false,
  error: null,
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    updateProductStock: (
      state,
      action: PayloadAction<{ productId: string; stock: number }>
    ) => {
      const product = state.products.find((p) => p.id === action.payload.productId);
      if (product) {
        product.stock = action.payload.stock;
      }
    },
  },
});

export const { setProducts, setLoading, setError, updateProductStock } =
  productsSlice.actions;
export default productsSlice.reducer;
