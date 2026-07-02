import { AdminRepository } from './admin.repository';
import { VerificationStatus } from '@prisma/client';
import { NotFoundException } from '../../utils/exceptions';

export class AdminService {
  private repo = new AdminRepository();

  async getDashboardStats() {
    return this.repo.getDashboardStats();
  }

  async getOwners(page?: number, limit?: number) {
    return this.repo.getOwners(page, limit);
  }

  async verifyOwner(id: string, status: string, notes?: string) {
    const statusEnum = status as VerificationStatus;
    return this.repo.verifyOwner(id, statusEnum, notes);
  }

  async getProperties(page?: number, limit?: number) {
    return this.repo.getProperties(page, limit);
  }

  async verifyProperty(id: string, status: string, notes?: string) {
    const statusEnum = status as VerificationStatus;
    return this.repo.verifyProperty(id, statusEnum, notes);
  }

  async getBookings(page?: number, limit?: number) {
    return this.repo.getBookings(page, limit);
  }

  async getComplaints(page?: number, limit?: number) {
    return this.repo.getComplaints(page, limit);
  }

  async getManagers(page?: number, limit?: number) {
    return this.repo.getManagers(page, limit);
  }

  async getUsers(page?: number, limit?: number) {
    return this.repo.getUsers(page, limit);
  }

  async getPayments(page?: number, limit?: number) {
    return this.repo.getPayments(page, limit);
  }
}

export default AdminService;
