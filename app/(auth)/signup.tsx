import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { Colors } from '../../constants/colors';

export default function SignUpScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const { signUp, user } = useAuth();

  // Redirect to email verification after signup
  useEffect(() => {
    if (user && !user.emailVerified) {
      router.replace('/(auth)/email-verification');
    }
  }, [user]);

  const validateName = (text: string) => {
    setFullName(text);
    if (!text.trim()) {
      setNameError('Name is required');
    } else {
      setNameError('');
    }
  };

  const validateEmail = (text: string) => {
    setEmail(text);
    if (!text.trim()) {
      setEmailError('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
      setEmailError('Please enter a valid email');
    } else {
      setEmailError('');
    }
  };

  const validatePassword = (text: string) => {
    setPassword(text);
    if (!text) {
      setPasswordError('Password is required');
    } else if (text.length < 6) {
      setPasswordError('Password must be at least 6 characters');
    } else {
      setPasswordError('');
    }
    // Re-validate confirm password if it's already filled
    if (confirmPassword) {
      validateConfirmPassword(confirmPassword, text);
    }
  };

  const validateConfirmPassword = (text: string, pwd?: string) => {
    setConfirmPassword(text);
    const passwordToCompare = pwd || password;
    if (!text) {
      setConfirmError('Please confirm your password');
    } else if (text !== passwordToCompare) {
      setConfirmError("Passwords don't match");
    } else {
      setConfirmError('');
    }
  };

  const handleSignUp = async () => {
    // Validate all fields
    if (!fullName.trim()) setNameError('Name is required');
    if (!email.trim()) setEmailError('Email is required');
    if (!password) setPasswordError('Password is required');
    if (!confirmPassword) setConfirmError('Please confirm your password');
    
    if (nameError || emailError || passwordError || confirmError || 
        !fullName.trim() || !email.trim() || !password || !confirmPassword) {
      return;
    }

    setLoading(true);
    try {
      await signUp(email.trim(), password, fullName.trim());
      // Navigation will happen automatically via useEffect when user state updates
      Alert.alert(
        'Success!',
        'Account created successfully. Please check your email to verify your account.'
      );
    } catch (error: any) {
      let errorMessage = 'An error occurred during sign up';
      
      if (error.message.includes('email-already-in-use')) {
        errorMessage = 'This email is already registered. Please login instead.';
      } else if (error.message.includes('invalid-email')) {
        errorMessage = 'Invalid email address';
      } else if (error.message.includes('weak-password')) {
        errorMessage = 'Password is too weak. Please use a stronger password.';
      }

      Alert.alert('Sign Up Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={[styles.input, nameError ? styles.inputError : null]}
              placeholder="Enter your full name"
              placeholderTextColor={Colors.placeholder}
              value={fullName}
              onChangeText={validateName}
              autoCapitalize="words"
              editable={!loading}
            />
            {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, emailError ? styles.inputError : null]}
              placeholder="Enter your email"
              placeholderTextColor={Colors.placeholder}
              value={email}
              onChangeText={validateEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={[styles.input, passwordError ? styles.inputError : null]}
              placeholder="Enter your password"
              placeholderTextColor={Colors.placeholder}
              value={password}
              onChangeText={validatePassword}
              secureTextEntry
              editable={!loading}
            />
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={[styles.input, confirmError ? styles.inputError : null]}
              placeholder="Confirm your password"
              placeholderTextColor={Colors.placeholder}
              value={confirmPassword}
              onChangeText={(text) => validateConfirmPassword(text)}
              secureTextEntry
              editable={!loading}
            />
            {confirmError ? <Text style={styles.errorText}>{confirmError}</Text> : null}
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.buttonText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')} disabled={loading}>
              <Text style={styles.link}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
  },
  inputError: {
    borderColor: Colors.error,
    borderWidth: 1.5,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: 4,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  link: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
});
