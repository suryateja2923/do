import { Request, Response, NextFunction } from 'express';
import { UserService } from './user.service';
import { ApiResponse } from '../../utils/response.formatter';
import { RequestContext } from '../../shared/context/requestContext';

export class UserController {
  private service = new UserService();

  private getTenantId(): string {
    const user = RequestContext.getUser();
    if (!user || !user.profileId) {
      throw new Error('Tenant profile not found or user is not logged in');
    }
    return user.profileId;
  }

  private getUserId(): string {
    const user = RequestContext.getUser();
    if (!user) {
      throw new Error('User not logged in');
    }
    return user.id;
  }

  public getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.getUserId();
      const profile = await this.service.getProfile(userId);
      ApiResponse.success(res, profile, 'User profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  public updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.getUserId();
      const user = await this.service.updateProfile(userId, req.body);
      ApiResponse.success(res, user, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  };

  public searchProperties = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const properties = await this.service.searchProperties(req.query);
      ApiResponse.success(res, properties, 'Properties retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  public getPropertyDetail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as any;
      const property = await this.service.getPropertyDetail(id);
      if (!property) {
        res.status(404).json({ success: false, message: 'Property not found' });
        return;
      }
      ApiResponse.success(res, property, 'Property detail retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  public getFavorites = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = this.getTenantId();
      const favorites = await this.service.getFavorites(tenantId);
      ApiResponse.success(res, favorites, 'Favorites retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  public addFavorite = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = this.getTenantId();
      const { id } = req.params as any;
      const result = await this.service.addFavorite(tenantId, id);
      ApiResponse.success(res, result, 'Added to favorites');
    } catch (error) {
      next(error);
    }
  };

  public removeFavorite = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = this.getTenantId();
      const { id } = req.params as any;
      const result = await this.service.removeFavorite(tenantId, id);
      ApiResponse.success(res, result, 'Removed from favorites');
    } catch (error) {
      next(error);
    }
  };

  public getBookings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = this.getTenantId();
      const bookings = await this.service.getBookings(tenantId);
      ApiResponse.success(res, bookings, 'Bookings retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  public createBooking = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = this.getTenantId();
      const userId = this.getUserId();
      const { bedId, expectedMoveIn } = req.body;
      const booking = await this.service.createBooking(tenantId, userId, bedId, new Date(expectedMoveIn));
      ApiResponse.success(res, booking, 'Booking created successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  public cancelBooking = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = this.getTenantId();
      const { id } = req.params as any;
      const result = await this.service.cancelBooking(tenantId, id);
      ApiResponse.success(res, result, 'Booking cancelled successfully');
    } catch (error) {
      next(error);
    }
  };

  public getComplaints = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = this.getTenantId();
      const complaints = await this.service.getComplaints(tenantId);
      ApiResponse.success(res, complaints, 'Complaints retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  public createComplaint = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = this.getTenantId();
      const complaint = await this.service.createComplaint(tenantId, req.body);
      ApiResponse.success(res, complaint, 'Complaint registered successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  public getNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.getUserId();
      const notifications = await this.service.getNotifications(userId);
      ApiResponse.success(res, notifications, 'Notifications retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  public markNotificationAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.getUserId();
      const { id } = req.params as any;
      const result = await this.service.markNotificationAsRead(userId, id);
      ApiResponse.success(res, result, 'Notification marked as read');
    } catch (error) {
      next(error);
    }
  };

  public createReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = this.getTenantId();
      const review = await this.service.createReview(tenantId, req.body);
      ApiResponse.success(res, review, 'Review submitted successfully', 201);
    } catch (error) {
      next(error);
    }
  };
}
