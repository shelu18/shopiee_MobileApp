import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { Colors } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';

export default function WelcomeScreen() {
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signInWithGoogle } = useAuth();

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      // Navigation will be handled by AuthContext after successful sign-in
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      
      let errorMessage = 'Failed to sign in with Google. Please try again.';
      
      if (error.message?.includes('popup_closed_by_user') || error.message?.includes('user_cancelled')) {
        errorMessage = 'Sign-in was cancelled. Please try again.';
      } else if (error.message?.includes('network')) {
        errorMessage = 'Network error. Please check your internet connection.';
      }
      
      Alert.alert('Sign In Failed', errorMessage);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Let's Get Started!</Text>
          <Text style={styles.subtitle}>Choose your preferred sign-in method</Text>
        </View>

        <View style={styles.buttonContainer}>
          {/* Continue with Email */}
          <TouchableOpacity
            style={styles.emailButton}
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.7}
          >
            <Ionicons name="mail-outline" size={24} color={Colors.text} />
            <Text style={styles.emailButtonText}>Continue with Email</Text>
          </TouchableOpacity>

          {/* Continue with Google */}
          <TouchableOpacity
            style={[styles.googleButton, googleLoading && styles.buttonDisabled]}
            onPress={handleGoogleSignIn}
            disabled={googleLoading}
            activeOpacity={0.7}
          >
            {googleLoading ? (
              <ActivityIndicator color={Colors.text} />
            ) : (
              <>
                <Image
                  source={{ uri: 'https://lh3.googleusercontent.com/COxitqgJr1sJnIDe8-jiKhxDx1FrYbtRHKJ9z_hELisAlapwE9LUPh6fcXIfb5vwpbMl4xl9H9TRFPc5NOO8Sb3VSgIBrfRYvW6cUA' }}
                  style={styles.icon}
                />
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Continue with Apple */}
          <TouchableOpacity
            style={styles.appleButton}
            activeOpacity={0.7}
          >
            <Ionicons name="logo-apple" size={24} color={Colors.white} />
            <Text style={styles.appleButtonText}>Continue with Apple</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>By continuing, you agree to our Terms & Privacy Policy</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 48,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  buttonContainer: {
    gap: 16,
  },
  emailButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emailButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  googleButton: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  appleButton: {
    backgroundColor: Colors.text,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  appleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  icon: {
    width: 24,
    height: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  footer: {
    marginTop: 48,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
