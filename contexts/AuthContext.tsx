



import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendEmailVerification,
  updateProfile,
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { auth } from '../firebaseConfig';
import { User, AuthContextType } from '../types';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setUser as setUserRedux, setLoading as setLoadingRedux, clearUser } from '../store/slices/authSlice';

// IMPORTANT: Complete auth session
WebBrowser.maybeCompleteAuthSession();

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Client IDs
const WEB_CLIENT_ID = '66106372266-nlci3m6avt7o0a7reqlpt12t9b9vdt41.apps.googleusercontent.com';
const ANDROID_CLIENT_ID = '66106372266-hkfq1nkoj52akhj7qs19ch9d7053die0.apps.googleusercontent.com';

export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const loading = useAppSelector((state) => state.auth.loading);

  // Google Auth configuration
  // Provide androidClientId (required by library on Android)
  // Use expoClientId to force Expo proxy auth in Expo Go
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: ANDROID_CLIENT_ID, // Required on Android platform
    expoClientId: WEB_CLIENT_ID, // Forces Expo proxy - overrides androidClientId in Expo Go
    iosClientId: WEB_CLIENT_ID,
    webClientId: WEB_CLIENT_ID,
    scopes: ['profile', 'email', 'openid'],
  });

  // Log configuration
  useEffect(() => {
    console.log('═══════════════════════════════════════════════════════');
    console.log('🔧 GOOGLE OAUTH CONFIGURATION');
    console.log('═══════════════════════════════════════════════════════');
    console.log('🔑 Using: Web Client ID (supports redirect URI)');
    console.log('🌐 Redirect: https://auth.expo.io/@shelu18/shopping-app');
    console.log('📱 Works in: Expo Go (via proxy)');
    console.log('═══════════════════════════════════════════════════════');
  }, []);

  // Handle OAuth response
  useEffect(() => {
    console.log('📨 OAuth Response:', response?.type);
    
    if (response?.type === 'success') {
      console.log('✅ OAuth Success! Processing authentication...');
      const { authentication } = response;
      
      console.log('🔑 Has idToken:', !!authentication?.idToken);
      console.log('🔑 Has accessToken:', !!authentication?.accessToken);
      
      if (authentication?.idToken) {
        console.log('🔐 Creating Firebase credential...');
        const credential = GoogleAuthProvider.credential(
          authentication.idToken,
          authentication.accessToken
        );
        
        console.log('🔥 Signing in with Firebase...');
        signInWithCredential(auth, credential)
          .then((userCredential) => {
            const userData: User = {
              uid: userCredential.user.uid,
              email: userCredential.user.email,
              displayName: userCredential.user.displayName,
              emailVerified: userCredential.user.emailVerified,
            };
            dispatch(setUserRedux(userData as any));
            console.log('✅ Google Sign-In successful!');
            console.log('👤 User:', userCredential.user.email);
          })
          .catch((error) => {
            console.error('❌ Firebase error:', error.message);
            console.error('🔍 Firebase error code:', error.code);
          });
      } else {
        console.error('❌ No idToken received from Google!');
      }
    } else if (response?.type === 'error') {
      console.error('❌ OAuth Error:', response.error);
    } else if (response?.type) {
      console.log('ℹ️ OAuth Response type:', response.type);
    }
  }, [response]);

  // Auth state listener
  useEffect(() => {
    console.log('🔌 Setting up auth listener...');
    
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log('🔄 Auth state:', firebaseUser ? 'Logged in' : 'No user');
      
      if (firebaseUser) {
        const userData: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          emailVerified: firebaseUser.emailVerified,
        };
        dispatch(setUserRedux(userData as any));
      } else {
        dispatch(clearUser());
      }
      dispatch(setLoadingRedux(false));
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: fullName });
      await sendEmailVerification(userCredential.user);
      await userCredential.user.reload();
      
      const userData: User = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: fullName,
        emailVerified: userCredential.user.emailVerified,
      };
      dispatch(setUserRedux(userData as any));
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userData: User = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        emailVerified: userCredential.user.emailVerified,
      };
      dispatch(setUserRedux(userData as any));
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      dispatch(clearUser());
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const sendVerificationEmail = async () => {
    if (auth.currentUser) {
      try {
        await sendEmailVerification(auth.currentUser);
      } catch (error: any) {
        throw new Error(error.message);
      }
    }
  };

  const reloadUser = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      const userData: User = {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        displayName: auth.currentUser.displayName,
        emailVerified: auth.currentUser.emailVerified,
      };
      dispatch(setUserRedux(userData as any));
    }
  };

  const signInWithGoogle = async () => {
    console.log('🔵 Starting Google Sign-In...');
    console.log('📋 Request ready:', !!request);

    if (!request) {
      throw new Error('Google Sign-In is not ready');
    }

    try {
      console.log('🌐 Opening browser for authentication...');
      const result = await promptAsync();
      
      console.log('📬 Auth result type:', result.type);
      console.log('📄 Full result:', JSON.stringify(result, null, 2));
      
      if (result.type === 'cancel' || result.type === 'dismiss') {
        console.log('⚠️ User cancelled or dismissed sign-in');
        throw new Error('Sign-in was cancelled');
      }
      
      if (result.type !== 'success') {
        console.log('❌ Sign-in failed with type:', result.type);
        throw new Error(`Sign-in failed: ${result.type}`);
      }

      console.log('✅ Sign-in successful, processing...');
    } catch (error: any) {
      console.error('❌ Google Sign-In Error:', error.message);
      console.error('🔍 Error stack:', error.stack);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signUp,
        signIn,
        signOut,
        sendVerificationEmail,
        reloadUser,
        signInWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}