import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { Card, StatusBadge, useThemeColors, Button } from '@/shared';
import { Spacing } from '@/constants/theme';
import { useApi, useFilters, useSearch } from '@/hooks/useShared';
import { BookingService } from '@/features/bookings/services/bookingService';
import { Calendar as IconCalendar, User as IconUser, CreditCard as IconCreditCard } from 'lucide-react-native';
const Calendar = IconCalendar as any;
const User = IconUser as any;
const CreditCard = IconCreditCard as any;

export default function BookingsScreen() {
  const colors = useThemeColors();

  const { data: bookings = [], loading, execute: refetch } = useApi(
    BookingService.getBookings,
    true
  );
  
  const [refreshing, setRefreshing] = useState(false);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const { filters, updateFilter } = useFilters({
    status: 'ALL' as 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED',
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleVerify = async (bookingId: string, status: string) => {
    setSubmittingId(bookingId);
    try {
      await BookingService.verifyBooking(bookingId, status as any);
      Alert.alert('Status Updated', `Booking status has been updated to ${status.toLowerCase()} successfully.`);
      await refetch();
    } catch {
      Alert.alert('Error', 'Update action failed.');
    } finally {
      setSubmittingId(null);
    }
  };

  const filteredBookings = (bookings || []).filter((b) => {
    return filters.status === 'ALL' || b.status === filters.status;
  });

  const renderBookingItem = ({ item }: { item: any }) => {
    const moveInDateString = item.move_in_date
      ? new Date(item.move_in_date).toLocaleDateString()
      : 'Not Set';

    return (
      <Card style={styles.bookingCard}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.tenantName, { color: colors.text }]}>
              {item.tenant?.user.first_name} {item.tenant?.user.last_name}
            </Text>
            <Text style={[styles.bookingMeta, { color: colors.textSecondary }]}>
              Room {item.bed?.room.room_number} &bull; Bed {item.bed?.bed_number}
            </Text>
            <Text style={[styles.propertyName, { color: '#6366f1' }]}>
              {item.bed?.room.property.name}
            </Text>
          </View>
          <StatusBadge status={item.status} />
        </View>

        <View style={[styles.divider, { backgroundColor: colors.textSecondary + '15' }]} />

        {/* Expected dates & financials */}
        <View style={styles.financialRow}>
          <View style={styles.metaRow}>
            <Calendar color={colors.textSecondary} size={14} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              Move In: {moveInDateString}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <CreditCard color={colors.textSecondary} size={14} />
            <Text style={[styles.metaText, { color: colors.text }]}>
              ₹{item.rent_amount}/mo
            </Text>
          </View>
        </View>

        {/* Active verify buttons for pending requests */}
        {item.status === 'PENDING' && (
          <View style={styles.actions}>
            <Button
              title="Approve Booking"
              onPress={() => handleVerify(item.id, 'APPROVED')}
              loading={submittingId === item.id}
              style={{ flex: 1, backgroundColor: '#10b981' }}
            />
            <Button
              title="Reject"
              onPress={() => handleVerify(item.id, 'REJECTED')}
              loading={submittingId === item.id}
              variant="outline"
              style={{ flex: 0.4 }}
            />
          </View>
        )}

        {item.status === 'APPROVED' && (
          <View style={styles.actions}>
            <Button
              title="Mark Tenant Checked In"
              onPress={() => handleVerify(item.id, 'MOVE_IN')}
              loading={submittingId === item.id}
              style={{ flex: 1, backgroundColor: '#3b82f6' }}
            />
          </View>
        )}

        {item.status === 'MOVE_IN' && (
          <View style={styles.actions}>
            <Button
              title="Initiate Checkout"
              onPress={() => handleVerify(item.id, 'MOVE_OUT')}
              loading={submittingId === item.id}
              style={{ flex: 1, backgroundColor: '#f59e0b' }}
            />
          </View>
        )}

        {item.status === 'MOVE_OUT' && (
          <View style={styles.actions}>
            <Button
              title="Mark Checkout Completed"
              onPress={() => handleVerify(item.id, 'COMPLETED')}
              loading={submittingId === item.id}
              style={{ flex: 1, backgroundColor: '#10b981' }}
            />
          </View>
        )}
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Category filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 60 }}>
        <View style={styles.filterBar}>
          {['ALL', 'PENDING', 'APPROVED', 'MOVE_IN', 'MOVE_OUT', 'COMPLETED', 'CANCELLED'].map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => updateFilter('status', s as any)}
              style={[
                styles.filterTab,
                {
                  backgroundColor: filters.status === s ? '#6366f1' : colors.backgroundElement,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterTabText,
                  { color: filters.status === s ? '#ffffff' : colors.textSecondary },
                ]}
              >
                {s.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : (
        <FlatList
          data={filteredBookings}
          keyExtractor={(item) => item.id}
          renderItem={renderBookingItem}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Calendar color={colors.textSecondary} size={36} />
              <Text style={[styles.emptyText, { color: colors.text }]}>No Bookings Found</Text>
              <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                No allocation logs matching the active filter.
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
  filterBar: {
    flexDirection: 'row',
    padding: Spacing.four,
    gap: Spacing.two,
  },
  filterTab: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 10,
  },
  filterTabText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
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
  bookingCard: {
    gap: Spacing.two,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  tenantName: {
    fontSize: 15,
    fontWeight: '800',
  },
  bookingMeta: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  propertyName: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 1,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.one,
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.two,
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
