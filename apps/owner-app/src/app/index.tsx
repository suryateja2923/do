import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';

export default function RootIndex() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const ownerProfile = useAuthStore((state) => state.ownerProfile);
  const initialized = useAuthStore((state) => state.initialized);

  useEffect(() => {
    if (!initialized) return;
    if (!token) {
      router.replace('/(auth)/login');
    } else {
      const kycStatus = ownerProfile?.kyc_status || 'PENDING';
      if (kycStatus !== 'APPROVED') {
        router.replace('/(auth)/status');
      } else {
        router.replace('/(tabs)');
      }
    }
  }, [token, ownerProfile?.kyc_status, initialized]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
      <ActivityIndicator size="large" color="#6366f1" />
    </View>
  );
}
