"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OwnerService = void 0;
const owner_repository_1 = require("./owner.repository");
class OwnerService {
    repo = new owner_repository_1.OwnerRepository();
    async getApplicationStatus(ownerProfileId) {
        return this.repo.getApplicationStatus(ownerProfileId);
    }
    async resubmitDocuments(ownerProfileId, data) {
        return this.repo.resubmitDocuments(ownerProfileId, data);
    }
    async getProfile(ownerProfileId) {
        return this.repo.getProfile(ownerProfileId);
    }
    async getDashboardStats(ownerProfileId, propertyId) {
        return this.repo.getDashboardStats(ownerProfileId, propertyId);
    }
    async getProperties(ownerProfileId) {
        return this.repo.getProperties(ownerProfileId);
    }
    async createProperty(ownerProfileId, data) {
        return this.repo.createProperty(ownerProfileId, data);
    }
    async getPropertyDetail(ownerProfileId, id) {
        return this.repo.getPropertyDetail(ownerProfileId, id);
    }
    async updateProperty(ownerProfileId, id, data) {
        return this.repo.updateProperty(ownerProfileId, id, data);
    }
    async deactivateProperty(ownerProfileId, id) {
        return this.repo.deactivateProperty(ownerProfileId, id);
    }
    async uploadPropertyImage(ownerProfileId, propertyId, imageUrl) {
        return this.repo.uploadPropertyImage(ownerProfileId, propertyId, imageUrl);
    }
    async getBookings(ownerProfileId) {
        return this.repo.getBookings(ownerProfileId);
    }
    async verifyBooking(ownerProfileId, id, data) {
        return this.repo.verifyBooking(ownerProfileId, id, data);
    }
    async getComplaints(ownerProfileId) {
        return this.repo.getComplaints(ownerProfileId);
    }
    async getTenants(ownerProfileId) {
        return this.repo.getTenants(ownerProfileId);
    }
    async listFloors(ownerProfileId, propertyId) {
        return this.repo.listFloors(ownerProfileId, propertyId);
    }
    async createFloor(ownerProfileId, propertyId, name) {
        return this.repo.createFloor(ownerProfileId, propertyId, name);
    }
    async updateFloor(ownerProfileId, propertyId, floorId, name) {
        return this.repo.updateFloor(ownerProfileId, propertyId, floorId, name);
    }
    async deleteFloor(ownerProfileId, propertyId, floorId) {
        return this.repo.deleteFloor(ownerProfileId, propertyId, floorId);
    }
    async listRooms(ownerProfileId, floorId) {
        return this.repo.listRooms(ownerProfileId, floorId);
    }
    async createRoom(ownerProfileId, floorId, data) {
        return this.repo.createRoom(ownerProfileId, floorId, data);
    }
    async updateRoom(ownerProfileId, roomId, data) {
        return this.repo.updateRoom(ownerProfileId, roomId, data);
    }
    async deleteRoom(ownerProfileId, roomId) {
        return this.repo.deleteRoom(ownerProfileId, roomId);
    }
    async listBeds(ownerProfileId, roomId) {
        return this.repo.listBeds(ownerProfileId, roomId);
    }
    async createBed(ownerProfileId, roomId, bedNumber) {
        return this.repo.createBed(ownerProfileId, roomId, bedNumber);
    }
    async updateBed(ownerProfileId, bedId, data) {
        return this.repo.updateBed(ownerProfileId, bedId, data);
    }
    async deleteBed(ownerProfileId, bedId) {
        return this.repo.deleteBed(ownerProfileId, bedId);
    }
}
exports.OwnerService = OwnerService;
