import { NotificationChannel, NotificationQueueStatus, NotificationType, Prisma, PrismaClient } from '@prisma/client';
import { getIO, isUserOnline, userRoom } from '../../realtime/socket';

type DbClient = Prisma.TransactionClient | PrismaClient;

export interface NotificationPayload {
  userId: string;
  title: string;
  body: string;
  type?: NotificationType;
  link?: string;
  queueChannel?: NotificationChannel;
}

export class NotificationService {
  public static async create(db: DbClient, payload: NotificationPayload) {
    const type = payload.type || NotificationType.SYSTEM;
    const channel = payload.queueChannel || NotificationChannel.PUSH;

    const [notification, queueItem] = await Promise.all([
      db.notification.create({
        data: {
          user_id: payload.userId,
          title: payload.title,
          body: payload.body,
          type,
          link: payload.link,
        },
      }),
      db.notificationQueue.create({
        data: {
          user_id: payload.userId,
          title: payload.title,
          body: payload.body,
          channel,
        },
      }),
    ]);

    // Live delivery: push straight to the recipient's socket if they're connected now.
    const deliveredLive = isUserOnline(payload.userId);
    if (deliveredLive) {
      getIO()?.to(userRoom(payload.userId)).emit('notification:new', notification);

      if (channel === NotificationChannel.PUSH) {
        await db.notificationQueue.update({
          where: { id: queueItem.id },
          data: { status: NotificationQueueStatus.SENT, delivery_time: new Date() },
        });
      }
    }

    return { notification, queueItem };
  }
}

export default NotificationService;