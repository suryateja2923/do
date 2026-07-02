import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Card, Input, Button, StatusBadge, useThemeColors } from '@/shared';
import { Spacing } from '@/constants/theme';
import { useApi } from '@/hooks/useShared';
import { PropertyService } from '@/features/properties/services/propertyService';
import { Bed as IconBed, Plus as IconPlus, Trash2 as IconTrash2, ShieldAlert as IconShieldAlert, Edit2 as IconEdit2 } from 'lucide-react-native';
const BedIcon = IconBed as any;
const Plus = IconPlus as any;
const Trash2 = IconTrash2 as any;
const ShieldAlert = IconShieldAlert as any;
const Edit2 = IconEdit2 as any;

export default function BedManagementScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const colors = useThemeColors();
  const router = useRouter();

  // Find room and properties containing this room. Since getProperties loads all, we can query it locally
  const { data: properties = [], loading, execute: refetch } = useApi(
    PropertyService.getProperties,
    true
  );

  const [newBedNumber, setNewBedNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Edit Bed State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingBedId, setEditingBedId] = useState('');
  const [editingBedNumber, setEditingBedNumber] = useState('');
  const [editingRent, setEditingRent] = useState('10000');
  const [editingDeposit, setEditingDeposit] = useState('10000');

  const handleUpdateBed = async () => {
    if (!editingBedNumber.trim()) {
      alert('Bed designation is required');
      return;
    }
    setSubmitting(true);
    try {
      await PropertyService.updateBed(editingBedId, {
        bed_number: editingBedNumber,
        rent: parseInt(editingRent) || 10000,
        security_deposit: parseInt(editingDeposit) || 10000,
      });
      setEditModalVisible(false);
      await refetch();
    } catch {
      alert('Failed to update bed details');
    } finally {
      setSubmitting(false);
    }
  };

  // Locate the specific room and its floor/beds
  const room = properties
    ?.flatMap((p) => p.floors || [])
    ?.flatMap((f) => f.rooms || [])
    ?.find((r) => r.id === roomId);

  const handleAddBed = async () => {
    if (!newBedNumber.trim()) {
      alert('Bed designation label is required');
      return;
    }

    setSubmitting(true);
    try {
      await PropertyService.addBed(roomId, newBedNumber);
      setNewBedNumber('');
      await refetch();
    } catch {
      alert('Failed to add bed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = (bedId: string, currentStatus: any) => {
    const nextStatus = currentStatus === 'VACANT' ? 'UNDER_MAINTENANCE' : 'VACANT';
    Alert.alert(
      'Update Bed Status',
      `Would you like to toggle status to ${nextStatus.replace('_', ' ')}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            await PropertyService.updateBedStatus(bedId, nextStatus);
            refetch();
          },
        },
      ]
    );
  };

  const handleDeleteBed = (bedId: string, status: string) => {
    if (status === 'OCCUPIED') {
      Alert.alert(
        'Action Denied',
        'You cannot delete an occupied bed. Please check out the tenant before deleting this bed.'
      );
      return;
    }

    Alert.alert(
      'Delete Bed',
      'Are you sure you want to delete this bed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await PropertyService.deleteBed(bedId);
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

  const beds = room?.beds || [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Configure Bed box */}
      <Card style={styles.addCard}>
        <Text style={[styles.addTitle, { color: colors.text }]}>Add New Bed</Text>
        <View style={styles.row}>
          <Input
            placeholder="e.g. Bed A, Bed B, Bed 1"
            value={newBedNumber}
            onChangeText={setNewBedNumber}
            containerStyle={{ flex: 1 }}
          />
          <TouchableOpacity onPress={handleAddBed} disabled={submitting} style={styles.addBtn}>
            <Plus color="#ffffff" size={20} />
          </TouchableOpacity>
        </View>
      </Card>

      {/* Beds lists */}
      <FlatList
        data={beds}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <BedIcon color={colors.textSecondary} size={36} />
            <Text style={[styles.emptyText, { color: colors.text }]}>No Beds Configured</Text>
            <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
              Create beds above to enable tenant booking check-ins.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Card style={styles.bedCard}>
            <View style={styles.cardInfo}>
              <BedIcon color={item.status === 'OCCUPIED' ? '#10b981' : '#6366f1'} size={18} />
              <View>
                <Text style={[styles.bedNumber, { color: colors.text }]}>Bed {item.bed_number}</Text>
                <Text style={[styles.bedStatusText, { color: colors.textSecondary }]}>
                  {item.status === 'OCCUPIED' ? 'Tenant Checked In' : 'Ready for Allocation'}
                </Text>
              </View>
            </View>

            <View style={styles.cardActions}>
              <StatusBadge status={item.status} />
              {item.status !== 'OCCUPIED' && (
                <TouchableOpacity
                  onPress={() => handleToggleStatus(item.id, item.status)}
                  style={[styles.toggleBtn, { borderColor: colors.textSecondary + '30' }]}
                >
                  <ShieldAlert color={colors.textSecondary} size={14} />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => {
                  setEditingBedId(item.id);
                  setEditingBedNumber(item.bed_number);
                  setEditingRent((item.rent || 10000).toString());
                  setEditingDeposit((item.security_deposit || 10000).toString());
                  setEditModalVisible(true);
                }}
                style={[styles.toggleBtn, { borderColor: colors.textSecondary + '30', marginRight: 6 }]}
              >
                <Edit2 color="#6366f1" size={14} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDeleteBed(item.id, item.status)}
                style={styles.deleteBtn}
              >
                <Trash2 color="#ef4444" size={16} />
              </TouchableOpacity>
            </View>
          </Card>
        )}
      />

      {/* Edit Bed Modal */}
      <Modal visible={editModalVisible} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}>
          <Card style={{ gap: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: '800', color: colors.text }}>Modify Bed Details</Text>
            
            <Input
              label="Bed Label/Designation"
              placeholder="e.g. Bed A, Bed 1"
              value={editingBedNumber}
              onChangeText={setEditingBedNumber}
            />

            <Input
              label="Rent Amount (Monthly)"
              placeholder="e.g. 10000"
              value={editingRent}
              onChangeText={setEditingRent}
              keyboardType="number-pad"
            />

            <Input
              label="Security Deposit"
              placeholder="e.g. 10000"
              value={editingDeposit}
              onChangeText={setEditingDeposit}
              keyboardType="number-pad"
            />

            <View style={{ flexDirection: 'row', gap: 12, justifyContent: 'flex-end' }}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setEditModalVisible(false)}
              />
              <Button
                title="Save Changes"
                onPress={handleUpdateBed}
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
  bedCard: {
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
  bedNumber: {
    fontSize: 14,
    fontWeight: '700',
  },
  bedStatusText: {
    fontSize: 11,
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  toggleBtn: {
    padding: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  deleteBtn: {
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
