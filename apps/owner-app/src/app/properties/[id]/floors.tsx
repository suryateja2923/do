import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Modal, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Card, Input, Button, useThemeColors } from '@/shared';
import { Spacing } from '@/constants/theme';
import { useApi } from '@/hooks/useShared';
import { PropertyService } from '@/features/properties/services/propertyService';
import { Layers as IconLayers, Plus as IconPlus, Trash2 as IconTrash2, ArrowRight as IconArrowRight, Edit2 as IconEdit2 } from 'lucide-react-native';
const Layers = IconLayers as any;
const Plus = IconPlus as any;
const Trash2 = IconTrash2 as any;
const ArrowRight = IconArrowRight as any;
const Edit2 = IconEdit2 as any;

export default function FloorManagementScreen() {
  const { id: propertyId } = useLocalSearchParams<{ id: string }>();
  const colors = useThemeColors();
  const router = useRouter();

  const { data: property, loading, execute: refetch } = useApi(
    () => PropertyService.getPropertyDetail(propertyId),
    true,
    []
  );

  const [newFloorName, setNewFloorName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingFloorId, setEditingFloorId] = useState('');
  const [editingFloorName, setEditingFloorName] = useState('');

  const handleUpdateFloor = async () => {
    if (!editingFloorName.trim()) {
      alert('Floor name is required');
      return;
    }
    setSubmitting(true);
    try {
      await PropertyService.updateFloor(propertyId, editingFloorId, editingFloorName);
      setEditModalVisible(false);
      await refetch();
    } catch {
      alert('Failed to update floor name');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddFloor = async () => {
    if (!newFloorName.trim()) {
      alert('Floor name is required');
      return;
    }

    setSubmitting(true);
    try {
      await PropertyService.addFloor(propertyId, newFloorName);
      setNewFloorName('');
      await refetch();
    } catch {
      alert('Failed to add floor');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFloor = (floorId: string, roomCount: number) => {
    if (roomCount > 0) {
      Alert.alert(
        'Action Denied',
        'You cannot delete a floor that contains rooms. Please delete all rooms on this floor first.'
      );
      return;
    }

    Alert.alert(
      'Delete Floor',
      'Are you sure you want to delete this floor?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await PropertyService.deleteFloor(propertyId, floorId);
            refetch();
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  const floors = property?.floors || [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Configure box */}
      <Card style={styles.addCard}>
        <Text style={[styles.addTitle, { color: colors.text }]}>Add New Floor</Text>
        <View style={styles.row}>
          <Input
            placeholder="e.g. Ground Floor, 2nd Floor"
            value={newFloorName}
            onChangeText={setNewFloorName}
            containerStyle={{ flex: 1 }}
          />
          <TouchableOpacity onPress={handleAddFloor} disabled={submitting} style={styles.addBtn}>
            <Plus color="#ffffff" size={20} />
          </TouchableOpacity>
        </View>
      </Card>

      {/* Floors list */}
      <FlatList
        data={floors}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Layers color={colors.textSecondary} size={36} />
            <Text style={[styles.emptyText, { color: colors.text }]}>No Floors Configured</Text>
            <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
              Add floors above to start defining rooms.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const roomCount = item.rooms?.length || 0;
          const bedCount = item.rooms?.reduce((acc: number, r: any) => acc + (r.beds?.length || 0), 0) || 0;

          return (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => router.push(`/properties/${propertyId}/floors/${item.id}/rooms`)}
            >
              <Card style={styles.floorCard}>
                <View style={styles.cardInfo}>
                  <Layers color="#6366f1" size={18} />
                  <View>
                    <Text style={[styles.floorName, { color: colors.text }]}>{item.name}</Text>
                    <Text style={[styles.floorStats, { color: colors.textSecondary }]}>
                      {roomCount} Rooms &bull; {bedCount} Beds
                    </Text>
                  </View>
                </View>

                <View style={styles.cardActions}>
                  <TouchableOpacity
                    onPress={() => {
                      setEditingFloorId(item.id);
                      setEditingFloorName(item.name);
                      setEditModalVisible(true);
                    }}
                    style={[styles.actionBtn, { marginRight: 8 }]}
                  >
                    <Edit2 color="#6366f1" size={16} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteFloor(item.id, roomCount)}
                    style={styles.actionBtn}
                  >
                    <Trash2 color="#ef4444" size={16} />
                  </TouchableOpacity>
                  <ArrowRight color={colors.textSecondary} size={18} />
                </View>
              </Card>
            </TouchableOpacity>
          );
        }}
      />

      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}>
          <Card style={{ gap: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: '800', color: colors.text }}>Rename Floor</Text>
            <Input
              placeholder="Enter floor name"
              value={editingFloorName}
              onChangeText={setEditingFloorName}
            />
            <View style={{ flexDirection: 'row', gap: 12, justifyContent: 'flex-end' }}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setEditModalVisible(false)}
              />
              <Button
                title="Save Changes"
                onPress={handleUpdateFloor}
                loading={submitting}
              />
            </View>
          </Card>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addCard: {
    margin: Spacing.four,
    gap: Spacing.two,
  },
  addTitle: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'center',
  },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
    gap: Spacing.two,
  },
  floorCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.three,
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  floorName: {
    fontSize: 14,
    fontWeight: '700',
  },
  floorStats: {
    fontSize: 11,
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  actionBtn: {
    padding: Spacing.one,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.five,
    gap: Spacing.two,
    marginTop: 30,
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
