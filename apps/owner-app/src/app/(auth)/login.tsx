import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Input, Button, useThemeColors } from '@/shared';
import { useAuthStore } from '@/store/authStore';
import { Spacing } from '@/constants/theme';
import { apiClient } from '@/api/apiClient';
import { API_ENDPOINTS } from '@/api/endpoints';

export default function LoginScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleLogin = async () => {
    setGeneralError('');
    // Basic validation
    const newErrors: { email?: string; password?: string } = {};
    if (!email) newErrors.email = 'Email address is required';
    if (!password) newErrors.password = 'Password is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      // POST API call to authenticate
      const response: any = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
      
      if (response && response.data) {
        const { token, user, ownerProfile } = response.data;
        setSession(token, user, ownerProfile);
      }
    } catch (err: any) {
      console.log('Login failed:', err.message);
      setGeneralError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroSection}>
          <Text style={[styles.appTitle, { color: '#6366f1' }]}>HomiePG</Text>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>
            PG Business Management Portal
          </Text>
        </View>
        <View style={styles.formCard}>
          <Text style={[styles.formTitle, { color: colors.text }]}>Sign In</Text>

          {!!generalError && (
            <Text style={{ color: '#ef4444', fontSize: 13, fontWeight: '700', marginBottom: Spacing.one }}>
              {generalError}
            </Text>
          )}

          <Input
            label="Email Address"
            placeholder="enter your business email"
            value={email}
            onChangeText={(txt) => {
              setEmail(txt);
              setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Password"
            placeholder="••••••••"
            value={password}
            onChangeText={(txt) => {
              setPassword(txt);
              setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            error={errors.password}
            secureTextEntry
            autoCapitalize="none"
          />

          <Button
            title="Access Account"
            onPress={handleLogin}
            loading={loading}
            style={styles.submitBtn}
          />

          <View style={styles.linkContainer}>
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
              New to HomiePG?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.registerLink}>Register Business</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')} style={{ marginTop: Spacing.two }}>
            <Text style={{ color: '#6366f1', textAlign: 'center', fontSize: 13, fontWeight: '600' }}>
              Forgot Password?
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.four,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: Spacing.five,
    gap: Spacing.one,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 13,
    fontWeight: '500',
  },
  formCard: {
    gap: Spacing.three,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: Spacing.one,
  },
  submitBtn: {
    marginTop: Spacing.two,
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.three,
  },
  registerLink: {
    color: '#6366f1',
    fontWeight: '700',
    fontSize: 13,
  },
});
