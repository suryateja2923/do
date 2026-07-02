"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManagerService = void 0;
const manager_repository_1 = require("./manager.repository");
class ManagerService {
    repo = new manager_repository_1.ManagerRepository();
    async getDashboardStats() {
        return this.repo.getDashboardStats();
    }
    async getOwners() {
        return this.repo.getOwners();
    }
    async verifyOwner(id, status, notes) {
        return this.repo.verifyOwner(id, status, notes);
    }
    async requestOwnerDocuments(id, documentTypes, notes) {
        return this.repo.requestOwnerDocuments(id, documentTypes, notes);
    }
    async suspendOwner(id, notes) {
        return this.repo.suspendOwner(id, notes);
    }
    async getVerificationHistory(id) {
        return this.repo.getVerificationHistory(id);
    }
    async getProperties() {
        return this.repo.getProperties();
    }
    async verifyProperty(id, status, notes) {
        return this.repo.verifyProperty(id, status, notes);
    }
    async getBookings() {
        return this.repo.getBookings();
    }
    async verifyBooking(id, status) {
        return this.repo.verifyBooking(id, status);
    }
    async getComplaints() {
        return this.repo.getComplaints();
    }
    async updateComplaintStatus(id, status, notes) {
        return this.repo.updateComplaintStatus(id, status, notes);
    }
    async getReports(category) {
        return this.repo.getReports(category);
    }
    async searchAll(query) {
        return this.repo.searchAll(query);
    }
}
exports.ManagerService = ManagerService;
