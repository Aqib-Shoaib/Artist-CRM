import { useRouter } from 'expo-router';
import React from 'react';
import NewVisit from '../../components/screens/NewVisit/NewVisit';
import { useSmartBackHandler } from '../../hooks/useSmartBackHandler';

export default function NewVisitScreen() {
  const router = useRouter();

  useSmartBackHandler(() => {
    router.back();
  });

  return (
    <NewVisit
      onBack={() => router.back()}
    />
  );
}
