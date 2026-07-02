import { NotificationChannel, NotificationType, Prisma, PrismaClient } from '@prisma/client';

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

    return { notification, queueItem };
  }
}

export default NotificationService;