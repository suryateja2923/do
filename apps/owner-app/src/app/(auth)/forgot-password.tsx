import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Input, Button, useThemeColors } from '@/shared';
import { Spacing } from '@/constants/theme';
import { apiClient } from '@/api/apiClient';

export default function ForgotPasswordScreen() {
  const colors = useThemeColors();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRequestOtp = async () => {
    setErrorMsg('');
    if (!email) {
      setErrorMsg('Email address is required');
      return;
    }

    setLoading(true);
    try {
      const response: any = await apiClient.post('/auth/forgot-password', { email });
      if (response.success) {
        Alert.alert('OTP Sent', 'A verification OTP has been sent to your email address.');
        setStep(2);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setErrorMsg('');
    if (!otp) {
      setErrorMsg('OTP is required');
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setErrorMsg('New password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const response: any = await apiClient.post('/auth/reset-password', {
        email,
        otp,
        new_password: newPassword,
      });
      if (response.success) {
        Alert.alert('Success', 'Password has been reset successfully. Please login with your new credentials.', [
          {
            text: 'Login Now',
            onPress: () => router.replace('/(auth)/login'),
          },
        ]);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Reset failed. Please verify your OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>Reset Password</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {step === 1
              ? 'Enter your registered email address to receive a 6-digit verification code.'
              : 'Enter the verification OTP and your new secure password.'}
          </Text>

          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

          {step === 1 ? (
            <View style={styles.form}>
              <Input
                label="Email Address"
                placeholder="owner@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Button title="Request Verification OTP" onPress={handleRequestOtp} loading={loading} />
            </View>
          ) : (
            <View style={styles.form}>
              <Input
                label="Verification Code (OTP)"
                placeholder="123456"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
              />
              <Input
                label="New Password"
                placeholder="Min 8 characters"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                autoCapitalize="none"
              />
              <Button title="Reset & Update Password" onPress={handleResetPassword} loading={loading} />
              <TouchableOpacity onPress={() => setStep(1)} style={styles.backLink}>
                <Text style={{ color: '#6366f1', textAlign: 'center', fontSize: 13, fontWeight: '600' }}>
                  ← Back to Email Request
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity onPress={() => router.replace('/(auth)/login')} style={styles.loginLink}>
            <Text style={{ color: colors.textSecondary, textAlign: 'center', fontSize: 13 }}>
              Cancel and Return to Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.four,
  },
  content: {
    gap: Spacing.three,
    maxWidth: 450,
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: Spacing.two,
  },
  form: {
    gap: Spacing.three,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  backLink: {
    marginTop: Spacing.one,
  },
  loginLink: {
    marginTop: Spacing.three,
  },
});
