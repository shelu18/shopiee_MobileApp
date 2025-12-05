import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { Colors } from '../constants/colors';

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // If user is logged in and email is verified, go to home
  if (user && user.emailVerified) {
    return <Redirect href="/(tabs)/home" />;
  }

  // If user is logged in but email not verified, go to verification screen
  if (user && !user.emailVerified) {
    return <Redirect href="/(auth)/email-verification" />;
  }

  // If no user, go to welcome screen
  return <Redirect href="/(auth)/welcome" />;
}
