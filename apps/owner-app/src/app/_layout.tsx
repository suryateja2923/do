import React, { useEffect } from 'react';
import { useColorScheme, Platform } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { Colors } from '@/constants/theme';

const queryClient = new QueryClient();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  
  const token = useAuthStore((state) => state.token);
  const ownerProfile = useAuthStore((state) => state.ownerProfile);
  const initialized = useAuthStore((state) => state.initialized);
  const initialize = useAuthStore((state) => state.initialize);

  // Initialize auth state from TokenManager
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Handle Authentication and Verification Guard redirects
  useEffect(() => {
    if (!initialized) return;

    const inAuthGroup = segments[0] === '(auth)';
    const allowedOwnerAppSegments = new Set([
      '(tabs)',
      'properties',
      'rooms',
      'tenants',
      'reports',
      'notifications',
    ]);
    const isAllowedOwnerAppRoute =
      segments.length === 0 || allowedOwnerAppSegments.has(segments[0] || '');

    if (!token) {
      // User is not authenticated: force redirect to login
      if (!inAuthGroup || (segments[1] !== 'login' && segments[1] !== 'register' && segments[1] !== 'forgot-password')) {
        router.replace('/(auth)/login');
      }
    } else {
      // User is authenticated
      const kycStatus = ownerProfile?.kyc_status || 'PENDING';
      
      if (kycStatus !== 'APPROVED') {
        // Verification pending or rejected: force status monitor screen
        if (segments[1] !== 'status') {
          router.replace('/(auth)/status');
        }
      } else {
        // Verification approved: allow app routes and block auth pages.
        if (inAuthGroup || !isAllowedOwnerAppRoute) {
          router.replace('/(tabs)');
        }
      }
    }
  }, [token, ownerProfile?.kyc_status, initialized, segments]);

  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <QueryClientProvider client={queryClient}>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/register" options={{ title: 'Owner Registration', headerShown: true }} />
        <Stack.Screen name="(auth)/forgot-password" options={{ title: 'Reset Password', headerShown: true }} />
        <Stack.Screen name="(auth)/status" options={{ title: 'Application Status', headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="properties/add"
          options={{
            title: 'Add Property',
            presentation: Platform.OS === 'web' ? 'card' : 'modal',
          }}
        />
        <Stack.Screen name="properties/[id]" options={{ title: 'Property Details' }} />
        <Stack.Screen name="properties/[id]/floors" options={{ title: 'Floor Management' }} />
        <Stack.Screen name="properties/[id]/floors/[floorId]/rooms" options={{ title: 'Room Management' }} />
        <Stack.Screen name="rooms/[roomId]/beds" options={{ title: 'Bed Management' }} />
        <Stack.Screen name="tenants/index" options={{ title: 'Tenant Listing' }} />
        <Stack.Screen name="reports/index" options={{ title: 'Operational Reports' }} />
        <Stack.Screen name="notifications/index" options={{ title: 'Notification Center' }} />
      </Stack>
    </QueryClientProvider>
  );
}
