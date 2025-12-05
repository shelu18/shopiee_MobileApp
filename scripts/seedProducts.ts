import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const products = [
  {
    id: 'prod_001',
    name: 'Wireless Headphones',
    description: 'Premium noise-canceling wireless headphones with 30-hour battery life. Perfect for music lovers and professionals.',
    price: 2499,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
    stock: 25,
  },
  {
    id: 'prod_002',
    name: 'Smart Watch Pro',
    description: 'Advanced fitness tracking smartwatch with heart rate monitor, GPS, and water resistance up to 50m.',
    price: 4999,
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
    stock: 15,
  },
  {
    id: 'prod_003',
    name: 'Laptop Stand',
    description: 'Ergonomic aluminum laptop stand with adjustable height. Improves posture and reduces neck strain.',
    price: 1299,
    imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500',
    stock: 50,
  },
  {
    id: 'prod_004',
    name: 'Mechanical Keyboard',
    description: 'RGB backlit mechanical gaming keyboard with blue switches. Perfect for gaming and typing enthusiasts.',
    price: 3499,
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500',
    stock: 30,
  },
  {
    id: 'prod_005',
    name: 'Wireless Mouse',
    description: 'Ergonomic wireless mouse with precision tracking and rechargeable battery lasting up to 3 months.',
    price: 899,
    imageUrl: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=500',
    stock: 40,
  },
  {
    id: 'prod_006',
    name: 'USB-C Hub',
    description: '7-in-1 USB-C hub with HDMI, USB 3.0 ports, SD card reader, and 100W power delivery.',
    price: 1999,
    imageUrl: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=500',
    stock: 35,
  },
  {
    id: 'prod_007',
    name: 'Phone Case Premium',
    description: 'Military-grade drop protection phone case with raised edges for screen and camera protection.',
    price: 599,
    imageUrl: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=500',
    stock: 100,
  },
  {
    id: 'prod_008',
    name: 'Portable Charger 20000mAh',
    description: 'High-capacity power bank with fast charging support and dual USB ports. Charge multiple devices.',
    price: 1799,
    imageUrl: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500',
    stock: 45,
  },
  {
    id: 'prod_009',
    name: 'Bluetooth Speaker',
    description: 'Waterproof portable Bluetooth speaker with 360° sound and 12-hour playtime. Perfect for outdoors.',
    price: 2999,
    imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500',
    stock: 20,
  },
  {
    id: 'prod_010',
    name: 'Webcam HD 1080p',
    description: 'Full HD webcam with auto-focus and built-in microphone. Ideal for video calls and streaming.',
    price: 3299,
    imageUrl: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=500',
    stock: 18,
  },
];

async function seedProducts() {
  console.log('🌱 Starting to seed products...');
  
  try {
    const productsCollection = collection(db, 'products');
    
    for (const product of products) {
      await addDoc(productsCollection, product);
      console.log(`✅ Added: ${product.name}`);
    }
    
    console.log('🎉 All products added successfully!');
    console.log(`📦 Total products: ${products.length}`);
  } catch (error) {
    console.error('❌ Error seeding products:', error);
  }
}

// Run the seed function
seedProducts();
