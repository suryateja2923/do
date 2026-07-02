import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert, Modal, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, StatusBadge, useThemeColors } from '../shared';
import { Spacing } from '../constants/theme';
import { UserService } from '../services/userService';

export default function BookingsScreen() {
  const colors = useThemeColors();

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Complaint modal state
  const [complaintModal, setComplaintModal] = useState(false);
  const [selectedPropId, setSelectedPropId] = useState<string>('');
  const [complaintTitle, setComplaintTitle] = useState('');
  const [complaintDesc, setComplaintDesc] = useState('');
  const [complaintCat, setComplaintCat] = useState<'PLUMBING' | 'ELECTRICAL' | 'CLEANLINESS' | 'INTERNET' | 'FURNITURE' | 'NOISE' | 'SECURITY' | 'OTHER'>('OTHER');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await UserService.getBookings();
      setBookings(data);
    } catch (err: any) {
      console.log('Error fetching bookings', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = (bookingId: string) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this pending booking? This will vacate your reserved bed.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await UserService.cancelBooking(bookingId);
              Alert.alert('Cancelled', 'Your booking has been cancelled successfully.');
              fetchBookings();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to cancel booking');
            }
          },
        },
      ]
    );
  };

  const submitComplaint = async () => {
    if (!complaintTitle || !complaintDesc) {
      Alert.alert('Input Error', 'Please enter a title and description.');
      return;
    }

    try {
      await UserService.createComplaint({
        property_id: selectedPropId,
        title: complaintTitle,
        description: complaintDesc,
        category: complaintCat,
        priority: 'MEDIUM',
      });
      Alert.alert('Success', 'Complaint submitted successfully.');
      setComplaintModal(false);
      setComplaintTitle('');
      setComplaintDesc('');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to submit complaint');
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <Text style={[styles.title, { color: colors.text }]}>My Bookings & Stays</Text>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchBookings} colors={['#6366f1']} />}
      >
        {bookings.length > 0 ? (
          bookings.map((booking) => (
            <Card key={booking.id} style={styles.bookingCard}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={[styles.propName, { color: colors.text }]}>
                    {booking.bed?.room?.floor?.property?.name || 'HomiePG Stay'}
                  </Text>
                  <Text style={[styles.propAddress, { color: colors.textSecondary }]}>
                    Room {booking.bed?.room?.room_number || 'N/A'}, Bed {booking.bed?.bed_number || 'N/A'}
                  </Text>
                </View>
                <StatusBadge status={booking.status} />
              </View>

              <View style={[styles.divider, { backgroundColor: colors.textSecondary + '15' }]} />

              <View style={styles.detailsGrid}>
                <View>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Expected Move-In</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {new Date(booking.expected_move_in).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                </View>

                <View>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Monthly Rent</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>₹{parseFloat(booking.rent).toFixed(0)}</Text>
                </View>

                <View>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Booking Amount</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>₹{parseFloat(booking.booking_amount).toFixed(0)}</Text>
                </View>
              </View>

              {/* Action buttons depending on state */}
              {booking.status === 'PENDING' && (
                <Button
                  title="Cancel Booking"
                  onPress={() => handleCancelBooking(booking.id)}
                  variant="danger"
                  style={styles.actionBtn}
                />
              )}

              {booking.status === 'APPROVED' && (
                <Button
                  title="Submit Support / Complaint"
                  onPress={() => {
                    setSelectedPropId(booking.bed?.room?.floor?.property?.id);
                    setComplaintModal(true);
                  }}
                  variant="outline"
                  style={styles.actionBtn}
                />
              )}
            </Card>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Bookings Found</Text>
            <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
              You have not created any PG booking requests yet. Visit the Explore tab to reserve a bed.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Complaint Modal */}
      <Modal visible={complaintModal} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Register a Complaint</Text>

            <ScrollView contentContainerStyle={{ gap: Spacing.two, paddingBottom: Spacing.four }}>
              <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '600', textTransform: 'uppercase' }}>
                Category
              </Text>
              <View style={styles.catRow}>
                {(['PLUMBING', 'ELECTRICAL', 'CLEANLINESS', 'INTERNET', 'FURNITURE', 'SECURITY', 'OTHER'] as const).map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.catBtn,
                      complaintCat === cat && styles.catBtnActive,
                      { borderColor: colors.textSecondary + '30' },
                    ]}
                    onPress={() => setComplaintCat(cat)}
                  >
                    <Text style={[styles.catBtnText, complaintCat === cat && styles.catBtnTextActive, { color: colors.text }]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '600', textTransform: 'uppercase' }}>
                Complaint Title
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: colors.backgroundElement,
                    color: colors.text,
                    borderColor: colors.textSecondary + '20',
                  },
                ]}
                placeholder="Brief title (e.g. WiFi not working)"
                placeholderTextColor={colors.textSecondary + '80'}
                value={complaintTitle}
                onChangeText={setComplaintTitle}
              />

              <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '600', textTransform: 'uppercase' }}>
                Detailed Description
              </Text>
              <TextInput
                style={[
                  styles.textArea,
                  {
                    backgroundColor: colors.backgroundElement,
                    color: colors.text,
                    borderColor: colors.textSecondary + '20',
                  },
                ]}
                placeholder="Explain the issue in detail..."
                placeholderTextColor={colors.textSecondary + '80'}
                multiline
                numberOfLines={4}
                value={complaintDesc}
                onChangeText={setComplaintDesc}
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <Button title="Cancel" onPress={() => setComplaintModal(false)} variant="ghost" style={{ flex: 1 }} />
              <Button title="Submit Complaint" onPress={submitComplaint} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  scrollContainer: {
    padding: Spacing.four,
    gap: Spacing.four,
  },
  bookingCard: {
    gap: Spacing.three,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  propName: {
    fontSize: 15,
    fontWeight: '800',
  },
  propAddress: {
    fontSize: 11,
    marginTop: 2,
  },
  divider: {
    height: 1,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  detailLabel: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  actionBtn: {
    marginTop: Spacing.one,
  },
  emptyContainer: {
    paddingVertical: Spacing.six,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyDesc: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  modalBg: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.four,
    gap: Spacing.three,
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: Spacing.one,
  },
  catRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  catBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
  },
  catBtnActive: {
    backgroundColor: '#6366f115',
    borderColor: '#6366f1',
  },
  catBtnText: {
    fontSize: 10,
    fontWeight: '700',
  },
  catBtnTextActive: {
    color: '#6366f1',
  },
  textInput: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    fontSize: 13,
  },
  textArea: {
    height: 90,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 13,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
});
