import { apiClient } from '@/api/apiClient';
import { API_ENDPOINTS } from '@/api/endpoints';

export interface OwnerNotification {
  id: string;
  title: string;
  body: string;
  type: string;
  is_read: boolean;
  read_at: string | null;
  link: string | null;
  created_at: string;
}

export class NotificationService {
  public static async list(): Promise<OwnerNotification[]> {
    const response: any = await apiClient.get(API_ENDPOINTS.NOTIFICATIONS.LIST);
    return response.data;
  }

  public static async markAsRead(id: string): Promise<void> {
    await apiClient.put(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
  }
}
export default NotificationService;
