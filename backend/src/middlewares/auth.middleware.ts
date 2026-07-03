import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';

import { env } from '../config/env';
import { prisma } from '../config/database';
import { logger } from '../config/logger';
import { RequestContext } from '../shared/context/requestContext';
import { UnauthorizedException, ForbiddenException } from '../utils/exceptions';

/**
 * Verifies standard HMAC-SHA256 signed JWT tokens offline (legacy Supabase path)
 */
function verifyHMAC(token: string, secret: string): any {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, payload, signature] = parts;
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(`${header}.${payload}`);
  const computedSignature = hmac.digest('base64url');
  if (signature !== computedSignature) return null;
  try {
    const decodedPayload = Buffer.from(payload, 'base64url').toString('utf8');
    return JSON.parse(decodedPayload);
  } catch {
    return null;
  }
}

/**
 * Verify a standard JWT (HS256) using JWT_SECRET — used by our custom auth module
 */
function verifyStandardJWT(token: string): any {
  try {
    return jwt.verify(token, env.JWT_SECRET) as any;
  } catch {
    return null;
  }
}

/**
 * Resolve a bearer token to its decoded payload, trying our own JWT signer first
 * then falling back to the legacy Supabase HMAC path. Shared by the HTTP auth
 * middleware and the WebSocket handshake so both accept the same tokens.
 */
export function resolveAuthToken(token: string): any | null {
  return verifyStandardJWT(token) || verifyHMAC(token, env.SUPABASE_JWT_SECRET);
}

/**
 * Authentication Middleware: Validates JWT and binds User Context
 */
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authentication token required');
    }

    const token = authHeader.split(' ')[1];

    // Try standard JWT first (our auth module), then HMAC fallback (Supabase)
    let payload = resolveAuthToken(token);

    if (!payload || !payload.sub) {
      throw new UnauthorizedException('Invalid or expired authentication token');
    }

    const userId = payload.sub;

    const userRecord = await prisma.user.findUnique({
      where: { id: userId, is_deleted: false },
      include: {
        owner_profile: { select: { id: true } },
        manager_profile: { select: { id: true } },
        tenant_profile: { select: { id: true } },
      },
    });

    if (!userRecord) {
      throw new UnauthorizedException('User account not found or deactivated');
    }

    let profileId: string | null = null;
    if (userRecord.role === UserRole.OWNER) {
      profileId = userRecord.owner_profile?.id || null;
    } else if (userRecord.role === UserRole.MANAGER) {
      profileId = userRecord.manager_profile?.id || null;
    } else if (userRecord.role === UserRole.USER) {
      profileId = userRecord.tenant_profile?.id || null;
    }

    const userContext = {
      id: userRecord.id,
      email: userRecord.email,
      role: userRecord.role,
      profileId,
    };

    if (req.requestContext) {
      req.requestContext.user = userContext;
    }
    const currentContext = RequestContext.current();
    if (currentContext) {
      currentContext.user = userContext;
    }

    next();
  } catch (error) {
    next(error);
  }
};



/**
 * Role Guards Middleware
 */
export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const user = RequestContext.getUser();
      if (!user) {
        throw new UnauthorizedException();
      }

      if (!allowedRoles.includes(user.role)) {
        logger.warn(`Unauthorized role access attempt: User ${user.id} with role ${user.role} tried to access role paths: ${allowedRoles}`);
        throw new ForbiddenException('Access denied: insufficient privileges');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Granular Permission Guards Placeholder (Phase 5)
 */
export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Standard RBAC maps roles to dynamic lists. Admins pass everything.
    const user = RequestContext.getUser();
    if (!user) {
      throw new UnauthorizedException();
    }

    if (user.role === UserRole.ADMIN) {
      return next();
    }

    // Standard stub for modular permission check:
    next();
  };
};
