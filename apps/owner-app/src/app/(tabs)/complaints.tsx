import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert,
  ScrollView,
} from 'react-native';
import { Card, StatusBadge, useThemeColors, Button, Input } from '@/shared';
import { Spacing } from '@/constants/theme';
import { useApi, useFilters } from '@/hooks/useShared';
import { ComplaintService } from '@/features/complaints/services/complaintService';
import { AlertCircle as IconAlertCircle, User as IconUser, CheckCircle2 as IconCheckCircle2, MessageSquare as IconMessageSquare, Send as IconSend } from 'lucide-react-native';
const AlertCircle = IconAlertCircle as any;
const User = IconUser as any;
const CheckCircle2 = IconCheckCircle2 as any;
const MessageSquare = IconMessageSquare as any;
const Send = IconSend as any;

export default function ComplaintsScreen() {
  const colors = useThemeColors();

  const { data: complaints = [], loading, execute: refetch } = useApi(
    ComplaintService.getComplaints,
    true
  );
  
  const [refreshing, setRefreshing] = useState(false);
  const [activeComplaint, setActiveComplaint] = useState<any | null>(null);

  // Form states inside modal
  const [replyMessage, setReplyMessage] = useState('');
  const [staffName, setStaffName] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { filters, updateFilter } = useFilters({
    status: 'ALL' as 'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED',
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handlePostReply = async () => {
    if (!replyMessage.trim()) return;
    setSubmitting(true);
    try {
      await ComplaintService.postReply(activeComplaint.id, replyMessage);
      setReplyMessage('');
      const updatedList = await ComplaintService.getComplaints();
      const match = updatedList.find((c) => c.id === activeComplaint.id);
      if (match) setActiveComplaint(match);
      refetch();
    } catch {
      alert('Failed to send message');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignStaff = async () => {
    if (!staffName.trim()) return;
    setSubmitting(true);
    try {
      await ComplaintService.assignStaff(activeComplaint.id, staffName);
      setStaffName('');
      const updatedList = await ComplaintService.getComplaints();
      const match = updatedList.find((c) => c.id === activeComplaint.id);
      if (match) setActiveComplaint(match);
      refetch();
      Alert.alert('Staff Assigned', 'Task assignment saved successfully.');
    } catch {
      alert('Failed to assign staff');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolve = async () => {
    setSubmitting(true);
    try {
      await ComplaintService.updateStatus(activeComplaint.id, 'RESOLVED', resolutionNotes);
      setResolutionNotes('');
      const updatedList = await ComplaintService.getComplaints();
      const match = updatedList.find((c) => c.id === activeComplaint.id);
      if (match) setActiveComplaint(match);
      refetch();
      Alert.alert('Ticket Resolved', 'Complaint marked resolved.');
    } catch {
      alert('Status update failed');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredComplaints = (complaints || []).filter((c) => {
    return filters.status === 'ALL' || c.status === filters.status;
  });

  const renderComplaintItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => setActiveComplaint(item)}
      style={styles.cardWrapper}
    >
      <Card style={styles.complaintCard}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              {item.category} &bull; Priority: {item.priority}
            </Text>
            <Text style={[styles.tenantName, { color: '#6366f1' }]}>
              Room {item.room_id?.replace('room-', '') || 'Common Area'} &bull; {item.tenant?.user.first_name} {item.tenant?.user.last_name}
            </Text>
          </View>
          <StatusBadge status={item.status} />
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Filters Bar */}
      <View style={styles.filterBar}>
        {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'].map((s) => (
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
              {s}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : (
        <FlatList
          data={filteredComplaints}
          keyExtractor={(item) => item.id}
          renderItem={renderComplaintItem}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View style={styles.empty}>
              <AlertCircle color={colors.textSecondary} size={36} />
              <Text style={[styles.emptyText, { color: colors.text }]}>No Complaints Found</Text>
              <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                No tickets matching the selected status.
              </Text>
            </View>
          }
        />
      )}

      {/* Ticket Details Modal */}
      {activeComplaint && (
        <Modal visible={true} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <Card style={[styles.modalCard, { backgroundColor: colors.background }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Complaint details</Text>
                <TouchableOpacity onPress={() => setActiveComplaint(null)}>
                  <Text style={[styles.closeText, { color: colors.textSecondary }]}>Close</Text>
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={styles.modalScroll}>
                <Text style={[styles.compTitle, { color: colors.text }]}>{activeComplaint.title}</Text>
                <Text style={[styles.compDesc, { color: colors.textSecondary }]}>{activeComplaint.description}</Text>

                <View style={[styles.metaInfo, { backgroundColor: colors.backgroundElement }]}>
                  <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>
                    Resident: {activeComplaint.tenant?.user.first_name} {activeComplaint.tenant?.user.last_name}
                  </Text>
                  <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>
                    Assigned Contractor: {activeComplaint.assigned_staff || 'Not Assigned'}
                  </Text>
                </View>

                {/* Timeline Replies */}
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Discussion & History</Text>
                <View style={styles.repliesList}>
                  {(activeComplaint.replies || []).map((rep: any) => (
                    <View key={rep.id} style={styles.replyBox}>
                      <Text style={[styles.replyRole, { color: rep.sender_role === 'OWNER' ? '#6366f1' : colors.textSecondary }]}>
                        {rep.sender_role} &bull; {new Date(rep.timestamp).toLocaleTimeString()}
                      </Text>
                      <Text style={[styles.replyMsg, { color: colors.text }]}>{rep.message}</Text>
                    </View>
                  ))}
                </View>

                {/* Quick actions inside detail modal */}
                {activeComplaint.status !== 'RESOLVED' && (
                  <View style={styles.actionsPanel}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Assign Maintenance</Text>
                    <View style={styles.row}>
                      <Input placeholder="e.g. Ramesh Plumber" value={staffName} onChangeText={setStaffName} containerStyle={{ flex: 1 }} />
                      <TouchableOpacity onPress={handleAssignStaff} disabled={submitting} style={styles.btnIcon}>
                        <User color="#ffffff" size={18} />
                      </TouchableOpacity>
                    </View>

                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Post a reply</Text>
                    <View style={styles.row}>
                      <Input placeholder="type message here..." value={replyMessage} onChangeText={setReplyMessage} containerStyle={{ flex: 1 }} />
                      <TouchableOpacity onPress={handlePostReply} disabled={submitting} style={styles.btnIcon}>
                        <Send color="#ffffff" size={18} />
                      </TouchableOpacity>
                    </View>

                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Resolve Ticket</Text>
                    <View style={styles.row}>
                      <Input placeholder="Enter resolution remarks..." value={resolutionNotes} onChangeText={setResolutionNotes} containerStyle={{ flex: 1 }} />
                      <TouchableOpacity onPress={handleResolve} disabled={submitting} style={[styles.btnIcon, { backgroundColor: '#10b981' }]}>
                        <CheckCircle2 color="#ffffff" size={18} />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </ScrollView>
            </Card>
          </View>
        </Modal>
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
  cardWrapper: {
    marginBottom: Spacing.one,
  },
  complaintCard: {
    gap: Spacing.one,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  metaText: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
  tenantName: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    padding: Spacing.four,
    gap: Spacing.three,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  closeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  modalScroll: {
    gap: Spacing.three,
    paddingBottom: 40,
  },
  compTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  compDesc: {
    fontSize: 12,
    lineHeight: 18,
  },
  metaInfo: {
    padding: Spacing.three,
    borderRadius: 14,
    gap: Spacing.one,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginTop: Spacing.two,
  },
  repliesList: {
    gap: Spacing.two,
  },
  replyBox: {
    padding: Spacing.two,
    borderRadius: 10,
    backgroundColor: 'rgba(99, 102, 241, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.08)',
  },
  replyRole: {
    fontSize: 9,
    fontWeight: '800',
  },
  replyMsg: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  actionsPanel: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'center',
  },
  btnIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
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
