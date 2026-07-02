import { ManagerRepository } from './manager.repository';
import { NotificationType, VerificationStatus, BookingStatus, ComplaintStatus } from '@prisma/client';

export class ManagerService {
  private repo = new ManagerRepository();

  async getDashboardStats() {
    return this.repo.getDashboardStats();
  }

  async getOwners() {
    return this.repo.getOwners();
  }

  async verifyOwner(id: string, status: string, notes: string) {
    return this.repo.verifyOwner(id, status as VerificationStatus, notes);
  }

  async requestOwnerDocuments(id: string, documentTypes: string[], notes: string) {
    return this.repo.requestOwnerDocuments(id, documentTypes, notes);
  }

  async suspendOwner(id: string, notes: string) {
    return this.repo.suspendOwner(id, notes);
  }

  async getVerificationHistory(id: string) {
    return this.repo.getVerificationHistory(id);
  }

  async getProperties() {
    return this.repo.getProperties();
  }

  async verifyProperty(id: string, status: string, notes: string) {
    return this.repo.verifyProperty(id, status as VerificationStatus, notes);
  }

  async requestPropertyCorrections(id: string, corrections: string[], notes: string) {
    return this.repo.requestPropertyCorrections(id, corrections, notes);
  }

  async suspendProperty(id: string, notes: string) {
    return this.repo.suspendProperty(id, notes);
  }

  async getBookings() {
    return this.repo.getBookings();
  }

  async verifyBooking(id: string, status: string) {
    return this.repo.verifyBooking(id, status as BookingStatus);
  }

  async getComplaints() {
    return this.repo.getComplaints();
  }

  async updateComplaintStatus(id: string, status: string, notes: string) {
    return this.repo.updateComplaintStatus(id, status as ComplaintStatus, notes);
  }

  async assignComplaint(id: string, staffName: string) {
    return this.repo.assignComplaint(id, staffName);
  }

  async sendNotification(userId: string, title: string, content: string, type?: string) {
    return this.repo.sendNotification(userId, title, content, (type as NotificationType) || NotificationType.SYSTEM);
  }

  async broadcastAnnouncement(title: string, content: string) {
    return this.repo.broadcastAnnouncement(title, content);
  }

  async getTasks() {
    return this.repo.getTasks();
  }

  async updateTaskStatus(id: string, status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CLARIFICATION_REQUESTED', clarificationNotes?: string) {
    return this.repo.updateTaskStatus(id, status, clarificationNotes);
  }

  async getReports(category: string) {
    return this.repo.getReports(category);
  }

  async searchAll(query: string) {
    return this.repo.searchAll(query);
  }
}
