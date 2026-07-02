import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, useThemeColors } from '../shared';
import { Spacing } from '../constants/theme';
import { UserService } from '../services/userService';

export default function NotificationsScreen() {
  const colors = useThemeColors();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await UserService.getNotifications();
      setNotifications(data);
    } catch (err: any) {
      console.log('Error fetching notifications', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string, isRead: boolean) => {
    if (isRead) return;
    try {
      await UserService.markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to mark notification as read');
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <Text style={[styles.title, { color: colors.text }]}>Notification Center</Text>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchNotifications} colors={['#6366f1']} />}
      >
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <TouchableOpacity
              key={notif.id}
              activeOpacity={notif.is_read ? 1 : 0.8}
              onPress={() => handleMarkAsRead(notif.id, notif.is_read)}
            >
              <Card style={[styles.notifCard, notif.is_read && { opacity: 0.7 }]}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.notifTitle, { color: colors.text }]}>{notif.title}</Text>
                  {!notif.is_read && <View style={styles.unreadDot} />}
                </View>

                <Text style={[styles.notifBody, { color: colors.textSecondary }]}>{notif.body}</Text>

                <Text style={[styles.notifTime, { color: colors.textSecondary }]}>
                  {new Date(notif.created_at).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </Text>
              </Card>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Inbox is Clean</Text>
            <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
              Any booking changes, payments, or updates will appear here.
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
  title: {
    fontSize: 20,
    fontWeight: '900',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  scrollContainer: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  notifCard: {
    gap: 6,
    padding: Spacing.three,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '800',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6366f1',
    marginLeft: 8,
  },
  notifBody: {
    fontSize: 12,
    lineHeight: 18,
  },
  notifTime: {
    fontSize: 10,
    alignSelf: 'flex-end',
    marginTop: 4,
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
});
