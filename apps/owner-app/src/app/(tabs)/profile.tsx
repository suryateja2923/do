import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { Card, Button, StatusBadge, useThemeColors } from '@/shared';
import { Spacing } from '@/constants/theme';
import { User as IconUser, Phone as IconPhone, LogOut as IconLogOut, HelpCircle as IconHelpCircle, Shield as IconShield, FileText as IconFileText, Bell as IconBell, Users as IconUsers } from 'lucide-react-native';
const User = IconUser as any;
const Phone = IconPhone as any;
const LogOut = IconLogOut as any;
const HelpCircle = IconHelpCircle as any;
const Shield = IconShield as any;
const FileText = IconFileText as any;
const Bell = IconBell as any;
const Users = IconUsers as any;

export default function ProfileScreen() {
  const colors = useThemeColors();
  const router = useRouter();

  const logout = useAuthStore((state) => state.logout);
  const ownerProfile = useAuthStore((state) => state.ownerProfile);
  const user = useAuthStore((state) => state.user);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of HomiePG?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const business = ownerProfile?.business_info || {
    business_name: 'Homie Co-living',
    pg_name: 'Homie Elite Boys PG',
    business_type: 'CO_LIVING',
  };

  const address = ownerProfile?.address || {
    address: '45, 80 Feet Road, Koramangala',
    city: 'Bengaluru',
    state: 'Karnataka',
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {/* Header Cards */}
      <Card style={styles.profileHeaderCard}>
        <View style={styles.profileHeader}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' }}
            style={styles.avatar}
          />
          <View style={{ flex: 1 }}>
            <Text style={[styles.nameText, { color: colors.text }]}>
              {user?.first_name} {user?.last_name}
            </Text>
            <Text style={[styles.roleText, { color: colors.textSecondary }]}>
              {business.business_name} &bull; {business.business_type}
            </Text>
          </View>
          <StatusBadge status={ownerProfile?.kyc_status || 'APPROVED'} />
        </View>

        <View style={[styles.divider, { backgroundColor: colors.textSecondary + '15' }]} />

        <View style={styles.contactDetails}>
          <View style={styles.contactItem}>
            <Phone color={colors.textSecondary} size={14} />
            <Text style={[styles.contactText, { color: colors.text }]}>{user?.phone}</Text>
          </View>
          <View style={styles.contactItem}>
            <Shield color={colors.textSecondary} size={14} />
            <Text style={[styles.contactText, { color: colors.text }]}>
              GST: {ownerProfile?.gst_number || 'Not Provided'}
            </Text>
          </View>
        </View>
      </Card>

      {/* Address section */}
      <Card style={styles.sectionCard}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Business Location</Text>
        <Text style={[styles.addressText, { color: colors.textSecondary }]}>
          {address.address}, {address.city}, {address.state}
        </Text>
      </Card>

      {/* Settings Options list */}
      <Card style={styles.menuCard}>
        <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: Spacing.one }]}>
          Quick Links & Settings
        </Text>

        <TouchableOpacity onPress={() => router.push('/tenants')} style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Users color="#6366f1" size={18} />
            <Text style={[styles.menuItemText, { color: colors.text }]}>Manage Tenants</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/notifications')} style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Bell color="#6366f1" size={18} />
            <Text style={[styles.menuItemText, { color: colors.text }]}>Notifications Dispatcher</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/reports')} style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <FileText color="#6366f1" size={18} />
            <Text style={[styles.menuItemText, { color: colors.text }]}>Operational Reports</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => {}} style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <HelpCircle color="#6366f1" size={18} />
            <Text style={[styles.menuItemText, { color: colors.text }]}>FAQ & Support Docs</Text>
          </View>
        </TouchableOpacity>
      </Card>

      {/* Sign out button */}
      <Button
        title="Sign Out Account"
        onPress={handleLogout}
        variant="danger"
        style={styles.logoutBtn}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.three,
    paddingBottom: 50,
  },
  profileHeaderCard: {
    gap: Spacing.two,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  nameText: {
    fontSize: 16,
    fontWeight: '900',
  },
  roleText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.one,
  },
  contactDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  contactText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionCard: {
    gap: Spacing.one,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addressText: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
  },
  menuCard: {
    paddingVertical: Spacing.two,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.three,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  menuItemText: {
    fontSize: 13,
    fontWeight: '700',
  },
  logoutBtn: {
    marginTop: Spacing.two,
  },
});
