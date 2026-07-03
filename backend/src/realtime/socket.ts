import type { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { prisma } from '../config/database';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { resolveAuthToken } from '../middlewares/auth.middleware';

let io: SocketIOServer | null = null;

export function userRoom(userId: string): string {
  return `user:${userId}`;
}

export function initSocket(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: env.CORS_ORIGINS === '*' ? '*' : env.CORS_ORIGINS.split(','),
      credentials: true,
    },
  });

  // Handshake auth: same tokens the REST API accepts (custom JWT or legacy Supabase HMAC)
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token as string | undefined;
      if (!token) return next(new Error('Authentication token required'));

      const payload = resolveAuthToken(token);
      if (!payload || !payload.sub) return next(new Error('Invalid or expired authentication token'));

      const user = await prisma.user.findUnique({
        where: { id: payload.sub, is_deleted: false },
        select: { id: true },
      });
      if (!user) return next(new Error('User account not found or deactivated'));

      socket.data.userId = user.id;
      next();
    } catch (err) {
      next(err as Error);
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId as string;
    socket.join(userRoom(userId));
    logger.info(`Socket connected: user ${userId} (${socket.id})`);

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: user ${userId} (${socket.id})`);
    });
  });

  return io;
}

export function getIO(): SocketIOServer | null {
  return io;
}

export function isUserOnline(userId: string): boolean {
  if (!io) return false;
  const room = io.sockets.adapter.rooms.get(userRoom(userId));
  return !!room && room.size > 0;
}
