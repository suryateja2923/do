import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, ActivityIndicator } from 'react-native';
import { Card, StatusBadge, useThemeColors } from '@/shared';
import { Spacing } from '@/constants/theme';
import { useApi, useSearch } from '@/hooks/useShared';
import { TenantService } from '@/features/tenants/services/tenantService';
import { Search as IconSearch, User as IconUser, ShieldAlert as IconShieldAlert, Phone as IconPhone, Calendar as IconCalendar } from 'lucide-react-native';
const Search = IconSearch as any;
const User = IconUser as any;
const ShieldAlert = IconShieldAlert as any;
const Phone = IconPhone as any;
const Calendar = IconCalendar as any;

export default function TenantListingScreen() {
  const colors = useThemeColors();

  const { data: tenants = [], loading, execute: refetch } = useApi(
    TenantService.getTenants,
    true
  );

  const [refreshing, setRefreshing] = useState(false);
  const { query, setQuery, filteredItems: searchedTenants } = useSearch(
    tenants || [],
    ['user'] // We'll search by user first_name locally
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Safe search check for first_name match
  const filtered = (tenants || []).filter((t) => {
    if (!query.trim()) return true;
    const name = `${t.user?.first_name} ${t.user?.last_name}`.toLowerCase();
    return name.includes(query.toLowerCase()) || t.user?.phone.includes(query);
  });

  const renderTenantItem = ({ item }: { item: any }) => {
    const moveIn = item.move_in_date ? new Date(item.move_in_date).toLocaleDateString() : 'N/A';
    
    return (
      <Card style={styles.tenantCard}>
        <View style={styles.cardHeader}>
          <View style={styles.nameSection}>
            <View style={[styles.avatar, { backgroundColor: colors.backgroundSelected }]}>
              <Text style={[styles.avatarText, { color: colors.text }]}>
                {item.user?.first_name?.[0]}
              </Text>
            </View>
            <View>
              <Text style={[styles.tenantName, { color: colors.text }]}>
                {item.user?.first_name} {item.user?.last_name}
              </Text>
              <Text style={[styles.tenantEmail, { color: colors.textSecondary }]}>
                {item.user?.email}
              </Text>
            </View>
          </View>
          <StatusBadge status={item.status} />
        </View>

        <View style={[styles.divider, { backgroundColor: colors.textSecondary + '15' }]} />

        {/* Audit Meta Data */}
        <View style={styles.metaRow}>
          <View style={styles.infoCol}>
            <Phone color={colors.textSecondary} size={14} />
            <Text style={[styles.metaText, { color: colors.text }]}>{item.user?.phone}</Text>
          </View>
          <View style={styles.infoCol}>
            <Calendar color={colors.textSecondary} size={14} />
            <Text style={[styles.metaText, { color: colors.text }]}>In: {moveIn}</Text>
          </View>
        </View>

        <View style={styles.footerRow}>
          <Text style={[styles.complaintText, { color: item.complaint_count > 0 ? '#ef4444' : colors.textSecondary }]}>
            {item.complaint_count || 0} active tickets
          </Text>
        </View>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Privacy disclaimer banner */}
      <View style={styles.shieldBanner}>
        <ShieldAlert color="#ef4444" size={16} />
        <Text style={styles.shieldText}>
          Personal verification cards (PAN, Aadhaar) & invoices are strictly hidden for tenant data security rules.
        </Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchBarWrapper}>
        <View style={[styles.searchBar, { backgroundColor: colors.backgroundElement }]}>
          <Search color={colors.textSecondary} size={18} />
          <TextInput
            placeholder="Search active tenants by name/phone..."
            placeholderTextColor={colors.textSecondary + '70'}
            value={query}
            onChangeText={setQuery}
            style={[styles.searchInput, { color: colors.text }]}
          />
        </View>
      </View>

      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderTenantItem}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View style={styles.empty}>
              <User color={colors.textSecondary} size={36} />
              <Text style={[styles.emptyText, { color: colors.text }]}>No Tenants Found</Text>
              <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                No checked-in residents matching criteria.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  shieldBanner: {
    flexDirection: 'row',
    backgroundColor: 'rgba(239, 68, 68, 0.04)',
    borderColor: 'rgba(239, 68, 68, 0.13)',
    borderWidth: 1,
    padding: Spacing.three,
    margin: Spacing.four,
    borderRadius: 14,
    gap: Spacing.two,
    alignItems: 'center',
  },
  shieldText: {
    color: '#ef4444',
    fontSize: 10,
    fontWeight: '700',
    flex: 1,
    lineHeight: 14,
  },
  searchBarWrapper: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.two,
  },
  searchBar: {
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
    gap: Spacing.three,
  },
  tenantCard: {
    gap: Spacing.two,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '800',
  },
  tenantName: {
    fontSize: 14,
    fontWeight: '800',
  },
  tenantEmail: {
    fontSize: 11,
    marginTop: 1,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.half,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
  },
  footerRow: {
    alignItems: 'flex-start',
    marginTop: Spacing.half,
  },
  complaintText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.five,
    gap: Spacing.two,
    marginTop: 50,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '800',
  },
  emptySub: {
    fontSize: 11,
    textAlign: 'center',
  },
});
