import { io, Socket } from 'socket.io-client';
import { ENV } from '@/config/env';
import { TokenManager } from './TokenManager';

let socket: Socket | null = null;

export function connectSocket(): Socket | null {
  const token = TokenManager.getToken();
  if (!token) return null;

  if (socket) {
    if (!socket.connected) socket.connect();
    return socket;
  }

  socket = io(ENV.SOCKET_URL, {
    // Re-evaluated on every (re)connect attempt, so a refreshed token is picked up
    auth: (cb) => cb({ token: TokenManager.getToken() }),
    transports: ['websocket'],
    autoConnect: true,
  });

  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}

export function getSocket(): Socket | null {
  return socket;
}
