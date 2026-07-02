import { UserRole } from '@prisma/client';

export interface UserContext {
  id: string;
  email: string;
  role: UserRole;
  profileId: string | null;
}

export interface RequestContextData {
  requestId: string;
  correlationId: string;
  timestamp: Date;
  ip: string;
  userAgent: string;
  user: UserContext | null;
}

declare global {
  namespace Express {
    interface Request {
      requestContext?: RequestContextData;
    }
  }
}
export {};
