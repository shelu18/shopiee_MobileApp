import { collection, getDocs, query, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Product } from '../types';

// Fetch all products from Firestore
export async function getAllProducts(): Promise<Product[]> {
  try {
    const productsCollection = collection(db, 'products');
    const productsSnapshot = await getDocs(productsCollection);
    
    const products: Product[] = productsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Product, 'id'>),
    }));

    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

// Fetch a single product by ID
export async function getProductById(productId: string): Promise<Product | null> {
  try {
    const productDoc = doc(db, 'products', productId);
    const productSnapshot = await getDoc(productDoc);

    if (productSnapshot.exists()) {
      return {
        id: productSnapshot.id,
        ...(productSnapshot.data() as Omit<Product, 'id'>),
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
}

// Update product stock (for inventory management)
export async function updateProductStock(productId: string, newStock: number): Promise<void> {
  try {
    const productDoc = doc(db, 'products', productId);
    await updateDoc(productDoc, { stock: newStock });
  } catch (error) {
    console.error('Error updating product stock:', error);
    throw error;
  }
}

// Search products by name
export function searchProducts(products: Product[], searchTerm: string): Product[] {
  const lowerCaseSearch = searchTerm.toLowerCase();
  return products.filter((product) =>
    product.name.toLowerCase().includes(lowerCaseSearch) ||
    product.description.toLowerCase().includes(lowerCaseSearch)
  );
}
