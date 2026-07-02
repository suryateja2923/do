import { apiClient } from '@/api/apiClient';
import { API_ENDPOINTS } from '@/api/endpoints';
import { Complaint } from '@/types';

export class ComplaintService {
  public static async getComplaints(): Promise<Complaint[]> {
    const response: any = await apiClient.get(API_ENDPOINTS.COMPLAINTS.LIST);
    return response.data;
  }

  public static async postReply(id: string, message: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.COMPLAINTS.REPLY(id), { message });
  }

  public static async assignStaff(id: string, staffName: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.COMPLAINTS.ASSIGN(id), { staffName });
  }

  public static async updateStatus(id: string, status: Complaint['status'], notes?: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.COMPLAINTS.STATUS(id), { status, notes });
  }
}

export default ComplaintService;
