import { NotificationType } from '@prisma/client';
import { OwnerRepository } from './owner.repository';

export class OwnerService {
  private repo = new OwnerRepository();

  async getApplicationStatus(ownerProfileId: string) {
    return this.repo.getApplicationStatus(ownerProfileId);
  }

  async resubmitDocuments(ownerProfileId: string, data: any) {
    return this.repo.resubmitDocuments(ownerProfileId, data);
  }

  async getProfile(ownerProfileId: string) {
    return this.repo.getProfile(ownerProfileId);
  }

  async getDashboardStats(ownerProfileId: string, propertyId?: string) {
    return this.repo.getDashboardStats(ownerProfileId, propertyId);
  }

  async getProperties(ownerProfileId: string) {
    return this.repo.getProperties(ownerProfileId);
  }

  async createProperty(ownerProfileId: string, data: any) {
    return this.repo.createProperty(ownerProfileId, data);
  }

  async getPropertyDetail(ownerProfileId: string, id: string) {
    return this.repo.getPropertyDetail(ownerProfileId, id);
  }

  async updateProperty(ownerProfileId: string, id: string, data: any) {
    return this.repo.updateProperty(ownerProfileId, id, data);
  }

  async deactivateProperty(ownerProfileId: string, id: string) {
    return this.repo.deactivateProperty(ownerProfileId, id);
  }

  async uploadPropertyImage(ownerProfileId: string, propertyId: string, imageUrl: string) {
    return this.repo.uploadPropertyImage(ownerProfileId, propertyId, imageUrl);
  }

  async deletePropertyImage(ownerProfileId: string, propertyId: string, imageId: string) {
    return this.repo.deletePropertyImage(ownerProfileId, propertyId, imageId);
  }

  async getBookings(ownerProfileId: string) {
    return this.repo.getBookings(ownerProfileId);
  }

  async verifyBooking(ownerProfileId: string, id: string, data: any) {
    return this.repo.verifyBooking(ownerProfileId, id, data);
  }

  async getComplaints(ownerProfileId: string) {
    return this.repo.getComplaints(ownerProfileId);
  }

  async getTenants(ownerProfileId: string) {
    return this.repo.getTenants(ownerProfileId);
  }

  async getTenantDetail(ownerProfileId: string, tenantId: string) {
    return this.repo.getTenantDetail(ownerProfileId, tenantId);
  }

  async getBookingTimeline(ownerProfileId: string, bookingId: string) {
    return this.repo.getBookingTimeline(ownerProfileId, bookingId);
  }

  async listFloors(ownerProfileId: string, propertyId: string) {
    return this.repo.listFloors(ownerProfileId, propertyId);
  }

  async createFloor(ownerProfileId: string, propertyId: string, name: string) {
    return this.repo.createFloor(ownerProfileId, propertyId, name);
  }

  async updateFloor(ownerProfileId: string, propertyId: string, floorId: string, name: string) {
    return this.repo.updateFloor(ownerProfileId, propertyId, floorId, name);
  }

  async deleteFloor(ownerProfileId: string, propertyId: string, floorId: string) {
    return this.repo.deleteFloor(ownerProfileId, propertyId, floorId);
  }

  async listRooms(ownerProfileId: string, floorId: string) {
    return this.repo.listRooms(ownerProfileId, floorId);
  }

  async createRoom(ownerProfileId: string, floorId: string, data: any) {
    return this.repo.createRoom(ownerProfileId, floorId, data);
  }

  async updateRoom(ownerProfileId: string, roomId: string, data: any) {
    return this.repo.updateRoom(ownerProfileId, roomId, data);
  }

  async deleteRoom(ownerProfileId: string, roomId: string) {
    return this.repo.deleteRoom(ownerProfileId, roomId);
  }

  async listBeds(ownerProfileId: string, roomId: string) {
    return this.repo.listBeds(ownerProfileId, roomId);
  }

  async createBed(ownerProfileId: string, roomId: string, data: any) {
    return this.repo.createBed(ownerProfileId, roomId, data.bedNumber, data);
  }

  async updateBed(ownerProfileId: string, bedId: string, data: any) {
    return this.repo.updateBed(ownerProfileId, bedId, data);
  }

  async deleteBed(ownerProfileId: string, bedId: string) {
    return this.repo.deleteBed(ownerProfileId, bedId);
  }

  async getNotifications(userId: string) {
    return this.repo.getNotifications(userId);
  }

  async sendNotification(userId: string, title: string, body: string, type?: string) {
    return this.repo.sendNotification(userId, title, body, (type as NotificationType) || NotificationType.SYSTEM);
  }

  async replyComplaint(ownerProfileId: string, complaintId: string, userId: string, message: string) {
    return this.repo.replyComplaint(ownerProfileId, complaintId, userId, message);
  }

  async assignComplaint(ownerProfileId: string, complaintId: string, userId: string, staffName: string) {
    return this.repo.assignComplaint(ownerProfileId, complaintId, userId, staffName);
  }

  async updateComplaintStatus(ownerProfileId: string, complaintId: string, userId: string, status: any, notes?: string) {
    return this.repo.updateComplaintStatus(ownerProfileId, complaintId, userId, status, notes);
  }

  async getReports(ownerProfileId: string) {
    return this.repo.getReports(ownerProfileId);
  }

  async searchAll(ownerProfileId: string, query: string) {
    return this.repo.searchAll(ownerProfileId, query);
  }
}
