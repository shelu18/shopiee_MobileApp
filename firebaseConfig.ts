import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

/**
 * Firebase Configuration
 * 
 * Environment Variable Loading Strategy:
 * 1. Development (Expo Go): Uses @env imports from .env via babel-plugin-dotenv
 * 2. Production (EAS Build): Uses expo-constants from eas.json env section
 * 
 * This dual approach ensures:
 * - Hot reload in development
 * - Secure env var injection in production builds
 */

// Import from @env for development (babel-plugin-dotenv)
import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
  FIREBASE_MEASUREMENT_ID,
} from '@env';

/**
 * Get environment variable with fallback strategy
 * Priority: @env (dev) → Constants.expoConfig.extra (production)
 */
const getEnvVar = (envName: string, constantsKey: string): string => {
  // Development: Use @env imports
  if (__DEV__) {
    const devValue = envName;
    if (devValue && devValue !== '') {
      return devValue;
    }
  }
  
  // Production: Use expo-constants (injected by EAS build)
  const prodValue = Constants.expoConfig?.extra?.[constantsKey];
  if (prodValue) {
    return prodValue;
  }
  
  // Fallback to empty string (will be caught by validation)
  console.error(`❌ Missing env var: ${constantsKey}`);
  return '';
};

const firebaseConfig = {
  apiKey: getEnvVar(FIREBASE_API_KEY, 'FIREBASE_API_KEY'),
  authDomain: getEnvVar(FIREBASE_AUTH_DOMAIN, 'FIREBASE_AUTH_DOMAIN'),
  projectId: getEnvVar(FIREBASE_PROJECT_ID, 'FIREBASE_PROJECT_ID'),
  storageBucket: getEnvVar(FIREBASE_STORAGE_BUCKET, 'FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnvVar(FIREBASE_MESSAGING_SENDER_ID, 'FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnvVar(FIREBASE_APP_ID, 'FIREBASE_APP_ID'),
  measurementId: getEnvVar(FIREBASE_MEASUREMENT_ID, 'FIREBASE_MEASUREMENT_ID'),
};

// Validate configuration
const missingKeys = Object.entries(firebaseConfig)
  .filter(([_, value]) => !value || value === '')
  .map(([key]) => key);

if (missingKeys.length > 0) {
  const errorMsg = `Firebase configuration error: Missing ${missingKeys.join(', ')}`;
  console.error('❌', errorMsg);
  
  if (!__DEV__) {
    // In production, this is critical - throw error
    throw new Error(errorMsg);
  }
} else {
  console.log('✅ Firebase config validated successfully');
  if (__DEV__) {
    console.log('📝 Config:', {
      apiKey: firebaseConfig.apiKey.substring(0, 10) + '...',
      projectId: firebaseConfig.projectId,
    });
  }
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication with AsyncStorage persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore
export const db = getFirestore(app);

export default app;
