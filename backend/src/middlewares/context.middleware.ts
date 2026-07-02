import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { requestContextStorage } from '../shared/context/requestContext';
import { RequestContextData } from '../types';

export const contextMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const requestId = (req.headers['x-request-id'] as string) || randomUUID();
  const correlationId = (req.headers['x-correlation-id'] as string) || requestId;

  // Set response headers for client tracking
  res.setHeader('x-request-id', requestId);
  res.setHeader('x-correlation-id', correlationId);

  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '';
  const userAgent = req.headers['user-agent'] || '';

  const contextData: RequestContextData = {
    requestId,
    correlationId,
    timestamp: new Date(),
    ip,
    userAgent,
    user: null, // populated by auth middleware
  };

  // Mount on request object for backward compatibility
  req.requestContext = contextData;

  // Execute request handlers within the AsyncLocalStorage run scope
  requestContextStorage.run(contextData, () => {
    next();
  });
};

export default contextMiddleware;
