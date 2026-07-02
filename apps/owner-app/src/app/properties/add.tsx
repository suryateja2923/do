import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Input, Button, useThemeColors, Card } from '@/shared';
import { Spacing } from '@/constants/theme';
import { PropertyService } from '@/features/properties/services/propertyService';
import * as DocumentPicker from 'expo-document-picker';

const AMENITY_LIST = [
  { key: 'wifi', label: '📶  High-Speed Wi-Fi', description: 'Broadband / fiber internet' },
  { key: 'parking', label: '🚗  Parking Lot', description: 'Reserved parking space' },
  { key: 'laundry', label: '👕  Laundry Service', description: 'Washing machine access' },
  { key: 'cctv', label: '📷  CCTV Security', description: '24×7 camera surveillance' },
  { key: 'food', label: '🍱  Meals Included', description: 'Breakfast / lunch / dinner' },
];

export default function AddPropertyScreen() {
  const colors = useThemeColors();
  const router = useRouter();

  // — Core fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');

  // — House rules
  const [rules, setRules] = useState('');
  const [checkInTime, setCheckInTime] = useState('12:00 PM');
  const [checkOutTime, setCheckOutTime] = useState('11:00 AM');
  const [propertyImages, setPropertyImages] = useState<Array<{ name: string; dataUrl: string }>>([]);
  const [imageUploading, setImageUploading] = useState(false);

  // Optional initial inventory setup
  const [floorCount, setFloorCount] = useState('1');
  const [roomCount, setRoomCount] = useState('0');
  const [bedsPerRoom, setBedsPerRoom] = useState('1');
  const [sharingCapacity, setSharingCapacity] = useState('1');
  const [roomType, setRoomType] = useState<'NON_AC' | 'AC'>('NON_AC');
  const [bedRent, setBedRent] = useState('10000');
  const [securityDeposit, setSecurityDeposit] = useState('10000');

  // — Amenity toggles
  const [amenities, setAmenities] = useState<Record<string, boolean>>({
    wifi: true,
    parking: false,
    laundry: true,
    cctv: true,
    food: false,
  });

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  const toggleAmenity = (key: string) =>
    setAmenities((prev) => ({ ...prev, [key]: !prev[key] }));

  const goToStep2 = () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Property name is required.');
      return;
    }
    if (!address.trim()) {
      Alert.alert('Required', 'Street address is required.');
      return;
    }
    if (!zipCode.trim()) {
      Alert.alert('Required', 'ZIP / Pin code is required.');
      return;
    }
    setStep(2);
  };

  const handlePickPropertyImage = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const selectedAsset = result.assets[0];
      setImageUploading(true);

      const response = await fetch(selectedAsset.uri);
      const blob = await response.blob();

      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('Failed to read selected image.'));
        reader.readAsDataURL(blob);
      });

      if (!dataUrl) {
        throw new Error('Selected image is empty or invalid.');
      }

      setPropertyImages((prev) => [
        ...prev,
        {
          name: selectedAsset.name || `Image ${prev.length + 1}`,
          dataUrl,
        },
      ]);
    } catch (error: any) {
      Alert.alert('Upload Failed', error?.message || 'Unable to select image. Please try again.');
    } finally {
      setImageUploading(false);
    }
  };

  const handleRemovePropertyImage = (index: number) => {
    setPropertyImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const createdProperty = await PropertyService.createProperty({
        name: name.trim(),
        description: description.trim() || undefined,
        address: address.trim(),
        city: city.trim() || undefined,
        state: state.trim() || undefined,
        zip_code: zipCode.trim(),
        rules: [
          rules.trim(),
          `Check-in: ${checkInTime}`,
          `Check-out: ${checkOutTime}`,
        ]
          .filter(Boolean)
          .join('\n'),
        amenities: Object.entries(amenities)
          .filter(([, v]) => v)
          .map(([k]) => k),
      } as any);

      const propertyId = (createdProperty as any)?.id;
      if (!propertyId) {
        throw new Error('Property created but property ID is missing in response.');
      }

      // Upload selected property images
      for (const image of propertyImages) {
        await PropertyService.uploadSingleImage(propertyId, image.dataUrl);
      }

      // Optionally bootstrap initial floor/room/bed inventory in one flow.
      const totalRooms = Math.max(0, Number.parseInt(roomCount || '0', 10) || 0);
      if (totalRooms > 0) {
        const totalFloors = Math.max(1, Number.parseInt(floorCount || '1', 10) || 1);
        const resolvedBedsPerRoom = Math.max(
          1,
          Number.parseInt(bedsPerRoom || '1', 10) || Number.parseInt(sharingCapacity || '1', 10) || 1
        );
        const resolvedSharingCapacity = Math.max(1, Number.parseInt(sharingCapacity || '1', 10) || 1);
        const resolvedBedRent = Math.max(0, Number.parseInt(bedRent || '0', 10) || 0);
        const resolvedSecurityDeposit = Math.max(0, Number.parseInt(securityDeposit || '0', 10) || 0);

        const floors: Array<{ id: string; floorNo: number }> = [];
        for (let i = 1; i <= totalFloors; i += 1) {
          const floor = await PropertyService.addFloor(propertyId, `Floor ${i}`);
          floors.push({ id: floor.id, floorNo: i });
        }

        const perFloorRoomCounter = new Map<number, number>();
        for (let i = 0; i < totalRooms; i += 1) {
          const floor = floors[i % floors.length];
          const currentCount = (perFloorRoomCounter.get(floor.floorNo) || 0) + 1;
          perFloorRoomCounter.set(floor.floorNo, currentCount);

          const roomNumber = `F${floor.floorNo}-R${String(currentCount).padStart(2, '0')}`;
          const room = await PropertyService.addRoom(floor.id, {
            room_number: roomNumber,
            room_type: roomType,
            sharing_capacity: resolvedSharingCapacity,
          } as any);

          for (let bedIndex = 1; bedIndex <= resolvedBedsPerRoom; bedIndex += 1) {
            await PropertyService.addBed(room.id, `B${bedIndex}`, {
              rent: resolvedBedRent,
              security_deposit: resolvedSecurityDeposit,
            });
          }
        }
      }

      Alert.alert(
        '✅ Property Created',
        totalRooms > 0
          ? 'Property and initial floor/room/bed setup saved successfully.'
          : 'Your property listing has been submitted for manager review.',
        [{ text: 'Go to Properties', onPress: () => router.replace('/(tabs)/properties') }]
      );
    } catch (error: any) {
      Alert.alert(
        'Save Failed',
        error?.message || 'Could not save property. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={styles.headerRow}>
        {step === 2 && (
          <TouchableOpacity onPress={() => setStep(1)} style={styles.backBtn}>
            <Text style={[styles.backBtnText, { color: '#6366f1' }]}>← Back</Text>
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.text }]}>
            {step === 1 ? '🏠 New Property Listing' : '⚙️ Amenities & Rules'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Step {step} of 2 — {step === 1 ? 'Basic Information' : 'Facilities & House Rules'}
          </Text>
        </View>
      </View>

      {/* Step indicator */}
      <View style={styles.stepBar}>
        <View style={[styles.stepDot, { backgroundColor: '#6366f1' }]} />
        <View style={[styles.stepLine, { backgroundColor: step === 2 ? '#6366f1' : colors.backgroundElement }]} />
        <View style={[styles.stepDot, { backgroundColor: step === 2 ? '#6366f1' : colors.backgroundElement }]} />
      </View>

      {step === 1 ? (
        <>
          <Input
            label="Property Name *"
            placeholder="e.g. Homie HSR Luxury Rooms"
            value={name}
            onChangeText={setName}
          />
          <Input
            label="Description"
            placeholder="Describe location, food plan, nearby colleges, etc."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            style={{ height: 80 }}
          />
          <Input
            label="Street Address *"
            placeholder="e.g. 84, Sector 3, HSR Layout"
            value={address}
            onChangeText={setAddress}
          />
          <View style={styles.row}>
            <Input
              label="City"
              placeholder="e.g. Bengaluru"
              value={city}
              onChangeText={setCity}
              containerStyle={{ flex: 1 }}
            />
            <Input
              label="State"
              placeholder="e.g. Karnataka"
              value={state}
              onChangeText={setState}
              containerStyle={{ flex: 1 }}
            />
          </View>
          <Input
            label="ZIP / Pin Code *"
            placeholder="e.g. 560102"
            value={zipCode}
            onChangeText={setZipCode}
            keyboardType="number-pad"
          />

          <Button
            title="Next: Amenities →"
            onPress={goToStep2}
            style={{ marginTop: Spacing.two }}
          />
          <Button
            title="Cancel"
            onPress={() => router.back()}
            variant="outline"
            style={{ marginTop: Spacing.two }}
          />
        </>
      ) : (
        <>
          {/* Amenities */}
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
            AVAILABLE FACILITIES
          </Text>
          <Card style={[styles.amenitiesCard, { backgroundColor: colors.backgroundElement }]}>
            {AMENITY_LIST.map(({ key, label, description: desc }, idx) => (
              <View
                key={key}
                style={[
                  styles.amenityRow,
                  idx < AMENITY_LIST.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: colors.backgroundElement,
                  },
                ]}
              >
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={[styles.amenityLabel, { color: colors.text }]}>{label}</Text>
                  <Text style={[styles.amenityDesc, { color: colors.textSecondary }]}>{desc}</Text>
                </View>
                <Switch
                  value={amenities[key]}
                  onValueChange={() => toggleAmenity(key)}
                  trackColor={{ false: colors.backgroundElement, true: '#6366f1' }}
                  thumbColor="#ffffff"
                />
              </View>
            ))}
          </Card>

          {/* House Rules */}
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
            HOUSE RULES
          </Text>
          <Input
            label="House Rules"
            placeholder="e.g. Gate closes at 10:30 PM, No guests overnight..."
            value={rules}
            onChangeText={setRules}
            multiline
            numberOfLines={3}
            style={{ height: 80 }}
          />
          <View style={styles.row}>
            <Input
              label="Check-In Time"
              placeholder="12:00 PM"
              value={checkInTime}
              onChangeText={setCheckInTime}
              containerStyle={{ flex: 1 }}
            />
            <Input
              label="Check-Out Time"
              placeholder="11:00 AM"
              value={checkOutTime}
              onChangeText={setCheckOutTime}
              containerStyle={{ flex: 1 }}
            />
          </View>

          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>PROPERTY IMAGES</Text>
          <Card style={[styles.imageUploadCard, { backgroundColor: colors.backgroundElement }]}> 
            <Text style={[styles.imageHelpText, { color: colors.textSecondary }]}>Upload photos of your PG rooms and common areas.</Text>
            <TouchableOpacity
              onPress={handlePickPropertyImage}
              disabled={imageUploading}
              style={[styles.imageUploadButton, { borderColor: colors.textSecondary + '35' }]}
            >
              {imageUploading ? (
                <ActivityIndicator size="small" color="#6366f1" />
              ) : (
                <Text style={styles.imageUploadButtonText}>+ Upload Image</Text>
              )}
            </TouchableOpacity>

            {propertyImages.length === 0 ? (
              <Text style={[styles.noImageText, { color: colors.textSecondary }]}>No images selected yet.</Text>
            ) : (
              <View style={styles.selectedImageList}>
                {propertyImages.map((image, index) => (
                  <View key={`${image.name}-${index}`} style={styles.selectedImageRow}>
                    <Text style={[styles.selectedImageName, { color: colors.text }]} numberOfLines={1}>
                      {image.name}
                    </Text>
                    <TouchableOpacity onPress={() => handleRemovePropertyImage(index)}>
                      <Text style={styles.removeImageText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </Card>

          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>INITIAL INVENTORY (OPTIONAL)</Text>
          <View style={styles.row}>
            <Input
              label="Number of Floors"
              placeholder="e.g. 2"
              value={floorCount}
              onChangeText={setFloorCount}
              keyboardType="number-pad"
              containerStyle={{ flex: 1 }}
            />
            <Input
              label="Total Rooms"
              placeholder="e.g. 12"
              value={roomCount}
              onChangeText={setRoomCount}
              keyboardType="number-pad"
              containerStyle={{ flex: 1 }}
            />
          </View>
          <View style={styles.row}>
            <Input
              label="Beds per Room"
              placeholder="e.g. 2"
              value={bedsPerRoom}
              onChangeText={setBedsPerRoom}
              keyboardType="number-pad"
              containerStyle={{ flex: 1 }}
            />
            <Input
              label="Sharing Capacity"
              placeholder="e.g. 2"
              value={sharingCapacity}
              onChangeText={setSharingCapacity}
              keyboardType="number-pad"
              containerStyle={{ flex: 1 }}
            />
          </View>

          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>ROOM TYPE</Text>
          <View style={styles.roomTypeRow}>
            {(['NON_AC', 'AC'] as const).map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => setRoomType(type)}
                style={[
                  styles.roomTypeBtn,
                  {
                    borderColor: roomType === type ? '#6366f1' : colors.textSecondary + '30',
                    backgroundColor: roomType === type ? '#6366f115' : 'transparent',
                  },
                ]}
              >
                <Text
                  style={{
                    color: roomType === type ? '#6366f1' : colors.textSecondary,
                    fontWeight: '700',
                  }}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.row}>
            <Input
              label="Bed Rent"
              placeholder="e.g. 10000"
              value={bedRent}
              onChangeText={setBedRent}
              keyboardType="number-pad"
              containerStyle={{ flex: 1 }}
            />
            <Input
              label="Security Deposit"
              placeholder="e.g. 10000"
              value={securityDeposit}
              onChangeText={setSecurityDeposit}
              keyboardType="number-pad"
              containerStyle={{ flex: 1 }}
            />
          </View>

          <Button
            title="💾 Save Property Listing"
            onPress={handleSave}
            loading={loading}
            style={{ marginTop: Spacing.two }}
          />
          <Button
            title="← Back to Details"
            onPress={() => setStep(1)}
            variant="outline"
            style={{ marginTop: Spacing.two }}
          />
        </>
      )}
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
    paddingBottom: 60,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  backBtn: {
    paddingTop: 4,
    paddingRight: Spacing.two,
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
  stepBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.one,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  stepLine: {
    flex: 1,
    height: 2,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  roomTypeRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  roomTypeBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: Spacing.one,
  },
  imageUploadCard: {
    borderRadius: 14,
    gap: Spacing.two,
  },
  imageHelpText: {
    fontSize: 11,
    fontWeight: '500',
  },
  imageUploadButton: {
    height: 44,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageUploadButtonText: {
    color: '#6366f1',
    fontWeight: '700',
    fontSize: 13,
  },
  noImageText: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  selectedImageList: {
    gap: Spacing.one,
  },
  selectedImageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  selectedImageName: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
  },
  removeImageText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '700',
  },
  amenitiesCard: {
    borderRadius: 16,
    overflow: 'hidden',
    padding: 0,
  },
  amenityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    gap: Spacing.two,
  },
  amenityLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  amenityDesc: {
    fontSize: 11,
    fontWeight: '500',
  },
});
