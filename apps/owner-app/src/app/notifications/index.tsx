import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Card, Input, Button, useThemeColors } from '@/shared';
import { Spacing } from '@/constants/theme';
import { useApi } from '@/hooks/useShared';
import { apiClient } from '@/api/apiClient';
import { API_ENDPOINTS } from '@/api/endpoints';
import { Bell as IconBell, Send as IconSend, Users as IconUsers } from 'lucide-react-native';
const Bell = IconBell as any;
const Send = IconSend as any;
const Users = IconUsers as any;

export default function NotificationsCenter() {
  const colors = useThemeColors();

  // Load existing notifications
  const { data: notifications = [], loading, execute: refetch } = useApi(
    async () => {
      const response: any = await apiClient.get(API_ENDPOINTS.NOTIFICATIONS.LIST);
      return response.data;
    },
    true
  );

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

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.scroll}>
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

      {/* History logs */}
      <Card style={styles.historyCard}>
        <Text style={[styles.title, { color: colors.text, marginBottom: Spacing.two }]}>History Logs</Text>
        {loading ? (
          <ActivityIndicator size="small" color="#6366f1" />
        ) : (
          <View style={styles.list}>
            {notifications.map((n: any) => (
              <View key={n.id} style={styles.notifItem}>
                <Bell color="#6366f1" size={16} style={{ marginTop: 2 }} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.notifTitle, { color: colors.text }]}>{n.title}</Text>
                  <Text style={[styles.notifContent, { color: colors.textSecondary }]}>{n.content}</Text>
                  <Text style={[styles.notifDate, { color: colors.textSecondary }]}>
                    {new Date(n.timestamp).toLocaleString()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
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
  notifTitle: {
    fontSize: 13,
    fontWeight: '700',
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
});
