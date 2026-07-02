import { api } from './api';
import { OwnerProfile, Property, Booking, Payment, Complaint, User } from '../types';

export interface DashboardStats {
  totals: {
    owners: number;
    managers: number;
    properties: number;
    pendingProperties: number;
    verifiedProperties: number;
    rooms: number;
    occupiedRooms: number;
    vacantRooms: number;
    beds: number;
    occupiedBeds: number;
    vacantBeds: number;
    users: number;
    monthlyRevenue: number;
    pendingPayments: number;
    activeBookings: number;
    pendingComplaints: number;
    resolvedComplaints: number;
  };
  charts: {
    revenue: { month: string; amount: number }[];
    occupancy: { category: string; value: number }[];
    bookings: { month: string; bookings: number }[];
    growth: { month: string; users: number; properties: number }[];
  };
  recentActivities: {
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }[];
}

export class AdminService {
  /**
   * Fetch complete Dashboard aggregation stats
   */
  public static async getDashboardStats(): Promise<DashboardStats> {
    const response: any = await api.get('/admin/dashboard-stats');
    return response.data as DashboardStats;
  }

  /**
   * Fetch registered paying guest owners list
   */
  public static async getOwners(): Promise<OwnerProfile[]> {
    const response: any = await api.get('/admin/owners');
    return response.data as OwnerProfile[];
  }

  /**
   * Verify an Owner profile (Approve, Reject, Suspend)
   */
  public static async verifyOwner(id: string, status: OwnerProfile['kyc_status'], notes: string): Promise<void> {
    await api.post(`/admin/owners/${id}/verify`, { status, notes });
  }

  /**
   * Fetch registered PG properties list
   */
  public static async getProperties(): Promise<Property[]> {
    const response: any = await api.get('/admin/properties');
    return response.data as Property[];
  }

  /**
   * Verify a property profile (Approve, Reject)
   */
  public static async verifyProperty(id: string, status: Property['kyc_status'], notes: string): Promise<void> {
    await api.post(`/admin/properties/${id}/verify`, { status, notes });
  }

  /**
   * Fetch bookings list
   */
  public static async getBookings(): Promise<Booking[]> {
    const response: any = await api.get('/admin/bookings');
    return response.data?.bookings || response.data || [];
  }

  /**
   * Fetch complaints list
   */
  public static async getComplaints(): Promise<Complaint[]> {
    const response: any = await api.get('/admin/complaints');
    return response.data?.complaints || response.data || [];
  }

  /**
   * Fetch managers list
   */
  public static async getManagers(): Promise<any[]> {
    const response: any = await api.get('/admin/managers');
    return response.data || [];
  }

  /**
   * Fetch system users/tenants list
   */
  public static async getUsers(): Promise<User[]> {
    const response: any = await api.get('/admin/users');
    return response.data?.users || response.data || [];
  }

  /**
   * Fetch payments list
   */
  public static async getPayments(): Promise<Payment[]> {
    const response: any = await api.get('/admin/payments');
    return response.data?.payments || response.data || [];
  }
}
