const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, getDocs, deleteDoc } = require('firebase/firestore');
require('dotenv').config();

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const products = [
  {
    id: 'prod_001',
    name: 'Fresh Apples',
    description: 'Crisp and sweet red apples, perfect for snacking or baking. Rich in fiber and vitamins.',
    price: 2.99,
    imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500',
    stock: 50,
    category: 'Fruits',
    tags: ['Sweet Fruit', 'Fresh'],
  },
  {
    id: 'prod_002',
    name: 'Ripe Bananas',
    description: 'Fresh yellow bananas, great source of potassium and energy. Perfect for smoothies.',
    price: 1.49,
    imageUrl: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=500',
    stock: 100,
    category: 'Fruits',
    tags: ['Sweet Fruit', 'Fresh'],
  },
  {
    id: 'prod_003',
    name: 'Sweet Oranges',
    description: 'Juicy citrus oranges packed with Vitamin C. Perfect for fresh juice or snacking.',
    price: 3.49,
    imageUrl: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=500',
    stock: 75,
    category: 'Fruits',
    tags: ['Sweet Fruit', 'Fresh'],
  },
  {
    id: 'prod_004',
    name: 'Fresh Strawberries',
    description: 'Sweet and juicy strawberries, rich in antioxidants. Great for desserts and smoothies.',
    price: 4.99,
    imageUrl: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=500',
    stock: 40,
    category: 'Fruits',
    tags: ['Sweet Fruit', 'Fresh'],
  },
  {
    id: 'prod_005',
    name: 'Red Grapes',
    description: 'Seedless red grapes, naturally sweet and perfect for snacking or making juice.',
    price: 3.99,
    imageUrl: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=500',
    stock: 60,
    category: 'Fruits',
    tags: ['Grape', 'Sweet Fruit', 'Fresh'],
  },
  {
    id: 'prod_006',
    name: 'Ripe Mangoes',
    description: 'Sweet tropical mangoes, rich in vitamins. Perfect for smoothies and desserts.',
    price: 4.49,
    imageUrl: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=500',
    stock: 45,
    category: 'Fruits',
    tags: ['Mango', 'Sweet Fruit', 'Fresh'],
  },
  {
    id: 'prod_007',
    name: 'Fresh Watermelon',
    description: 'Juicy and refreshing watermelon, perfect for hot summer days. Low in calories.',
    price: 2.49,
    imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500',
    stock: 30,
    category: 'Fruits',
    tags: ['Sweet Fruit', 'Fresh'],
  },
  {
    id: 'prod_008',
    name: 'Sweet Pineapple',
    description: 'Tropical pineapple with sweet tangy flavor. Great source of vitamin C and manganese.',
    price: 3.99,
    imageUrl: 'https://images.unsplash.com/photo-1550828520-4cb496926fc9?w=500',
    stock: 35,
    category: 'Fruits',
    tags: ['Pineapple', 'Sweet Fruit', 'Fresh'],
  },
  {
    id: 'prod_009',
    name: 'Fresh Blueberries',
    description: 'Plump blueberries packed with antioxidants. Perfect for breakfast or baking.',
    price: 4.99,
    imageUrl: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=500',
    stock: 50,
    category: 'Fruits',
    tags: ['Sweet Fruit', 'Fresh'],
  },
  {
    id: 'prod_010',
    name: 'Ripe Avocados',
    description: 'Creamy avocados rich in healthy fats. Perfect for salads, toast, and smoothies.',
    price: 2.99,
    imageUrl: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=500',
    stock: 55,
    category: 'Fruits',
    tags: ['Avocado', 'Fresh'],
  },
];

async function seedProducts() {
  console.log('🌱 Starting to seed products...');
  
  try {
    // First, delete all existing products
    console.log('🗑️  Deleting existing products...');
    const productsCollection = collection(db, 'products');
    const existingProducts = await getDocs(productsCollection);
    
    for (const productDoc of existingProducts.docs) {
      await deleteDoc(doc(db, 'products', productDoc.id));
      console.log(`🗑️  Deleted: ${productDoc.id}`);
    }
    
    console.log('✨ All existing products deleted. Adding new products...\n');
    
    // Now add the new products
    for (const product of products) {
      const productId = product.id;
      const productData = { ...product };
      delete productData.id; // Remove id from data since it's stored as document ID
      
      const productDoc = doc(db, 'products', productId);
      await setDoc(productDoc, productData);
      console.log(`✅ Added: ${product.name} (ID: ${productId})`);
    }
    
    console.log('\n🎉 All products added successfully!');
    console.log(`📦 Total products: ${products.length}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    process.exit(1);
  }
}

seedProducts();
