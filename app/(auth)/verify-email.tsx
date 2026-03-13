import { authService } from '@/services/authService';
import { useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import VerifyEmail from '../../components/screens/VerifyEmail/VerifyEmail';
import { useSmartBackHandler } from '../../hooks/useSmartBackHandler';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { email } = useLocalSearchParams<{ email: string }>();

  useSmartBackHandler(() => {
    router.back();
  });

  const handleVerified = async () => {
    // Re-fetch fresh user data after verification to check company status
    try {
      const response = await authService.getUser();
      const user = response?.data;
      queryClient.setQueryData(['user'], user);

      if (user && !user.company) {
        // Email now verified, but no company yet → set up company
        router.replace('/(auth)/company-name' as any);
      } else {
        // Company already set → go to dashboard
        router.replace('/(tabs)/dashboard' as any);
      }
    } catch {
      // Fallback to company-name if we can't determine company status
      router.replace('/(auth)/company-name' as any);
    }
  };

  return (
    <VerifyEmail
      email={email || ''}
      onVerified={handleVerified}
      onBack={() => router.back()}
    />
  );
}
