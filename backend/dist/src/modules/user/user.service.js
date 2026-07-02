"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_repository_1 = require("./user.repository");
class UserService {
    repo = new user_repository_1.UserRepository();
    async getProfile(userId) {
        return this.repo.getProfile(userId);
    }
    async updateProfile(userId, data) {
        return this.repo.updateProfile(userId, data);
    }
    async searchProperties(filters) {
        return this.repo.searchProperties(filters);
    }
    async getPropertyDetail(propertyId) {
        return this.repo.getPropertyDetail(propertyId);
    }
    async getFavorites(tenantId) {
        return this.repo.getFavorites(tenantId);
    }
    async addFavorite(tenantId, propertyId) {
        return this.repo.addFavorite(tenantId, propertyId);
    }
    async removeFavorite(tenantId, propertyId) {
        return this.repo.removeFavorite(tenantId, propertyId);
    }
    async getBookings(tenantId) {
        return this.repo.getBookings(tenantId);
    }
    async createBooking(tenantId, userId, bedId, expectedMoveIn) {
        return this.repo.createBooking(tenantId, userId, bedId, expectedMoveIn);
    }
    async cancelBooking(tenantId, bookingId) {
        return this.repo.cancelBooking(tenantId, bookingId);
    }
    async getComplaints(tenantId) {
        return this.repo.getComplaints(tenantId);
    }
    async createComplaint(tenantId, data) {
        return this.repo.createComplaint(tenantId, data);
    }
    async getNotifications(userId) {
        return this.repo.getNotifications(userId);
    }
    async markNotificationAsRead(userId, notificationId) {
        return this.repo.markNotificationAsRead(userId, notificationId);
    }
    async createReview(tenantId, data) {
        return this.repo.createReview(tenantId, data);
    }
}
exports.UserService = UserService;
