require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, doc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function clearProducts() {
  try {
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);
    
    console.log(`🗑️  Found ${snapshot.size} products to delete...`);
    
    for (const document of snapshot.docs) {
      await deleteDoc(doc(db, 'products', document.id));
      console.log(`✅ Deleted: ${document.data().name}`);
    }
    
    console.log('🎉 All products deleted successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing products:', error);
    process.exit(1);
  }
}

clearProducts();
