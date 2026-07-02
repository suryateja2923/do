import { Request, Response, NextFunction } from 'express';
import { OwnerService } from './owner.service';
import { ApiResponse } from '../../utils/response.formatter';
import { RequestContext } from '../../shared/context/requestContext';

export class OwnerController {
  private service = new OwnerService();

  private getOwnerProfileId = (req: Request): string => {
    const user = RequestContext.getUser();
    if (!user || !user.profileId) {
      throw new Error('Owner context not found or user is not an owner.');
    }
    return user.profileId;
  };

  private getUserId = (): string => {
    const user = RequestContext.getUser();
    if (!user) {
      throw new Error('Authenticated user context not found.');
    }
    return user.id;
  };

  public getApplicationStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerProfileId = this.getOwnerProfileId(req);
      const status = await this.service.getApplicationStatus(ownerProfileId);
      ApiResponse.success(res, status, 'Application status retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  public resubmitDocuments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerProfileId = this.getOwnerProfileId(req);
      const result = await this.service.resubmitDocuments(ownerProfileId, req.body);
      ApiResponse.success(res, result, 'Documents resubmitted successfully');
    } catch (error) {
      next(error);
    }
  };

  public getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerProfileId = this.getOwnerProfileId(req);
      const profile = await this.service.getProfile(ownerProfileId);
      ApiResponse.success(res, profile, 'Profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  public getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerProfileId = this.getOwnerProfileId(req);
      const { propertyId } = req.query as { propertyId?: string };
      const stats = await this.service.getDashboardStats(ownerProfileId, propertyId);
      ApiResponse.success(res, stats, 'Dashboard stats retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  public getProperties = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerProfileId = this.getOwnerProfileId(req);
      const properties = await this.service.getProperties(ownerProfileId);
      ApiResponse.success(res, properties, 'Properties retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  public createProperty = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerProfileId = this.getOwnerProfileId(req);
      const result = await this.service.createProperty(ownerProfileId, req.body);
      ApiResponse.success(res, result, 'Property created successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  public getPropertyDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerProfileId = this.getOwnerProfileId(req);
      const { id } = req.params as any;
      const property = await this.service.getPropertyDetail(ownerProfileId, id);
      ApiResponse.success(res, property, 'Property details retrieved');
    } catch (error) {
      next(error);
    }
  };

  public updateProperty = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerProfileId = this.getOwnerProfileId(req);
      const { id } = req.params as any;
      const result = await this.service.updateProperty(ownerProfileId, id, req.body);
      ApiResponse.success(res, result, 'Property updated successfully');
    } catch (error) {
      next(error);
    }
  };

  public deactivateProperty = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerProfileId = this.getOwnerProfileId(req);
      const { id } = req.params as any;
      const result = await this.service.deactivateProperty(ownerProfileId, id);
      ApiResponse.success(res, result, 'Property deactivated successfully');
    } catch (error) {
      next(error);
    }
  };

  public getBookings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerProfileId = this.getOwnerProfileId(req);
      const bookings = await this.service.getBookings(ownerProfileId);
      ApiResponse.success(res, bookings, 'Bookings retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  public verifyBooking = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerProfileId = this.getOwnerProfileId(req);
      const { id } = req.params as any;
      const result = await this.service.verifyBooking(ownerProfileId, id, req.body);
      ApiResponse.success(res, result, 'Booking verified successfully');
    } catch (error) {
      next(error);
    }
  };

  public getComplaints = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerProfileId = this.getOwnerProfileId(req);
      const complaints = await this.service.getComplaints(ownerProfileId);
      ApiResponse.success(res, complaints, 'Complaints retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  public getTenants = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerProfileId = this.getOwnerProfileId(req);
      const tenants = await this.service.getTenants(ownerProfileId);
      ApiResponse.success(res, tenants, 'Tenants retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  // Stubs for extra routes to prevent crashes
  public uploadPropertyImages = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerProfileId = this.getOwnerProfileId(req);
      const { id } = req.params as any;
      const { imageUrl } = req.body;
      const result = await this.service.uploadPropertyImage(ownerProfileId, id, imageUrl);
      ApiResponse.success(res, result, 'Image uploaded successfully');
    } catch (error) {
      next(error);
    }
  };
  public deletePropertyImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerProfileId = this.getOwnerProfileId(req);
      const { id, imageId } = req.params as any;
      const result = await this.service.deletePropertyImage(ownerProfileId, id, imageId);
      ApiResponse.success(res, result, 'Image deleted');
    } catch (error) {
      next(error);
    }
  };
  public listFloors = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerProfileId = this.getOwnerProfileId(req);
      const propertyId = req.params.propertyId as string;
      const result = await this.service.listFloors(ownerProfileId, propertyId);
      ApiResponse.success(res, result, 'Floors retrieved');
    } catch (error) {
      next(error);
    }
  };

  public createFloor = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerProfileId = this.getOwnerProfileId(req);
      const propertyId = req.params.propertyId as string;
      const { name } = req.body;
      const result = await this.service.createFloor(ownerProfileId, propertyId, name);
      ApiResponse.success(res, result, 'Floor created');
    } catch (error) {
      next(error);
    }
  };

  public updateFloor = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerProfileId = this.getOwnerProfileId(req);
      const propertyId = req.params.propertyId as string;
      const floorId = req.params.floorId as string;
      const { name } = req.body;
      const result = await this.service.updateFloor(ownerProfileId, propertyId, floorId, name);
      ApiResponse.success(res, result, 'Floor updated');
    } catch (error) {
      next(error);
    }
  };

  public deleteFloor = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerProfileId = this.getOwnerProfileId(req);
      const propertyId = req.params.propertyId as string;
      const floorId = req.params.floorId as string;
      const result = await this.service.deleteFloor(ownerProfileId, propertyId, floorId);
      ApiResponse.success(res, result, 'Floor deleted');
    } catch (error) {
      next(error);
    }
  };

  public listRooms = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerProfileId = this.getOwnerProfileId(req);
      const floorId = req.params.floorId as string;
      const result = await this.service.listRooms(ownerProfileId, floorId);
      ApiResponse.success(res, result, 'Rooms retrieved');
    } catch (error) {
      next(error);
    }
  };

  public createRoom = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerProfileId = this.getOwnerProfileId(req);
      const floorId = req.params.floorId as string;
      const result = await this.service.createRoom(ownerProfileId, floorId, req.body);
      ApiResponse.success(res, result, 'Room created');
    } catch (error) {
      next(error);
    }
  };

  public updateRoom = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerProfileId = this.getOwnerProfileId(req);
      const roomId = req.params.roomId as string;
      const result = await this.service.updateRoom(ownerProfileId, roomId, req.body);
      ApiResponse.success(res, result, 'Room updated');
    } catch (error) {
      next(error);
    }
  };

  public deleteRoom = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerProfileId = this.getOwnerProfileId(req);
      const roomId = req.params.roomId as string;
      const result = await this.service.deleteRoom(ownerProfileId, roomId);
      ApiResponse.success(res, result, 'Room deleted');
    } catch (error) {
      next(error);
    }
  };

  public listBeds = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerProfileId = this.getOwnerProfileId(req);
      const roomId = req.params.roomId as string;
      const result = await this.service.listBeds(ownerProfileId, roomId);
      ApiResponse.success(res, result, 'Beds retrieved');
    } catch (error) {
      next(error);
    }
  };

  public createBed = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerProfileId = this.getOwnerProfileId(req);
      const roomId = req.params.roomId as string;
      const result = await this.service.createBed(ownerProfileId, roomId, req.body);
      ApiResponse.success(res, result, 'Bed created');
    } catch (error) {
      next(error);
    }
  };

  public updateBed = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerProfileId = this.getOwnerProfileId(req);
      const bedId = req.params.bedId as string;
      const result = await this.service.updateBed(ownerProfileId, bedId, req.body);
      ApiResponse.success(res, result, 'Bed updated');
    } catch (error) {
      next(error);
    }
  };

  public deleteBed = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerProfileId = this.getOwnerProfileId(req);
      const bedId = req.params.bedId as string;
      const result = await this.service.deleteBed(ownerProfileId, bedId);
      ApiResponse.success(res, result, 'Bed deleted');
    } catch (error) {
      next(error);
    }
  };
  public getBookingTimeline = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerProfileId = this.getOwnerProfileId(req);
      const { id } = req.params as any;
      const result = await this.service.getBookingTimeline(ownerProfileId, id);
      ApiResponse.success(res, result, 'Booking timeline retrieved');
    } catch (error) {
      next(error);
    }
  };
  public getTenantDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerProfileId = this.getOwnerProfileId(req);
      const { id } = req.params as any;
      const result = await this.service.getTenantDetail(ownerProfileId, id);
      ApiResponse.success(res, result, 'Tenant details retrieved');
    } catch (error) {
      next(error);
    }
  };
  public replyComplaint = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerProfileId = this.getOwnerProfileId(req);
      const userId = this.getUserId();
      const { id } = req.params as any;
      const { message } = req.body;
      const result = await this.service.replyComplaint(ownerProfileId, id, userId, message);
      ApiResponse.success(res, result, 'Complaint reply sent');
    } catch (error) {
      next(error);
    }
  };
  public assignComplaint = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerProfileId = this.getOwnerProfileId(req);
      const userId = this.getUserId();
      const { id } = req.params as any;
      const { staffName } = req.body;
      const result = await this.service.assignComplaint(ownerProfileId, id, userId, staffName);
      ApiResponse.success(res, result, 'Complaint assigned');
    } catch (error) {
      next(error);
    }
  };
  public updateComplaintStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerProfileId = this.getOwnerProfileId(req);
      const userId = this.getUserId();
      const { id } = req.params as any;
      const { status, notes } = req.body;
      const result = await this.service.updateComplaintStatus(ownerProfileId, id, userId, status, notes);
      ApiResponse.success(res, result, 'Complaint status updated');
    } catch (error) {
      next(error);
    }
  };
  public getNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = this.getUserId();
      const result = await this.service.getNotifications(userId);
      ApiResponse.success(res, result, 'Notifications retrieved');
    } catch (error) {
      next(error);
    }
  };
  public sendNotification = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, title, body, type } = req.body;
      const result = await this.service.sendNotification(userId, title, body, type);
      ApiResponse.success(res, result, 'Notification sent');
    } catch (error) {
      next(error);
    }
  };
  public getReports = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerProfileId = this.getOwnerProfileId(req);
      const result = await this.service.getReports(ownerProfileId);
      ApiResponse.success(res, result, 'Reports retrieved');
    } catch (error) {
      next(error);
    }
  };
  public searchAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerProfileId = this.getOwnerProfileId(req);
      const { q } = req.query;
      const result = await this.service.searchAll(ownerProfileId, String(q || ''));
      ApiResponse.success(res, result, 'Search completed');
    } catch (error) {
      next(error);
    }
  };
}
