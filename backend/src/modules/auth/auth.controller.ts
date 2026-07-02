import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { ApiResponse } from '../../utils/response.formatter';
import { RequestContext } from '../../shared/context/requestContext';

export class AuthController {
  private service = new AuthService();

  public registerOwner = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.registerOwner(req.body);
      ApiResponse.success(res, result, 'Owner account registered successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  public registerUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.registerUser(req.body);
      ApiResponse.success(res, result, 'User account registered successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.login(req.body);
      ApiResponse.success(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  };

  public getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = RequestContext.getUser();
      if (!user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
      const result = await this.service.getMe(user.id);
      ApiResponse.success(res, result, 'User profile retrieved');
    } catch (error) {
      next(error);
    }
  };

  public forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;
      const result = await this.service.forgotPassword(email);
      ApiResponse.success(res, result, 'OTP sent successfully');
    } catch (error) {
      next(error);
    }
  };

  public resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, otp, new_password } = req.body;
      const result = await this.service.resetPassword(email, otp, new_password);
      ApiResponse.success(res, result, 'Password reset successfully');
    } catch (error) {
      next(error);
    }
  };
}

export default AuthController;
