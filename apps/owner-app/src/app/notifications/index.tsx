import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Modal } from 'react-native';
import { Card, Input, Button, EmptyState, useThemeColors } from '@/shared';
import { Spacing } from '@/constants/theme';
import { useApi } from '@/hooks/useShared';
import { useNotificationSocket } from '@/hooks/useNotificationSocket';
import { apiClient } from '@/api/apiClient';
import { API_ENDPOINTS } from '@/api/endpoints';
import { NotificationService, OwnerNotification } from '@/features/notifications/services/notificationService';
import { Bell as IconBell } from 'lucide-react-native';
const Bell = IconBell as any;

const TYPE_LABELS: Record<string, string> = {
  BOOKING_STATUS: 'Booking update',
  PAYMENT_DUE: 'Payment due',
  PAYMENT_SUCCESS: 'Payment received',
  COMPLAINT_UPDATE: 'Complaint update',
  ANNOUNCEMENT: 'Announcement',
  SYSTEM: 'System alert',
};

export default function NotificationsCenter() {
  const colors = useThemeColors();

  // Notifications addressed to this owner
  const { data: notificationsData, loading, execute: refetch } = useApi<OwnerNotification[], []>(
    NotificationService.list,
    true
  );
  const notifications = notificationsData ?? [];

  // Live push: prepend/refresh the list the instant a new notification arrives
  useNotificationSocket(useCallback(() => { refetch(); }, [refetch]));

  const [markingId, setMarkingId] = useState<string | null>(null);
  const [activeNotification, setActiveNotification] = useState<OwnerNotification | null>(null);

  const handleOpenNotification = async (n: OwnerNotification) => {
    setActiveNotification(n);
    if (n.is_read || markingId) return;
    setMarkingId(n.id);
    try {
      await NotificationService.markAsRead(n.id);
      setActiveNotification((prev) => (prev && prev.id === n.id ? { ...prev, is_read: true } : prev));
      await refetch();
    } catch {
      // best-effort — leave it unread if the request fails
    } finally {
      setMarkingId(null);
    }
  };

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [target, setTarget] = useState('ALL_TENANTS');
  const [sending, setSending] = useState(false);

  const handleSendNotification = async () => {
    if (!title.trim() || !content.trim()) {
      alert('Notification title and message content are required.');
      return;
    }

    setSending(true);
    try {
      await apiClient.post(API_ENDPOINTS.NOTIFICATIONS.SEND, { title, content, target });
      Alert.alert('Broadcast Alert Posted', 'Notification sent to HSR area residents.');
      setTitle('');
      setContent('');
      refetch();
    } catch {
      Alert.alert('Dispatch Failed', 'Server rejected notification dispatch.');
    } finally {
      setSending(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.scroll}>
      {/* Your own notifications */}
      <Card style={styles.historyCard}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.title, { color: colors.text }]}>Your Notifications</Text>
          {unreadCount > 0 && (
            <View style={[styles.unreadPill, { backgroundColor: '#6366f1' }]}>
              <Text style={styles.unreadPillText}>{unreadCount} new</Text>
            </View>
          )}
        </View>
        <Text style={[styles.subtitle, { color: colors.textSecondary, marginBottom: Spacing.two }]}>
          Alerts about your properties, bookings, complaints and account — tap one to mark it read.
        </Text>

        {loading ? (
          <ActivityIndicator size="small" color="#6366f1" />
        ) : notifications.length === 0 ? (
          <EmptyState title="No notifications yet" description="You're all caught up. New alerts will show up here." />
        ) : (
          <View style={styles.list}>
            {notifications.map((n) => (
              <TouchableOpacity
                key={n.id}
                onPress={() => handleOpenNotification(n)}
                activeOpacity={n.is_read ? 1 : 0.6}
                style={styles.notifItem}
              >
                <View style={styles.notifIconWrap}>
                  <Bell color={n.is_read ? colors.textSecondary : '#6366f1'} size={16} />
                  {!n.is_read && <View style={styles.unreadDot} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.notifTitle,
                      { color: colors.text, fontWeight: n.is_read ? '600' : '800' },
                    ]}
                  >
                    {n.title}
                  </Text>
                  <Text numberOfLines={2} style={[styles.notifContent, { color: colors.textSecondary }]}>{n.body}</Text>
                  <Text style={[styles.notifDate, { color: colors.textSecondary }]}>
                    {new Date(n.created_at).toLocaleString()}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </Card>

      {/* Notification detail */}
      {activeNotification && (
        <Modal visible={true} transparent animationType="slide" onRequestClose={() => setActiveNotification(null)}>
          <View style={styles.modalOverlay}>
            <Card style={[styles.modalCard, { backgroundColor: colors.background }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalHeaderLabel, { color: colors.text }]}>
                  {TYPE_LABELS[activeNotification.type] || 'Notification'}
                </Text>
                <TouchableOpacity onPress={() => setActiveNotification(null)}>
                  <Text style={[styles.closeText, { color: colors.textSecondary }]}>Close</Text>
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={styles.modalScroll}>
                <Text style={[styles.detailTitle, { color: colors.text }]}>{activeNotification.title}</Text>
                <Text style={[styles.detailBody, { color: colors.textSecondary }]}>{activeNotification.body}</Text>

                <View style={[styles.metaInfo, { backgroundColor: colors.backgroundElement }]}>
                  <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>
                    Received: {new Date(activeNotification.created_at).toLocaleString()}
                  </Text>
                  <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>
                    Status: {activeNotification.is_read ? 'Read' : 'Unread'}
                  </Text>
                </View>

                <Button title="Close" onPress={() => setActiveNotification(null)} style={styles.submitBtn} />
              </ScrollView>
            </Card>
          </View>
        </Modal>
      )}

      {/* Configure targeted dispatcher form */}
      <Card style={styles.dispatchCard}>
        <Text style={[styles.title, { color: colors.text }]}>Send Tenant Broadcast</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Post alerts, maintenance logs, or safety messages to checked-in residents.
        </Text>

        <Input label="Alert Title" placeholder="e.g. Geyser Maintenance Checklist" value={title} onChangeText={setTitle} />
        <Input label="Message Content" placeholder="e.g. Plumber Ramesh will visit tomorrow morning..." value={content} onChangeText={setContent} multiline numberOfLines={3} style={{ height: 60 }} />

        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Target Recipients</Text>
        <View style={styles.radioRow}>
          {['ALL_TENANTS', 'ROOM_101'].map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setTarget(t)}
              style={[
                styles.radioBtn,
                {
                  borderColor: target === t ? '#6366f1' : colors.textSecondary + '20',
                  backgroundColor: target === t ? '#6366f110' : 'transparent',
                },
              ]}
            >
              <Text style={[styles.radioText, { color: target === t ? '#6366f1' : colors.textSecondary }]}>
                {t.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button title="Dispatch Alert" onPress={handleSendNotification} loading={sending} style={styles.submitBtn} />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: Spacing.four,
    gap: Spacing.three,
    paddingBottom: 40,
  },
  dispatchCard: {
    gap: Spacing.three,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  unreadPill: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  unreadPillText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 18,
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
    fontSize: 11,
    fontWeight: '700',
  },
  submitBtn: {
    marginTop: Spacing.one,
  },
  historyCard: {
    gap: Spacing.two,
  },
  list: {
    gap: Spacing.three,
  },
  notifItem: {
    flexDirection: 'row',
    gap: Spacing.three,
    alignItems: 'flex-start',
  },
  notifIconWrap: {
    marginTop: 2,
  },
  unreadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ef4444',
  },
  notifTitle: {
    fontSize: 13,
  },
  notifContent: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },
  notifDate: {
    fontSize: 9,
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
    maxHeight: '75%',
    padding: Spacing.four,
    gap: Spacing.three,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  modalHeaderLabel: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  closeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  modalScroll: {
    gap: Spacing.three,
    paddingBottom: 24,
  },
  detailTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  detailBody: {
    fontSize: 13,
    lineHeight: 20,
  },
  metaInfo: {
    borderRadius: 12,
    padding: Spacing.three,
    gap: 4,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});
