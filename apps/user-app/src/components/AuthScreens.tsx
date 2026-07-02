import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { Input, Button, Card, useThemeColors } from '../shared';
import { Spacing } from '../constants/theme';
import { UserService } from '../services/userService';

export function AuthScreens() {
  const colors = useThemeColors();
  const setSession = useAuthStore((state) => state.setSession);

  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  // Simple validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Email is invalid';

    if (!password) errs.password = 'Password is required';
    else if (password.length < 8) errs.password = 'Password must be at least 8 characters';

    if (isRegistering) {
      if (!firstName) errs.firstName = 'First name is required';
      if (!phone) errs.phone = 'Mobile number is required';
      else if (phone.length < 10) errs.phone = 'Mobile must be at least 10 digits';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAction = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      if (isRegistering) {
        const response = await UserService.registerUser({
          email,
          password,
          first_name: firstName,
          last_name: lastName,
          phone,
        });
        if (response.success && response.data) {
          const { token, user, tenantProfile } = response.data;
          setSession(token, user, tenantProfile);
          Alert.alert('Success', 'Registered successfully!');
        }
      } else {
        const response = await UserService.login({ email, password });
        if (response.success && response.data) {
          const { token, user, tenantProfile } = response.data;
          if (user.role !== 'USER') {
            Alert.alert('Access Denied', 'Please use the admin/owner app for non-tenant logins.');
            setLoading(false);
            return;
          }
          setSession(token, user, tenantProfile);
          Alert.alert('Welcome Back', `Logged in as ${user.first_name}!`);
        }
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <Card style={styles.card}>
        <Text style={[styles.title, { color: colors.text }]}>
          {isRegistering ? 'Create Tenant Account' : 'Welcome to HomiePG'}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {isRegistering ? 'Register to search properties and book your bed' : 'Sign in to access your dashboard'}
        </Text>

        <View style={styles.form}>
          {isRegistering && (
            <>
              <Input
                label="First Name *"
                placeholder="e.g. John"
                value={firstName}
                onChangeText={setFirstName}
                error={errors.firstName}
              />
              <Input
                label="Last Name"
                placeholder="e.g. Doe"
                value={lastName}
                onChangeText={setLastName}
              />
              <Input
                label="Mobile Number *"
                placeholder="e.g. 9876543210"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                error={errors.phone}
              />
            </>
          )}

          <Input
            label="Email Address *"
            placeholder="e.g. john.doe@email.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            error={errors.email}
          />

          <Input
            label="Password *"
            placeholder="Min 8 characters"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            error={errors.password}
          />

          <Button
            title={isRegistering ? 'Register & Sign In' : 'Sign In'}
            onPress={handleAction}
            loading={loading}
            style={styles.submitBtn}
          />
        </View>

        <TouchableOpacity
          onPress={() => {
            setIsRegistering(!isRegistering);
            setErrors({});
          }}
          style={styles.toggle}
        >
          <Text style={{ color: '#6366f1', fontSize: 13, fontWeight: '600', textAlign: 'center' }}>
            {isRegistering ? 'Already have an account? Sign In' : "Don't have an account? Register"}
          </Text>
        </TouchableOpacity>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.four,
  },
  card: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: Spacing.two,
  },
  form: {
    gap: Spacing.three,
  },
  submitBtn: {
    marginTop: Spacing.two,
  },
  toggle: {
    marginTop: Spacing.two,
  },
});
