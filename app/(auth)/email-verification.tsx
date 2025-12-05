import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { Colors } from '../../constants/colors';

export default function EmailVerificationScreen() {
  const { user, sendVerificationEmail, reloadUser, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    // Check email verification status every 3 seconds
    const interval = setInterval(async () => {
      await checkVerificationStatus();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Handle cooldown timer
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const checkVerificationStatus = async () => {
    try {
      await reloadUser();
      if (user?.emailVerified) {
        Alert.alert(
          'Email Verified!',
          'Your email has been successfully verified.',
          [
            {
              text: 'Continue',
              onPress: () => router.replace('/(tabs)/home'),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error checking verification:', error);
    }
  };

  const handleResendEmail = async () => {
    if (resendCooldown > 0) return;

    setLoading(true);
    try {
      await sendVerificationEmail();
      setResendCooldown(60); // 60 second cooldown
      Alert.alert('Success', 'Verification email has been resent. Please check your inbox.');
    } catch (error: any) {
      let errorMessage = 'Failed to resend verification email';
      
      if (error.message.includes('too-many-requests')) {
        errorMessage = 'Too many requests. Please try again later.';
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/(auth)/login');
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="mail-outline" size={80} color={Colors.primary} />
        </View>

        <Text style={styles.title}>Verify Your Email</Text>
        <Text style={styles.subtitle}>
          We've sent a verification email to{'\n'}
          <Text style={styles.email}>{user?.email}</Text>
        </Text>

        <Text style={styles.description}>
          Please check your email and click on the verification link to activate your account.
          Once verified, you'll be automatically redirected.
        </Text>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color={Colors.primary} />
          <Text style={styles.infoText}>
            Can't find the email? Check your spam folder.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.button, (loading || resendCooldown > 0) && styles.buttonDisabled]}
          onPress={handleResendEmail}
          disabled={loading || resendCooldown > 0}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.buttonText}>
              {resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : 'Resend Verification Email'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={handleSignOut}>
          <Text style={styles.secondaryButtonText}>Sign Out</Text>
        </TouchableOpacity>
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
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${Colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  email: {
    fontWeight: '600',
    color: Colors.primary,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: `${Colors.primary}10`,
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: Colors.primary,
    marginLeft: 12,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    padding: 16,
    width: '100%',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
});
