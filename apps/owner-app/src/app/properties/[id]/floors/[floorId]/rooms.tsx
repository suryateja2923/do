import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Modal } from 'react-native';
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

export default function RoomManagementScreen() {
  const { id: propertyId, floorId } = useLocalSearchParams<{ id: string; floorId: string }>();
  const colors = useThemeColors();
  const router = useRouter();

  const { data: property, loading, execute: refetch } = useApi(
    PropertyService.getPropertyDetail,
    true,
    [propertyId]
  );

  const [modalVisible, setModalVisible] = useState(false);
  const [roomNumber, setRoomNumber] = useState('');
  const [capacity, setCapacity] = useState('2');
  const [price, setPrice] = useState('10000');
  const [roomType, setRoomType] = useState<'AC' | 'NON_AC'>('NON_AC');
  const [submitting, setSubmitting] = useState(false);

  // Edit Room State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState('');
  const [editingRoomNumber, setEditingRoomNumber] = useState('');
  const [editingCapacity, setEditingCapacity] = useState('2');
  const [editingPrice, setEditingPrice] = useState('10000');
  const [editingRoomType, setEditingRoomType] = useState<'AC' | 'NON_AC'>('NON_AC');

  const handleUpdateRoom = async () => {
    if (!editingRoomNumber.trim()) {
      alert('Room number is required');
      return;
    }
    setSubmitting(true);
    try {
      await PropertyService.updateRoom(editingRoomId, {
        room_number: editingRoomNumber,
        sharing_capacity: parseInt(editingCapacity) || 1,
        price: parseInt(editingPrice) || 0,
        room_type: editingRoomType,
      });
      setEditModalVisible(false);
      await refetch(propertyId);
    } catch {
      alert('Failed to update room details');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddRoom = async () => {
    if (!roomNumber.trim()) {
      alert('Room number is required');
      return;
    }

    setSubmitting(true);
    try {
      await PropertyService.addRoom(floorId, {
        room_number: roomNumber,
        sharing_capacity: parseInt(capacity) || 1,
        price: parseInt(price) || 0,
        room_type: roomType,
      });
      setRoomNumber('');
      setModalVisible(false);
      await refetch(propertyId);
    } catch {
      alert('Failed to add room');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRoom = (roomId: string, bedCount: number) => {
    if (bedCount > 0) {
      Alert.alert(
        'Action Denied',
        'You cannot delete a room that contains beds. Please delete all beds inside this room first.'
      );
      return;
    }

    Alert.alert(
      'Delete Room',
      'Are you sure you want to delete this room?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await PropertyService.deleteRoom(roomId);
            refetch(propertyId);
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

  const floor = property?.floors?.find((f) => f.id === floorId);
  const rooms = floor?.rooms || [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header Info */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{floor?.name || 'Rooms list'}</Text>
        <Button title="Configure Room" onPress={() => setModalVisible(true)} style={styles.addBtn} />
      </View>

      <FlatList
        data={rooms}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Layers color={colors.textSecondary} size={36} />
            <Text style={[styles.emptyText, { color: colors.text }]}>No Rooms Configured</Text>
            <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
              Create rooms on this floor to configure occupant beds.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const bedCount = item.beds?.length || 0;
          const occupiedCount = item.beds?.filter((b) => b.status === 'OCCUPIED').length || 0;

          return (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => router.push(`/rooms/${item.id}/beds`)}
            >
              <Card style={styles.roomCard}>
                <View style={styles.cardInfo}>
                  <View style={[styles.roomIcon, { backgroundColor: colors.backgroundSelected }]}>
                    <Text style={[styles.roomIconText, { color: colors.text }]}>R</Text>
                  </View>
                  <View>
                    <Text style={[styles.roomNumber, { color: colors.text }]}>Room {item.room_number}</Text>
                    <Text style={[styles.roomMeta, { color: colors.textSecondary }]}>
                      {item.room_type} &bull; {item.sharing_capacity} Sharing &bull; ₹{item.price}/mo
                    </Text>
                    <Text style={[styles.occupancyMeta, { color: '#6366f1' }]}>
                      {occupiedCount}/{bedCount} Beds Occupied
                    </Text>
                  </View>
                </View>

                <View style={styles.cardActions}>
                  <TouchableOpacity
                    onPress={() => {
                      setEditingRoomId(item.id);
                      setEditingRoomNumber(item.room_number);
                      setEditingCapacity(item.sharing_capacity.toString());
                      setEditingPrice(item.price.toString());
                      setEditingRoomType(item.room_type as any);
                      setEditModalVisible(true);
                    }}
                    style={[styles.actionBtn, { marginRight: 8 }]}
                  >
                    <Edit2 color="#6366f1" size={16} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteRoom(item.id, bedCount)}
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

      {/* Add Room Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Card style={[styles.modalCard, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Configure New Room</Text>

            <Input label="Room Number" placeholder="e.g. 101, 102A" value={roomNumber} onChangeText={setRoomNumber} />
            <Input label="Rent Amount (Monthly)" placeholder="e.g. 10000" value={price} onChangeText={setPrice} keyboardType="number-pad" />
            <Input label="Sharing Capacity" placeholder="e.g. 2" value={capacity} onChangeText={setCapacity} keyboardType="number-pad" />

            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Room Type</Text>
            <View style={styles.radioRow}>
              {['NON_AC', 'AC'].map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setRoomType(type as any)}
                  style={[
                    styles.radioBtn,
                    {
                      borderColor: roomType === type ? '#6366f1' : colors.textSecondary + '20',
                      backgroundColor: roomType === type ? '#6366f110' : 'transparent',
                    },
                  ]}
                >
                  <Text style={[styles.radioText, { color: roomType === type ? '#6366f1' : colors.textSecondary }]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <Button title="Save Room" onPress={handleAddRoom} loading={submitting} style={{ flex: 1 }} />
              <Button title="Cancel" onPress={() => setModalVisible(false)} variant="outline" style={{ flex: 1 }} />
            </View>
          </Card>
        </View>
      </Modal>

      {/* Edit Room Modal */}
      <Modal visible={editModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Card style={[styles.modalCard, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Modify Room Details</Text>

            <Input label="Room Number" placeholder="e.g. 101, 102A" value={editingRoomNumber} onChangeText={setEditingRoomNumber} />
            <Input label="Rent Amount (Monthly)" placeholder="e.g. 10000" value={editingPrice} onChangeText={setEditingPrice} keyboardType="number-pad" />
            <Input label="Sharing Capacity" placeholder="e.g. 2" value={editingCapacity} onChangeText={setEditingCapacity} keyboardType="number-pad" />

            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Room Type</Text>
            <View style={styles.radioRow}>
              {['NON_AC', 'AC'].map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setEditingRoomType(type as any)}
                  style={[
                    styles.radioBtn,
                    {
                      borderColor: editingRoomType === type ? '#6366f1' : colors.textSecondary + '20',
                      backgroundColor: editingRoomType === type ? '#6366f110' : 'transparent',
                    },
                  ]}
                >
                  <Text style={[styles.radioText, { color: editingRoomType === type ? '#6366f1' : colors.textSecondary }]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <Button title="Save Changes" onPress={handleUpdateRoom} loading={submitting} style={{ flex: 1 }} />
              <Button title="Cancel" onPress={() => setEditModalVisible(false)} variant="outline" style={{ flex: 1 }} />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.four,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  addBtn: {
    height: 38,
    borderRadius: 10,
    backgroundColor: '#6366f1',
  },
  listContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
    gap: Spacing.two,
  },
  roomCard: {
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
  roomIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roomIconText: {
    fontSize: 14,
    fontWeight: '800',
  },
  roomNumber: {
    fontSize: 14,
    fontWeight: '700',
  },
  roomMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  occupancyMeta: {
    fontSize: 10,
    fontWeight: '700',
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: Spacing.four,
  },
  modalCard: {
    gap: Spacing.three,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: Spacing.one,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  radioRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  radioBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioText: {
    fontSize: 12,
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.two,
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
