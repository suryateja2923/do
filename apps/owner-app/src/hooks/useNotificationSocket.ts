import { useEffect } from 'react';
import { getSocket } from '@/api/socketClient';
import type { OwnerNotification } from '@/features/notifications/services/notificationService';

/**
 * Subscribes to live 'notification:new' pushes for as long as the component
 * is mounted. The socket connection itself is owned by the root layout
 * (connected on login, disconnected on logout) — this just attaches a
 * listener to whatever socket is currently live.
 */
export function useNotificationSocket(onNewNotification: (notification: OwnerNotification) => void) {
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on('notification:new', onNewNotification);
    return () => {
      socket.off('notification:new', onNewNotification);
    };
  }, [onNewNotification]);
}

export default useNotificationSocket;
