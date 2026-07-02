import { apiClient } from '@/api/apiClient';
import { API_ENDPOINTS } from '@/api/endpoints';
import { Tenant } from '@/types';

export class TenantService {
  public static async getTenants(): Promise<Tenant[]> {
    const response: any = await apiClient.get(API_ENDPOINTS.TENANTS.LIST);
    return response.data;
  }

  public static async getTenantDetail(id: string): Promise<Tenant | null> {
    const response: any = await apiClient.get(API_ENDPOINTS.TENANTS.DETAIL(id));
    return response.data;
  }
}

export default TenantService;
