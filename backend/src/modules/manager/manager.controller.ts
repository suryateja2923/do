import { Request, Response, NextFunction } from 'express';
import { ManagerService } from './manager.service';
import { ApiResponse } from '../../utils/response.formatter';

export class ManagerController {
  private service = new ManagerService();

  public getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await this.service.getDashboardStats();
      ApiResponse.success(res, stats, 'Dashboard stats retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  public getOwners = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const owners = await this.service.getOwners();
      ApiResponse.success(res, owners, 'Owners retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  public verifyOwner = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params as any;
      const { status, notes } = req.body;
      const result = await this.service.verifyOwner(id, status, notes);
      ApiResponse.success(res, result, 'Owner status updated successfully');
    } catch (error) {
      next(error);
    }
  };

  public suspendOwner = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params as any;
      const { notes } = req.body;
      const result = await this.service.suspendOwner(id, notes);
      ApiResponse.success(res, result, 'Owner suspended successfully');
    } catch (error) {
      next(error);
    }
  };

  public getVerificationHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params as any;
      const history = await this.service.getVerificationHistory(id);
      ApiResponse.success(res, history, 'Verification history retrieved');
    } catch (error) {
      next(error);
    }
  };

  public getProperties = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const properties = await this.service.getProperties();
      ApiResponse.success(res, properties, 'Properties retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  public verifyProperty = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params as any;
      const { status, notes } = req.body;
      const result = await this.service.verifyProperty(id, status, notes);
      ApiResponse.success(res, result, 'Property status updated successfully');
    } catch (error) {
      next(error);
    }
  };

  public getBookings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const bookings = await this.service.getBookings();
      ApiResponse.success(res, bookings, 'Bookings retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  public verifyBooking = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params as any;
      const { status } = req.body;
      const result = await this.service.verifyBooking(id, status);
      ApiResponse.success(res, result, 'Booking status updated successfully');
    } catch (error) {
      next(error);
    }
  };

  public getComplaints = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const complaints = await this.service.getComplaints();
      ApiResponse.success(res, complaints, 'Complaints retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  public updateComplaintStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params as any;
      const { status, notes } = req.body;
      const result = await this.service.updateComplaintStatus(id, status, notes);
      ApiResponse.success(res, result, 'Complaint status updated successfully');
    } catch (error) {
      next(error);
    }
  };

  public getReports = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { category } = req.query;
      const reports = await this.service.getReports(String(category || ''));
      ApiResponse.success(res, reports, 'Reports retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  public searchAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { q } = req.query;
      const results = await this.service.searchAll(String(q || ''));
      ApiResponse.success(res, results, 'Search results compiled successfully');
    } catch (error) {
      next(error);
    }
  };

  // Stubs for non-implemented operational routes to prevent crashes
  public requestOwnerDocuments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params as any;
      const { documentTypes, notes } = req.body;
      const result = await this.service.requestOwnerDocuments(id, documentTypes, notes);
      ApiResponse.success(res, result, 'Document request sent successfully');
    } catch (error) {
      next(error);
    }
  };
  public requestPropertyCorrections = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params as any;
      const { corrections, notes } = req.body;
      const result = await this.service.requestPropertyCorrections(id, corrections || [], notes || '');
      ApiResponse.success(res, result, 'Corrections requested');
    } catch (error) {
      next(error);
    }
  };
  public suspendProperty = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params as any;
      const { notes } = req.body;
      const result = await this.service.suspendProperty(id, notes || '');
      ApiResponse.success(res, result, 'Property suspended');
    } catch (error) {
      next(error);
    }
  };
  public assignComplaint = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params as any;
      const { staffName } = req.body;
      const result = await this.service.assignComplaint(id, staffName);
      ApiResponse.success(res, result, 'Complaint assigned');
    } catch (error) {
      next(error);
    }
  };
  public getTasks = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.getTasks();
      ApiResponse.success(res, result, 'Tasks retrieved');
    } catch (error) {
      next(error);
    }
  };
  public updateTaskStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params as any;
      const { status, clarificationNotes } = req.body;
      const result = await this.service.updateTaskStatus(id, status, clarificationNotes);
      ApiResponse.success(res, result, 'Task status updated');
    } catch (error) {
      next(error);
    }
  };
  public sendNotification = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, title, content, type } = req.body;
      const result = await this.service.sendNotification(userId, title, content, type);
      ApiResponse.success(res, result, 'Notification sent');
    } catch (error) {
      next(error);
    }
  };
  public broadcastAnnouncement = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { title, content } = req.body;
      const result = await this.service.broadcastAnnouncement(title, content);
      ApiResponse.success(res, result, 'Announcement broadcasted');
    } catch (error) {
      next(error);
    }
  };
}
