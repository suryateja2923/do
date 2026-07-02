import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';
import { Card, Button, StatusBadge, useThemeColors } from '../shared';
import { Spacing } from '../constants/theme';
import { UserService } from '../services/userService';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { user, tenantProfile } = useAuthStore();

  const [booking, setBooking] = useState<any | null>(null);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDashboardData = async () => {
    if (!tenantProfile) return;
    setLoading(true);
    try {
      // 1. Fetch bookings
      const bookingsRes = await UserService.getBookings();
      if (bookingsRes.length > 0) {
        // Get the latest booking
        setBooking(bookingsRes[0]);
      } else {
        setBooking(null);
      }

      // 2. Fetch favorites
      const favsRes = await UserService.getFavorites();
      setFavorites(favsRes);
    } catch (err: any) {
      console.log('Error fetching dashboard metrics', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [tenantProfile]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchDashboardData} colors={['#6366f1']} />}
      >
        {/* Header Greeting */}
        <View style={styles.header}>
          <Text style={[styles.welcome, { color: colors.textSecondary }]}>Hello,</Text>
          <Text style={[styles.name, { color: colors.text }]}>
            {user?.first_name} {user?.last_name || ''} 👋
          </Text>
        </View>

        {/* Stay Status Section */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>My Current Stay</Text>
        {booking ? (
          <Card style={styles.stayCard}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={[styles.propertyName, { color: colors.text }]}>
                  {booking.bed?.room?.floor?.property?.name || 'HomiePG Stay'}
                </Text>
                <Text style={[styles.propertyAddress, { color: colors.textSecondary }]}>
                  {booking.bed?.room?.floor?.property?.address || 'Property Address'}
                </Text>
              </View>
              <StatusBadge status={booking.status} />
            </View>

            <View style={[styles.divider, { backgroundColor: colors.textSecondary + '20' }]} />

            <View style={styles.stayDetails}>
              <View style={styles.detailItem}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Room Number</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  Room {booking.bed?.room?.room_number || 'N/A'}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Bed Number</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  Bed {booking.bed?.bed_number || 'N/A'}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Monthly Rent</Text>
                <Text style={[styles.detailValue, { color: '#6366f1', fontWeight: '800' }]}>
                  ₹{parseFloat(booking.rent || '0').toFixed(0)}
                </Text>
              </View>
            </View>

            {booking.status === 'PENDING' && (
              <Button
                title="View Booking Details"
                onPress={() => router.push('/bookings')}
                variant="outline"
                style={{ marginTop: Spacing.two }}
              />
            )}
          </Card>
        ) : (
          <Card style={styles.noStayCard}>
            <Text style={[styles.noStayTitle, { color: colors.text }]}>No Active Stays Found</Text>
            <Text style={[styles.noStayDesc, { color: colors.textSecondary }]}>
              Book high-quality PG beds with direct verification, seamless approvals, and automated billing.
            </Text>
            <Button
              title="Explore Properties"
              onPress={() => router.push('/explore')}
              style={styles.exploreBtn}
            />
          </Card>
        )}

        {/* Favorites Wishlist */}
        <View style={styles.favoritesSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Favorites Wishlist</Text>
          {favorites.length > 0 ? (
            <View style={styles.favGrid}>
              {favorites.map((fav) => (
                <TouchableOpacity
                  key={fav.property.id}
                  activeOpacity={0.9}
                  onPress={() => router.push(`/properties/${fav.property.id}`)}
                >
                  <Card style={styles.favCard}>
                    <Text style={[styles.favName, { color: colors.text }]} numberOfLines={1}>
                      {fav.property.name}
                    </Text>
                    <Text style={[styles.favAddress, { color: colors.textSecondary }]} numberOfLines={1}>
                      {fav.property.address}
                    </Text>
                    <Text style={styles.favPrice}>View Details</Text>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={[styles.emptyFav, { color: colors.textSecondary }]}>
              Your favorite PGs will appear here. Tap the heart icon on any PG details screen to save it!
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.four,
    gap: Spacing.four,
  },
  header: {
    marginBottom: Spacing.two,
  },
  welcome: {
    fontSize: 14,
    fontWeight: '600',
  },
  name: {
    fontSize: 24,
    fontWeight: '900',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: Spacing.two,
    marginBottom: Spacing.one,
  },
  stayCard: {
    gap: Spacing.three,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  propertyName: {
    fontSize: 16,
    fontWeight: '800',
  },
  propertyAddress: {
    fontSize: 11,
    marginTop: 2,
  },
  divider: {
    height: 1,
    alignSelf: 'stretch',
  },
  stayDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    gap: 4,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  noStayCard: {
    padding: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  noStayTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  noStayDesc: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  exploreBtn: {
    width: '100%',
    marginTop: Spacing.two,
  },
  favoritesSection: {
    marginTop: Spacing.two,
    gap: Spacing.two,
  },
  favGrid: {
    gap: Spacing.two,
  },
  favCard: {
    gap: 4,
    padding: Spacing.three,
  },
  favName: {
    fontSize: 14,
    fontWeight: '700',
  },
  favAddress: {
    fontSize: 11,
  },
  favPrice: {
    fontSize: 11,
    color: '#6366f1',
    fontWeight: '700',
    marginTop: 2,
  },
  emptyFav: {
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 18,
    marginTop: Spacing.one,
  },
});
