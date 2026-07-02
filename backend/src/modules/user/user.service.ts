import { UserRepository } from './user.repository';

export class UserService {
  private repo = new UserRepository();

  async getProfile(userId: string) {
    return this.repo.getProfile(userId);
  }

  async updateProfile(userId: string, data: any) {
    return this.repo.updateProfile(userId, data);
  }

  async searchProperties(filters: any) {
    return this.repo.searchProperties(filters);
  }

  async getPropertyDetail(propertyId: string) {
    return this.repo.getPropertyDetail(propertyId);
  }

  async getFavorites(tenantId: string) {
    return this.repo.getFavorites(tenantId);
  }

  async addFavorite(tenantId: string, propertyId: string) {
    return this.repo.addFavorite(tenantId, propertyId);
  }

  async removeFavorite(tenantId: string, propertyId: string) {
    return this.repo.removeFavorite(tenantId, propertyId);
  }

  async getBookings(tenantId: string) {
    return this.repo.getBookings(tenantId);
  }

  async createBooking(tenantId: string, userId: string, bedId: string, expectedMoveIn: Date) {
    return this.repo.createBooking(tenantId, userId, bedId, expectedMoveIn);
  }

  async cancelBooking(tenantId: string, bookingId: string) {
    return this.repo.cancelBooking(tenantId, bookingId);
  }

  async getComplaints(tenantId: string) {
    return this.repo.getComplaints(tenantId);
  }

  async createComplaint(tenantId: string, data: any) {
    return this.repo.createComplaint(tenantId, data);
  }

  async getNotifications(userId: string) {
    return this.repo.getNotifications(userId);
  }

  async markNotificationAsRead(userId: string, notificationId: string) {
    return this.repo.markNotificationAsRead(userId, notificationId);
  }

  async createReview(tenantId: string, data: any) {
    return this.repo.createReview(tenantId, data);
  }
}
