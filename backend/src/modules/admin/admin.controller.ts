import { Request, Response, NextFunction } from 'express';
import { AdminService } from './admin.service';
import { ApiResponse } from '../../utils/response.formatter';

export class AdminController {
  private service = new AdminService();

  public getDashboardStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.getDashboardStats();
      ApiResponse.success(res, data, 'Dashboard statistics retrieved');
    } catch (error) { next(error); }
  };

  public getOwners = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const result = await this.service.getOwners(page, limit);
      ApiResponse.success(res, result.owners, 'Owners retrieved', 200, { total: result.total, page, limit });
    } catch (error) { next(error); }
  };

  public verifyOwner = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as any;
      const { status, notes } = req.body;
      const result = await this.service.verifyOwner(id, status, notes);
      ApiResponse.success(res, result, `Owner ${status.toLowerCase()} successfully`);
    } catch (error) { next(error); }
  };

  public getProperties = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const result = await this.service.getProperties(page, limit);
      ApiResponse.success(res, result.properties, 'Properties retrieved', 200, { total: result.total, page, limit });
    } catch (error) { next(error); }
  };

  public verifyProperty = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as any;
      const { status, notes } = req.body;
      const result = await this.service.verifyProperty(id, status, notes);
      ApiResponse.success(res, result, `Property ${status.toLowerCase()} successfully`);
    } catch (error) { next(error); }
  };

  public getBookings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const result = await this.service.getBookings(page, limit);
      ApiResponse.success(res, result.bookings, 'Bookings retrieved', 200, { total: result.total, page, limit });
    } catch (error) { next(error); }
  };

  public getComplaints = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const result = await this.service.getComplaints(page, limit);
      ApiResponse.success(res, result.complaints, 'Complaints retrieved', 200, { total: result.total, page, limit });
    } catch (error) { next(error); }
  };

  public getManagers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const managers = await this.service.getManagers();
      ApiResponse.success(res, managers, 'Managers retrieved');
    } catch (error) { next(error); }
  };

  public getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const result = await this.service.getUsers(page, limit);
      ApiResponse.success(res, result.users, 'Users retrieved', 200, { total: result.total, page, limit });
    } catch (error) { next(error); }
  };

  public getPayments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const result = await this.service.getPayments(page, limit);
      ApiResponse.success(res, result.payments, 'Payments retrieved', 200, { total: result.total, page, limit });
    } catch (error) { next(error); }
  };
}

export default AdminController;
