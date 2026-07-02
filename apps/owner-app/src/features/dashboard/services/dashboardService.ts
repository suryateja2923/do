import { apiClient } from '@/api/apiClient';
import { API_ENDPOINTS } from '@/api/endpoints';
import { OwnerDashboardStats } from '@/types';

export class DashboardService {
  public static async getStats(): Promise<OwnerDashboardStats> {
    const response: any = await apiClient.get(API_ENDPOINTS.DASHBOARD.STATS);
    return response.data;
  }
}
export default DashboardService;
