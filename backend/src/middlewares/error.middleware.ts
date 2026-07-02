import { Request, Response, NextFunction } from 'express';
import { HttpException } from '../utils/exceptions';
import { ApiResponse } from '../utils/response.formatter';
import { logger } from '../config/logger';
import { env } from '../config/env';

export const errorMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let status = 500;
  let message = 'Internal Server Error';
  let errors: any[] | null = null;

  if (error instanceof HttpException) {
    status = error.status;
    message = error.message;
    errors = error.errors;
  } else {
    // For unhandled exceptions, log the full stack trace to winston logs
    logger.error(`[Unhandled Error] [${req.method}] ${req.path}`, error);
  }

  // Include detailed error stack messages only in development
  const responseMessage =
    env.NODE_ENV === 'development' || error instanceof HttpException
      ? message
      : 'Something went wrong on the server.';

  ApiResponse.error(res, responseMessage, status, errors);
};
export default errorMiddleware;
