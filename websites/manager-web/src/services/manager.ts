import { api } from '@/services/api';
import { OwnerProfile, Property, Booking, Complaint } from '@/types';

export interface ManagerDashboardStats {
  totals: {
    pendingOwners: number;
    pendingProperties: number;
    pendingBookings: number;
    openComplaints: number;
    assignedTasks: number;
    waitingApprovalProperties: number;
    todayCompletedTasks: number;
    avgVerificationTimeHours: number;
  };
  charts: {
    ownerVerificationTrend: { date: string; pending: number; approved: number }[];
    propertyApprovalTrend: { date: string; pending: number; approved: number }[];
    complaintStatus: { status: string; count: number; color: string }[];
    taskCompletionRate: { date: string; rate: number }[];
  };
  recentActivities: {
    id: string;
    type: 'OWNER_REGISTRATION' | 'PROPERTY_SUBMISSION' | 'COMPLAINT_FILED' | 'BOOKING_REQUEST' | 'TASK_ASSIGNED';
    title: string;
    description: string;
    timestamp: string;
    status?: string;
  }[];
}

export interface ManagerTask {
  id: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CLARIFICATION_REQUESTED';
  due_date: string;
  assigned_to: string;
  clarification_notes?: string;
}

export interface VerificationHistoryItem {
  id: string;
  actor_name: string;
  action: 'APPROVED' | 'REJECTED' | 'DOCUMENTS_REQUESTED' | 'SUSPENDED' | 'CORRECTIONS_REQUESTED';
  notes: string;
  timestamp: string;
}

export class ManagerService {
  /**
   * Fetch manager specific dashboard operational metrics
   */
  public static async getDashboardStats(): Promise<ManagerDashboardStats> {
    const response: any = await api.get('/manager/dashboard-stats');
    return response.data as ManagerDashboardStats;
  }

  /**
   * Fetch registered owners with full verification details
   */
  public static async getOwners(): Promise<OwnerProfile[]> {
    const response: any = await api.get('/manager/owners');
    return response.data as OwnerProfile[];
  }

  /**
   * Action: Verify Owner
   */
  public static async verifyOwner(id: string, status: OwnerProfile['kyc_status'], notes: string): Promise<void> {
    await api.post(`/manager/owners/${id}/verify`, { status, notes });
  }

  /**
   * Action: Request Additional Documents
   */
  public static async requestOwnerDocuments(id: string, documentTypes: string[], notes: string): Promise<void> {
    await api.post(`/manager/owners/${id}/request-docs`, { documentTypes, notes });
  }

  /**
   * Action: Suspend Owner temporarily
   */
  public static async suspendOwner(id: string, notes: string): Promise<void> {
    await api.post(`/manager/owners/${id}/suspend`, { notes });
  }

  /**
   * Get Verification History for an owner or property
   */
  public static async getVerificationHistory(id: string): Promise<VerificationHistoryItem[]> {
    const response: any = await api.get(`/manager/verification-history/${id}`);
    return response.data as VerificationHistoryItem[];
  }

  /**
   * Fetch properties waiting for verification or under operational watch
   */
  public static async getProperties(): Promise<Property[]> {
    const response: any = await api.get('/manager/properties');
    return response.data as Property[];
  }

  /**
   * Action: Verify Property
   */
  public static async verifyProperty(id: string, status: Property['kyc_status'], notes: string): Promise<void> {
    await api.post(`/manager/properties/${id}/verify`, { status, notes });
  }

  /**
   * Action: Request Property Corrections
   */
  public static async requestPropertyCorrections(id: string, corrections: string[], notes: string): Promise<void> {
    await api.post(`/manager/properties/${id}/request-corrections`, { corrections, notes });
  }

  /**
   * Action: Suspend Property Listing
   */
  public static async suspendProperty(id: string, notes: string): Promise<void> {
    await api.post(`/manager/properties/${id}/suspend`, { notes });
  }

  /**
   * Fetch list of bookings requiring verification
   */
  public static async getBookings(): Promise<Booking[]> {
    const response: any = await api.get('/manager/bookings');
    return response.data as Booking[];
  }

  /**
   * Action: Update Booking Status
   */
  public static async verifyBooking(id: string, status: Booking['status']): Promise<void> {
    await api.post(`/manager/bookings/${id}/verify`, { status });
  }

  /**
   * Fetch complaints
   */
  public static async getComplaints(): Promise<Complaint[]> {
    const response: any = await api.get('/manager/complaints');
    return response.data as Complaint[];
  }

  /**
   * Action: Assign Complaint to Manager or Field Staff
   */
  public static async assignComplaint(id: string, staffName: string): Promise<void> {
    await api.post(`/manager/complaints/${id}/assign`, { staffName });
  }

  /**
   * Action: Add Internal Notes / Resolution / Status update for Complaint
   */
  public static async updateComplaintStatus(id: string, status: Complaint['status'], notes: string): Promise<void> {
    await api.post(`/manager/complaints/${id}/status`, { status, notes });
  }

  /**
   * Fetch Manager Tasks
   */
  public static async getTasks(): Promise<ManagerTask[]> {
    const response: any = await api.get('/manager/tasks');
    return response.data as ManagerTask[];
  }

  /**
   * Actions on Tasks
   */
  public static async updateTaskStatus(id: string, status: ManagerTask['status'], clarificationNotes?: string): Promise<void> {
    await api.post(`/manager/tasks/${id}/status`, { status, clarificationNotes });
  }

  /**
   * Action: Send operational notification to a user (e.g. Owner)
   */
  public static async sendNotification(userId: string, title: string, content: string): Promise<void> {
    await api.post('/manager/notifications/send', { userId, title, content });
  }

  /**
   * Action: Broadcast operational announcement to all owners
   */
  public static async broadcastAnnouncement(title: string, content: string): Promise<void> {
    await api.post('/manager/notifications/broadcast', { title, content });
  }

  /**
   * Fetch filterable reporting logs
   */
  public static async getReports(category: 'VERIFICATION' | 'COMPLAINTS' | 'OPERATIONAL' | 'PROPERTY'): Promise<any[]> {
    const response: any = await api.get(`/manager/reports?category=${category}`);
    return response.data as any[];
  }

  /**
   * Global Search
   */
  public static async searchAll(query: string): Promise<{
    owners: OwnerProfile[];
    properties: Property[];
    bookings: Booking[];
    complaints: Complaint[];
    tasks: ManagerTask[];
  }> {
    const response: any = await api.get(`/manager/search?q=${encodeURIComponent(query)}`);
    return response.data as any;
  }
}
