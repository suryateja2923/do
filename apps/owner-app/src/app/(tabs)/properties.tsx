import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Card, StatusBadge, useThemeColors } from '@/shared';
import { Spacing } from '@/constants/theme';
import { useApi, useSearch } from '@/hooks/useShared';
import { PropertyService } from '@/features/properties/services/propertyService';
import { Search as IconSearch, Plus as IconPlus, MapPin as IconMapPin, Layers as IconLayers } from 'lucide-react-native';
const Search = IconSearch as any;
const Plus = IconPlus as any;
const MapPin = IconMapPin as any;
const Layers = IconLayers as any;

export default function PropertiesScreen() {
  const colors = useThemeColors();
  const router = useRouter();

  const { data: properties = [], loading, execute: refetch } = useApi(
    PropertyService.getProperties,
    true
  );
  
  const [refreshing, setRefreshing] = useState(false);
  const { query: searchQuery, setQuery: setSearchQuery, filteredItems: searchedProperties } = useSearch(
    properties || [],
    ['name', 'address_line1']
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const normalizeCityLabel = (item: any): string => {
    if (item?.city_id && typeof item.city_id === 'string') {
      return item.city_id.replace('city-', '').toUpperCase();
    }
    if (item?.city && typeof item.city === 'string' && item.city.trim().length > 0) {
      return item.city;
    }
    return 'N/A';
  };

  const normalizeAddressLabel = (item: any): string => {
    if (item?.address_line1 && typeof item.address_line1 === 'string') {
      return item.address_line1;
    }
    if (item?.address && typeof item.address === 'string') {
      return item.address;
    }
    return 'Address not available';
  };

  const normalizeStatus = (item: any): string => {
    if (typeof item?.kyc_status === 'string') {
      return item.kyc_status;
    }

    const approvalStatus = item?.approval_status;
    if (approvalStatus === 'VERIFIED') return 'APPROVED';
    if (approvalStatus === 'PENDING') return 'PENDING';
    if (approvalStatus === 'REJECTED') return 'REJECTED';

    return 'PENDING';
  };

  const renderPropertyItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push(`/properties/${item.id}`)}
      style={styles.cardWrapper}
    >
      <Card style={styles.propertyCard}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{item.name}</Text>
            <View style={styles.locationRow}>
              <MapPin color="#6366f1" size={14} />
              <Text style={[styles.locationText, { color: colors.textSecondary }]}>
                {normalizeAddressLabel(item)}, {normalizeCityLabel(item)}
              </Text>
            </View>
          </View>
          <StatusBadge status={normalizeStatus(item)} />
        </View>

        <View style={[styles.cardDivider, { backgroundColor: colors.textSecondary + '15' }]} />

        <View style={styles.cardFooter}>
          <View style={styles.statsRow}>
            <Layers color={colors.textSecondary} size={14} />
            <Text style={[styles.statsText, { color: colors.textSecondary }]}>
              {item.floors?.length || 0} Floors &bull;{' '}
              {item.floors?.reduce((acc: number, f: any) => acc + (f.rooms?.length || 0), 0) || 0} Rooms
            </Text>
          </View>
          <Text style={[styles.dateText, { color: colors.textSecondary }]}>
            KYC Audited
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header Controls */}
      <View style={styles.filterHeader}>
        <View style={[styles.searchBar, { backgroundColor: colors.backgroundElement }]}>
          <Search color={colors.textSecondary} size={18} />
          <TextInput
            placeholder="Search properties..."
            placeholderTextColor={colors.textSecondary + '70'}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[styles.searchInput, { color: colors.text }]}
          />
        </View>
        <TouchableOpacity
          onPress={() => router.push('/properties/add')}
          style={styles.addButton}
        >
          <Plus color="#ffffff" size={20} />
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : (
        <FlatList
          data={searchedProperties}
          keyExtractor={(item) => item.id}
          renderItem={renderPropertyItem}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.text }]}>No Properties Found</Text>
              <Text style={[styles.emptySubText, { color: colors.textSecondary }]}>
                Add your first PG listing by clicking the '+' button above.
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
  filterHeader: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
    gap: Spacing.two,
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  cardWrapper: {
    marginBottom: Spacing.two,
  },
  propertyCard: {
    gap: Spacing.two,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    marginTop: 4,
  },
  locationText: {
    fontSize: 11,
    fontWeight: '500',
  },
  cardDivider: {
    height: 1,
    marginVertical: Spacing.one,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  statsText: {
    fontSize: 11,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  emptyContainer: {
    padding: Spacing.five,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '800',
  },
  emptySubText: {
    fontSize: 12,
    textAlign: 'center',
  },
});
