"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const admin_repository_1 = require("./admin.repository");
class AdminService {
    repo = new admin_repository_1.AdminRepository();
    async getDashboardStats() {
        return this.repo.getDashboardStats();
    }
    async getOwners(page, limit) {
        return this.repo.getOwners(page, limit);
    }
    async verifyOwner(id, status, notes) {
        const statusEnum = status;
        return this.repo.verifyOwner(id, statusEnum, notes);
    }
    async getProperties(page, limit) {
        return this.repo.getProperties(page, limit);
    }
    async verifyProperty(id, status, notes) {
        const statusEnum = status;
        return this.repo.verifyProperty(id, statusEnum, notes);
    }
    async getBookings(page, limit) {
        return this.repo.getBookings(page, limit);
    }
    async getComplaints(page, limit) {
        return this.repo.getComplaints(page, limit);
    }
    async getManagers(page, limit) {
        return this.repo.getManagers(page, limit);
    }
    async getUsers(page, limit) {
        return this.repo.getUsers(page, limit);
    }
    async getPayments(page, limit) {
        return this.repo.getPayments(page, limit);
    }
}
exports.AdminService = AdminService;
exports.default = AdminService;
