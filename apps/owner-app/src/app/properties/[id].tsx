import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Card, Button, StatusBadge, useThemeColors } from '@/shared';
import { Spacing } from '@/constants/theme';
import { useApi } from '@/hooks/useShared';
import { PropertyService } from '@/features/properties/services/propertyService';
import * as DocumentPicker from 'expo-document-picker';
import { MapPin as IconMapPin, Info as IconInfo, ArrowLeft as IconArrowLeft, Layers as IconLayers } from 'lucide-react-native';
const MapPin = IconMapPin as any;
const Info = IconInfo as any;
const ArrowLeft = IconArrowLeft as any;
const Layers = IconLayers as any;

export default function PropertyDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useThemeColors();
  const router = useRouter();
  const [uploading, setUploading] = useState(false);

  const { data: property, loading, execute: refetch } = useApi(
    PropertyService.getPropertyDetail,
    true,
    [id]
  );

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (!property) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Property details not found.</Text>
      </View>
    );
  }

  const handleUploadImage = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setUploading(true);

        const response = await fetch(asset.uri);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = async () => {
          try {
            const base64data = reader.result as string;
            await PropertyService.uploadSingleImage(id, base64data);
            Alert.alert('Success', 'Image uploaded successfully!');
            refetch(id);
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to upload image.');
          } finally {
            setUploading(false);
          }
        };
        reader.readAsDataURL(blob);
      }
    } catch (err: any) {
      Alert.alert('Error', 'Failed to pick image: ' + err.message);
    }
  };

  // Fallback image url
  const imgUrl = property.images?.[0]?.url || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80';

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Property banner */}
      <Image source={{ uri: imgUrl }} style={styles.bannerImage} />

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: colors.text }]}>{property.name}</Text>
            <View style={styles.locationRow}>
              <MapPin color="#6366f1" size={14} />
              <Text style={[styles.locationText, { color: colors.textSecondary }]}>
                {property.address_line1}, {property.zip_code}
              </Text>
            </View>
          </View>
          <StatusBadge status={property.kyc_status} />
        </View>

        {/* Verification timeline alert */}
        <Card style={[styles.infoCard, { borderColor: '#e0e1e6' }]}>
          <Info color="#6366f1" size={18} style={{ marginTop: 2 }} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[styles.infoTitle, { color: colors.text }]}>KYC Verification Details</Text>
            <Text style={[styles.infoRemarks, { color: colors.textSecondary }]}>
              {property.admin_remarks || 'Your listing details are approved. You can now configure rooms and allocate beds.'}
            </Text>
          </View>
        </Card>

        {/* Description */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
          <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
            {property.description || 'No description provided for this listing.'}
          </Text>
        </View>

        {/* Gallery Section */}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Property Gallery</Text>
            <TouchableOpacity onPress={handleUploadImage} disabled={uploading} style={styles.uploadBtn}>
              {uploading ? (
                <ActivityIndicator size="small" color="#6366f1" />
              ) : (
                <Text style={{ color: '#6366f1', fontSize: 12, fontWeight: '700' }}>+ Upload Image</Text>
              )}
            </TouchableOpacity>
          </View>
          {property.images && property.images.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryScroll}>
              {property.images.map((img: any) => (
                <Image key={img.id} source={{ uri: img.url }} style={styles.galleryImage} />
              ))}
            </ScrollView>
          ) : (
            <Text style={{ color: colors.textSecondary, fontSize: 11, fontStyle: 'italic', marginTop: 4 }}>
              No images uploaded yet. Upload images of your PG to showcase to tenants and managers.
            </Text>
          )}
        </View>

        {/* Facility summary */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Facilities Summary</Text>
          <View style={styles.badgeRow}>
            {property.wifi_available && <View style={[styles.facBadge, { backgroundColor: colors.backgroundElement }]}><Text style={{ color: colors.text, fontSize: 11 }}>Wi-Fi</Text></View>}
            {property.parking_available && <View style={[styles.facBadge, { backgroundColor: colors.backgroundElement }]}><Text style={{ color: colors.text, fontSize: 11 }}>Parking</Text></View>}
            {property.laundry_available && <View style={[styles.facBadge, { backgroundColor: colors.backgroundElement }]}><Text style={{ color: colors.text, fontSize: 11 }}>Laundry</Text></View>}
            {property.cctv_available && <View style={[styles.facBadge, { backgroundColor: colors.backgroundElement }]}><Text style={{ color: colors.text, fontSize: 11 }}>CCTV</Text></View>}
            {property.food_available && <View style={[styles.facBadge, { backgroundColor: colors.backgroundElement }]}><Text style={{ color: colors.text, fontSize: 11 }}>Food</Text></View>}
          </View>
        </View>

        {/* Actions - Navigation to Floors */}
        <View style={styles.actions}>
          <Button
            title="Configure Floors & Rooms"
            onPress={() => router.push(`/properties/${property.id}/floors`)}
            style={styles.primaryAction}
          />
          <Button
            title="Back to Properties"
            onPress={() => router.back()}
            variant="outline"
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bannerImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.four,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    marginTop: 4,
  },
  locationText: {
    fontSize: 12,
  },
  infoCard: {
    flexDirection: 'row',
    gap: Spacing.three,
    alignItems: 'flex-start',
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  infoRemarks: {
    fontSize: 11,
    lineHeight: 16,
  },
  section: {
    gap: Spacing.two,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  bodyText: {
    fontSize: 12,
    lineHeight: 18,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  facBadge: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 10,
  },
  actions: {
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  primaryAction: {
    backgroundColor: '#6366f1',
  },
  uploadBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  galleryScroll: {
    gap: Spacing.two,
    paddingVertical: Spacing.one,
  },
  galleryImage: {
    width: 120,
    height: 90,
    borderRadius: 8,
    resizeMode: 'cover',
  },
});
