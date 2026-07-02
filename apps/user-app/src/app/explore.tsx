import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, RefreshControl, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, useThemeColors } from '../shared';
import { Spacing } from '../constants/theme';
import { UserService } from '../services/userService';
import { useRouter } from 'expo-router';

export default function ExploreScreen() {
  const colors = useThemeColors();
  const router = useRouter();

  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Search & Filter state
  const [city, setCity] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [wifi, setWifi] = useState(false);
  const [parking, setParking] = useState(false);
  const [laundry, setLaundry] = useState(false);
  const [food, setFood] = useState(false);

  const fetchProperties = async (options?: { silent?: boolean }) => {
    const silent = options?.silent === true;
    if (!silent) {
      setLoading(true);
    }
    try {
      const params: any = {};
      if (city) params.city = city;
      if (maxPrice) params.price = maxPrice;
      if (wifi) params.wifi = 'true';
      if (parking) params.parking = 'true';
      if (laundry) params.laundry = 'true';
      if (food) params.food = 'true';

      const data = await UserService.searchProperties(params);
      setProperties(data);
    } catch (err: any) {
      if (!silent) {
        Alert.alert('Error', err.message || 'Failed to search properties');
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [city, wifi, parking, laundry, food]);

  useEffect(() => {
    // Keep listings near real-time so newly approved properties appear quickly.
    const intervalId = setInterval(() => {
      fetchProperties({ silent: true });
    }, 2000);

    return () => {
      clearInterval(intervalId);
    };
  }, [city, maxPrice, wifi, parking, laundry, food]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      {/* Top Filter Bar */}
      <View style={styles.topFilterBar}>
        <TextInput
          style={[styles.searchInput, { backgroundColor: colors.backgroundElement, color: colors.text, borderColor: colors.textSecondary + '20' }]}
          placeholder="Search by City (e.g. Bangalore)"
          placeholderTextColor={colors.textSecondary + '80'}
          value={city}
          onChangeText={setCity}
        />

        <View style={styles.horizontalFilter}>
          <TextInput
            style={[styles.priceInput, { backgroundColor: colors.backgroundElement, color: colors.text, borderColor: colors.textSecondary + '20' }]}
            placeholder="Max Price (e.g. 8000)"
            placeholderTextColor={colors.textSecondary + '80'}
            value={maxPrice}
            onChangeText={setMaxPrice}
            keyboardType="number-pad"
            onSubmitEditing={fetchProperties}
          />
          <Button title="Apply Price" onPress={fetchProperties} style={styles.applyBtn} />
        </View>

        {/* Feature Toggles */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.togglesContainer}>
          <TouchableOpacity
            style={[styles.toggleBtn, wifi && styles.toggleBtnActive, { borderColor: colors.textSecondary + '30' }]}
            onPress={() => setWifi(!wifi)}
          >
            <Text style={[styles.toggleText, wifi && styles.toggleTextActive, { color: colors.text }]}>📶 Wi-Fi</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleBtn, parking && styles.toggleBtnActive, { borderColor: colors.textSecondary + '30' }]}
            onPress={() => setParking(!parking)}
          >
            <Text style={[styles.toggleText, parking && styles.toggleTextActive, { color: colors.text }]}>🚗 Parking</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleBtn, laundry && styles.toggleBtnActive, { borderColor: colors.textSecondary + '30' }]}
            onPress={() => setLaundry(!laundry)}
          >
            <Text style={[styles.toggleText, laundry && styles.toggleTextActive, { color: colors.text }]}>🧺 Laundry</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleBtn, food && styles.toggleBtnActive, { borderColor: colors.textSecondary + '30' }]}
            onPress={() => setFood(!food)}
          >
            <Text style={[styles.toggleText, food && styles.toggleTextActive, { color: colors.text }]}>🍽️ Food</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Properties List */}
      <ScrollView
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchProperties} colors={['#6366f1']} />}
      >
        {properties.length > 0 ? (
          properties.map((property) => (
            <TouchableOpacity
              key={property.id}
              activeOpacity={0.95}
              onPress={() => router.push(`/properties/${property.id}`)}
            >
              <Card style={styles.propCard}>
                {property.images && property.images.length > 0 ? (
                  <Image source={{ uri: property.images[0].url }} style={styles.propImg} />
                ) : (
                  <View style={[styles.propImgPlaceholder, { backgroundColor: colors.backgroundSelected }]}>
                    <Text style={{ color: colors.textSecondary, fontSize: 13 }}>No Image Available</Text>
                  </View>
                )}

                <View style={styles.propInfo}>
                  <Text style={[styles.propName, { color: colors.text }]}>{property.name}</Text>
                  <Text style={[styles.propAddress, { color: colors.textSecondary }]}>{property.address}</Text>

                  <View style={styles.propAmenities}>
                    {property.wifi_available && <Text style={[styles.amenityTag, { backgroundColor: colors.backgroundSelected, color: colors.text }]}>📶 WiFi</Text>}
                    {property.parking_available && <Text style={[styles.amenityTag, { backgroundColor: colors.backgroundSelected, color: colors.text }]}>🚗 Parking</Text>}
                    {property.food_available && <Text style={[styles.amenityTag, { backgroundColor: colors.backgroundSelected, color: colors.text }]}>🍽️ Food</Text>}
                  </View>

                  <View style={styles.cardFooter}>
                    <Text style={[styles.propPrice, { color: '#6366f1' }]}>
                      Starts at <Text style={{ fontWeight: '900' }}>₹{property.min_rent}</Text>/mo
                    </Text>
                    <Text style={[styles.vacantText, { color: property.has_vacant_beds ? '#10b981' : '#ef4444' }]}>
                      {property.has_vacant_beds ? '● Beds Available' : '● Fully Booked'}
                    </Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No PG Hostels Found</Text>
            <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
              Try adjusting your search criteria or resetting filters.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topFilterBar: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
    gap: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: '#6366f115',
  },
  searchInput: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    fontSize: 14,
  },
  horizontalFilter: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  priceInput: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    fontSize: 13,
  },
  applyBtn: {
    height: 44,
    paddingHorizontal: Spacing.three,
    borderRadius: 12,
  },
  togglesContainer: {
    gap: Spacing.two,
    paddingVertical: 2,
  },
  toggleBtn: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.half + 2,
    borderRadius: 20,
    borderWidth: 1,
  },
  toggleBtnActive: {
    backgroundColor: '#6366f115',
    borderColor: '#6366f1',
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#6366f1',
  },
  listContainer: {
    padding: Spacing.four,
    gap: Spacing.four,
  },
  propCard: {
    padding: 0,
    borderRadius: 18,
  },
  propImg: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  propImgPlaceholder: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  propInfo: {
    padding: Spacing.three,
    gap: 8,
  },
  propName: {
    fontSize: 16,
    fontWeight: '800',
  },
  propAddress: {
    fontSize: 12,
  },
  propAmenities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  amenityTag: {
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.one,
  },
  propPrice: {
    fontSize: 13,
  },
  vacantText: {
    fontSize: 11,
    fontWeight: '700',
  },
  emptyContainer: {
    paddingVertical: Spacing.six,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyDesc: {
    fontSize: 12,
    textAlign: 'center',
  },
});
