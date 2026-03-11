import { useRouter } from 'expo-router';
import React from 'react';
import Signup from '../../components/screens/Signup/Signup';
import { useSmartBackHandler } from '../../hooks/useSmartBackHandler';

export default function SignupScreen() {
  const router = useRouter();

  // Handle Android back button - go to previous page instead of quitting
  useSmartBackHandler(() => {
    router.back();
  });

  return (
    <Signup
      onNavigateToLogin={() => router.push('/(auth)/login')}
      onNavigateToCompanyName={() => router.push('/(auth)/company-name')}
      onNavigateToDashboard={() => router.replace('/(tabs)/dashboard')}
      onBack={() => router.back()}
    />
  );
}
