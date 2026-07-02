import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Card, Button, StatusBadge, useThemeColors } from '../../shared';
import { Spacing } from '../../constants/theme';
import { UserService } from '../../services/userService';

export default function PropertyDetailScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { id } = useLocalSearchParams() as { id: string };

  const [property, setProperty] = useState<any | null>(null);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Selected Bed state
  const [selectedBedId, setSelectedBedId] = useState<string | null>(null);
  const [selectedBedPrice, setSelectedBedPrice] = useState<number>(0);

  const fetchPropertyDetails = async () => {
    setLoading(true);
    try {
      const data = await UserService.getPropertyDetail(id);
      setProperty(data);

      const favs = await UserService.getFavorites();
      setFavorites(favs);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load property details');
    } finally {
      setLoading(false);
    }
  };

  const isFavorited = favorites.some((fav) => fav.property_id === id && !fav.is_deleted);

  const toggleFavorite = async () => {
    try {
      if (isFavorited) {
        await UserService.removeFavorite(id);
        Alert.alert('Wishlist', 'Removed from favorites');
      } else {
        await UserService.addFavorite(id);
        Alert.alert('Wishlist', 'Added to favorites');
      }
      // reload favorites list
      const favs = await UserService.getFavorites();
      setFavorites(favs);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update favorites');
    }
  };

  const handleBookBed = async () => {
    if (!selectedBedId) {
      Alert.alert('Bed Required', 'Please select a vacant bed from the rooms below to book.');
      return;
    }

    Alert.alert(
      'Confirm Booking',
      `Reserve this bed for ₹${selectedBedPrice}/month? Direct booking will be placed in PENDING status.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Book',
          onPress: async () => {
            setBookingLoading(true);
            try {
              // Set expected move in to 7 days from now
              const moveInDate = new Date();
              moveInDate.setDate(moveInDate.getDate() + 7);

              await UserService.createBooking({
                bedId: selectedBedId,
                expectedMoveIn: moveInDate.toISOString(),
              });

              Alert.alert('Booking Placed!', 'Your booking is pending approval. You can view its status in the Bookings tab.');
              router.push('/bookings');
            } catch (err: any) {
              Alert.alert('Booking Failed', err.message || 'Could not place booking');
            } finally {
              setBookingLoading(false);
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    fetchPropertyDetails();
  }, [id]);

  if (loading) {
    return (
      <View style={[styles.loadingCenter, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (!property) {
    return (
      <View style={[styles.loadingCenter, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary }}>Property not found.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ color: '#6366f1', fontWeight: '700' }}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleFavorite} style={styles.favToggleBtn}>
          <Text style={{ fontSize: 16 }}>{isFavorited ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Photo Gallery / Main Image */}
        {property.images && property.images.length > 0 ? (
          <Image source={{ uri: property.images[0].url }} style={styles.heroImg} />
        ) : (
          <View style={[styles.heroImgPlaceholder, { backgroundColor: colors.backgroundSelected }]}>
            <Text style={{ color: colors.textSecondary }}>No Image Available</Text>
          </View>
        )}

        <View style={styles.metaSection}>
          <Text style={[styles.propertyName, { color: colors.text }]}>{property.name}</Text>
          <Text style={[styles.propertyAddress, { color: colors.textSecondary }]}>{property.address}</Text>

          <View style={styles.amenitiesGrid}>
            {property.amenities.map((amenity: string, idx: number) => (
              <Text key={idx} style={[styles.amenityTag, { backgroundColor: colors.backgroundSelected, color: colors.text }]}>
                ✨ {amenity}
              </Text>
            ))}
          </View>

          {property.rules && (
            <Card style={styles.rulesCard}>
              <Text style={[styles.rulesTitle, { color: colors.text }]}>Rules & Guidelines</Text>
              <Text style={[styles.rulesText, { color: colors.textSecondary }]}>{property.rules}</Text>
            </Card>
          )}
        </View>

        {/* Room / Bed Selection Grid */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Room & Vacant Bed</Text>
        <View style={styles.roomsList}>
          {property.floors?.flatMap((floor: any) =>
            floor.rooms?.map((room: any) => (
              <Card key={room.id} style={styles.roomCard}>
                <View style={styles.roomHeader}>
                  <Text style={[styles.roomNumber, { color: colors.text }]}>Room {room.room_number}</Text>
                  <Text style={[styles.roomMeta, { color: colors.textSecondary }]}>
                    {room.sharing_type.replace(/_/g, ' ')} • {room.room_type}
                  </Text>
                </View>

                <View style={styles.bedsGrid}>
                  {room.beds?.map((bed: any) => {
                    const isVacant = bed.occupancy_status === 'VACANT';
                    const isSelected = selectedBedId === bed.id;

                    return (
                      <TouchableOpacity
                        key={bed.id}
                        disabled={!isVacant}
                        onPress={() => {
                          setSelectedBedId(bed.id);
                          setSelectedBedPrice(parseFloat(bed.rent));
                        }}
                        style={[
                          styles.bedBtn,
                          { borderColor: colors.textSecondary + '20' },
                          !isVacant && styles.bedBtnOccupied,
                          isSelected && styles.bedBtnSelected,
                        ]}
                      >
                        <Text style={[styles.bedNumber, isSelected && styles.bedNumberSelected, { color: colors.text }]}>
                          Bed {bed.bed_number}
                        </Text>
                        <Text style={[styles.bedPrice, isSelected && styles.bedPriceSelected, { color: colors.textSecondary }]}>
                          ₹{parseFloat(bed.rent).toFixed(0)}/mo
                        </Text>
                        {!isVacant && (
                          <Text style={styles.occupiedText}>Occupied</Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </Card>
            ))
          )}
        </View>

        {/* Reviews Section */}
        {property.reviews && property.reviews.length > 0 && (
          <View style={styles.reviewsSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Reviews</Text>
            {property.reviews.map((rev: any) => (
              <Card key={rev.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={[styles.reviewer, { color: colors.text }]}>
                    {rev.tenant?.user?.first_name || 'Verified Tenant'}
                  </Text>
                  <Text style={styles.ratingStars}>{'⭐'.repeat(rev.rating)}</Text>
                </View>
                {rev.comment && (
                  <Text style={[styles.reviewComment, { color: colors.textSecondary }]}>{rev.comment}</Text>
                )}
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Floating Bottom Booking Bar */}
      <View style={[styles.bottomBookingBar, { backgroundColor: colors.background, borderTopColor: colors.textSecondary + '15' }]}>
        <View>
          <Text style={[styles.rentLabel, { color: colors.textSecondary }]}>Monthly rent</Text>
          <Text style={[styles.rentValue, { color: '#6366f1' }]}>
            {selectedBedId ? `₹${selectedBedPrice}` : 'Select a bed'}
          </Text>
        </View>
        <Button
          title="Reserve Bed Now"
          onPress={handleBookBed}
          loading={bookingLoading}
          style={styles.bookBtn}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  backBtn: {
    padding: Spacing.one,
  },
  favToggleBtn: {
    padding: Spacing.one,
  },
  scrollContent: {
    padding: Spacing.four,
    gap: Spacing.four,
    paddingBottom: 90, // room for floating bottom bar
  },
  heroImg: {
    width: '100%',
    height: 200,
    borderRadius: 18,
  },
  heroImgPlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaSection: {
    gap: Spacing.two,
  },
  propertyName: {
    fontSize: 20,
    fontWeight: '900',
  },
  propertyAddress: {
    fontSize: 12,
    marginTop: -2,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
    marginTop: Spacing.one,
  },
  amenityTag: {
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  rulesCard: {
    padding: Spacing.three,
    marginTop: Spacing.two,
    gap: 6,
  },
  rulesTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  rulesText: {
    fontSize: 11,
    lineHeight: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: Spacing.two,
    marginBottom: Spacing.half,
  },
  roomsList: {
    gap: Spacing.three,
  },
  roomCard: {
    gap: Spacing.three,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roomNumber: {
    fontSize: 13,
    fontWeight: '800',
  },
  roomMeta: {
    fontSize: 11,
  },
  bedsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  bedBtn: {
    flex: 1,
    minWidth: 100,
    padding: Spacing.two,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    gap: 2,
  },
  bedBtnOccupied: {
    opacity: 0.4,
  },
  bedBtnSelected: {
    borderColor: '#6366f1',
    backgroundColor: '#6366f110',
  },
  bedNumber: {
    fontSize: 11,
    fontWeight: '700',
  },
  bedNumberSelected: {
    color: '#6366f1',
  },
  bedPrice: {
    fontSize: 10,
    fontWeight: '600',
  },
  bedPriceSelected: {
    color: '#6366f1',
  },
  occupiedText: {
    fontSize: 8,
    color: '#ef4444',
    fontWeight: '800',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  bottomBookingBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderTopWidth: 1,
  },
  rentLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  rentValue: {
    fontSize: 16,
    fontWeight: '900',
    marginTop: 2,
  },
  bookBtn: {
    paddingHorizontal: Spacing.five,
  },
  reviewsSection: {
    marginTop: Spacing.two,
    gap: Spacing.two,
  },
  reviewCard: {
    padding: Spacing.three,
    gap: 4,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reviewer: {
    fontSize: 12,
    fontWeight: '700',
  },
  ratingStars: {
    fontSize: 11,
  },
  reviewComment: {
    fontSize: 11,
    lineHeight: 16,
  },
});
