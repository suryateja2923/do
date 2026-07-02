import { apiClient } from '../api/apiClient';

export class UserService {
  // Auth endpoints
  public static async registerUser(payload: any): Promise<any> {
    return apiClient.post('/auth/register-user', payload);
  }

  public static async login(payload: any): Promise<any> {
    return apiClient.post('/auth/login', payload);
  }

  public static async getMe(): Promise<any> {
    return apiClient.get('/auth/me');
  }

  // Profile endpoints
  public static async getProfile(): Promise<any> {
    return apiClient.get('/user/profile');
  }

  public static async updateProfile(payload: any): Promise<any> {
    return apiClient.put('/user/profile', payload);
  }

  // Properties endpoints
  public static async searchProperties(params: any): Promise<any[]> {
    const response: any = await apiClient.get('/user/properties', { params });
    if (!Array.isArray(response.data)) {
      throw new Error('Invalid properties response from server');
    }
    return response.data;
  }

  public static async getPropertyDetail(id: string): Promise<any> {
    const response: any = await apiClient.get(`/user/properties/${id}`);
    return response.data;
  }

  // Favorites endpoints
  public static async getFavorites(): Promise<any[]> {
    const response: any = await apiClient.get('/user/favorites');
    if (!Array.isArray(response.data)) {
      throw new Error('Invalid favorites response from server');
    }
    return response.data;
  }

  public static async addFavorite(propertyId: string): Promise<any> {
    return apiClient.post(`/user/properties/${propertyId}/favorite`);
  }

  public static async removeFavorite(propertyId: string): Promise<any> {
    return apiClient.delete(`/user/properties/${propertyId}/favorite`);
  }

  // Bookings endpoints
  public static async getBookings(): Promise<any[]> {
    const response: any = await apiClient.get('/user/bookings');
    if (!Array.isArray(response.data)) {
      throw new Error('Invalid bookings response from server');
    }
    return response.data;
  }

  public static async createBooking(payload: { bedId: string; expectedMoveIn: string }): Promise<any> {
    return apiClient.post('/user/bookings', payload);
  }

  public static async cancelBooking(id: string): Promise<any> {
    return apiClient.post(`/user/bookings/${id}/cancel`);
  }

  // Complaints endpoints
  public static async getComplaints(): Promise<any[]> {
    const response: any = await apiClient.get('/user/complaints');
    if (!Array.isArray(response.data)) {
      throw new Error('Invalid complaints response from server');
    }
    return response.data;
  }

  public static async createComplaint(payload: any): Promise<any> {
    return apiClient.post('/user/complaints', payload);
  }

  // Notifications endpoints
  public static async getNotifications(): Promise<any[]> {
    const response: any = await apiClient.get('/user/notifications');
    if (!Array.isArray(response.data)) {
      throw new Error('Invalid notifications response from server');
    }
    return response.data;
  }

  public static async markNotificationAsRead(id: string): Promise<any> {
    return apiClient.put(`/user/notifications/${id}/read`);
  }

  // Reviews endpoints
  public static async submitReview(payload: any): Promise<any> {
    return apiClient.post('/user/reviews', payload);
  }
}

export default UserService;
