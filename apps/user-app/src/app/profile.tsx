import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';
import { Card, Input, Button, useThemeColors } from '../shared';
import { Spacing } from '../constants/theme';
import { UserService } from '../services/userService';

export default function ProfileScreen() {
  const colors = useThemeColors();
  const { user, tenantProfile, updateProfile, logout } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Form inputs
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [permanentAddress, setPermanentAddress] = useState('');

  const loadProfileData = async () => {
    setRefreshing(true);
    try {
      const response = await UserService.getProfile();
      if (response.success && response.data) {
        const fullUser = response.data;
        const tenant = fullUser.tenant_profile || {};

        setFirstName(fullUser.first_name || '');
        setLastName(fullUser.last_name || '');
        setPhone(fullUser.phone || '');
        setEmergencyName(tenant.emergency_contact_name || '');
        setEmergencyPhone(tenant.emergency_contact_phone || '');
        setPermanentAddress(tenant.permanent_address || '');

        updateProfile({
          first_name: fullUser.first_name,
          last_name: fullUser.last_name,
          phone: fullUser.phone,
          emergency_contact_name: tenant.emergency_contact_name,
          emergency_contact_phone: tenant.emergency_contact_phone,
          permanent_address: tenant.permanent_address,
        });
      }
    } catch (err: any) {
      console.log('Failed to reload profile details', err.message);
    } finally {
      setRefreshing(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!firstName || !phone) {
      Alert.alert('Validation Error', 'First name and Mobile number are required.');
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        first_name: firstName,
        last_name: lastName,
        phone,
        emergency_contact_name: emergencyName,
        emergency_contact_phone: emergencyPhone,
        permanent_address: permanentAddress,
      };
      if (password) {
        payload.password = password;
      }

      await UserService.updateProfile(payload);

      updateProfile(payload);
      setPassword('');
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
      setPhone(user.phone || '');
    }
    if (tenantProfile) {
      setEmergencyName(tenantProfile.emergency_contact_name || '');
      setEmergencyPhone(tenantProfile.emergency_contact_phone || '');
      setPermanentAddress(tenantProfile.permanent_address || '');
    }
  }, [user, tenantProfile]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <Text style={[styles.title, { color: colors.text }]}>My Account</Text>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadProfileData} colors={['#6366f1']} />}
      >
        <Card style={styles.formCard}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Personal Details</Text>

          <Input label="First Name *" value={firstName} onChangeText={setFirstName} placeholder="John" />
          <Input label="Last Name" value={lastName} onChangeText={setLastName} placeholder="Doe" />
          <Input label="Mobile Number *" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="9876543210" />
          <Input label="Change Password" value={password} onChangeText={setPassword} secureTextEntry placeholder="Leave blank to keep current" />

          <Text style={[styles.cardTitle, { color: colors.text, marginTop: Spacing.two }]}>Emergency & Contact Details</Text>

          <Input label="Emergency Contact Name" value={emergencyName} onChangeText={setEmergencyName} placeholder="Emergency Contact Name" />
          <Input label="Emergency Contact Phone" value={emergencyPhone} onChangeText={setEmergencyPhone} keyboardType="phone-pad" placeholder="Emergency Contact Phone" />
          <Input label="Permanent Address" value={permanentAddress} onChangeText={setPermanentAddress} placeholder="Permanent Address" multiline numberOfLines={2} style={{ height: 60, textAlignVertical: 'top', paddingTop: 8 }} />

          <Button title="Save Changes" onPress={handleUpdateProfile} loading={loading} style={styles.saveBtn} />
        </Card>

        <Button title="Sign Out / Logout" onPress={logout} variant="danger" style={styles.signOutBtn} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  scrollContainer: {
    padding: Spacing.four,
    gap: Spacing.four,
  },
  formCard: {
    gap: Spacing.three,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: Spacing.one,
  },
  saveBtn: {
    marginTop: Spacing.two,
  },
  signOutBtn: {
    marginVertical: Spacing.two,
  },
});
