import { Response } from 'express';
import { RequestContext } from '../shared/context/requestContext';

export interface MetaPayload {
  page?: number;
  limit?: number;
  total?: number;
  [key: string]: any;
}

export class ApiResponse {
  private static getBaseMeta() {
    const context = RequestContext.current();

    return {
      timestamp: new Date().toISOString(),
      requestId: context?.requestId || null,
      correlationId: context?.correlationId || null,
    };
  }

  /**
   * Send a standardized success JSON response
   */
  public static success<T>(
    res: Response,
    data: T,
    message: string = 'Operation completed successfully',
    status: number = 200,
    meta?: MetaPayload
  ): Response {
    return res.status(status).json({
      success: true,
      message,
      data,
      ...(meta && { meta }),
      ...this.getBaseMeta(),
    });
  }

  /**
   * Send a standardized error JSON response
   */
  public static error(
    res: Response,
    message: string = 'An error occurred',
    status: number = 500,
    errors: any[] | null = null
  ): Response {
    return res.status(status).json({
      success: false,
      message,
      ...(errors && { errors }),
      ...this.getBaseMeta(),
    });
  }
}
export default ApiResponse;
