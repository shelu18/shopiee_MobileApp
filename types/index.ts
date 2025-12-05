// Product Types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  category?: string;
  tags?: string[]; // For filtering (e.g., ['Mango', 'Sweet Fruit'])
}

// Cart Types
export interface CartItem {
  product: Product;
  quantity: number;
}

// User Types
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
}

// Auth Context Types
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  reloadUser: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

// Cart Context Types
export interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  completeOrder: () => Promise<void>;
  getCartTotal: () => number;
  getCartItemsCount: () => number;
}
