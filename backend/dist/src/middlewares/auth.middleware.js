"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requirePermission = exports.requireRole = exports.requireAuth = void 0;
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const env_1 = require("../config/env");
const database_1 = require("../config/database");
const logger_1 = require("../config/logger");
const requestContext_1 = require("../shared/context/requestContext");
const exceptions_1 = require("../utils/exceptions");
/**
 * Verifies standard HMAC-SHA256 signed JWT tokens offline (legacy Supabase path)
 */
function verifyHMAC(token, secret) {
    const parts = token.split('.');
    if (parts.length !== 3)
        return null;
    const [header, payload, signature] = parts;
    const hmac = crypto_1.default.createHmac('sha256', secret);
    hmac.update(`${header}.${payload}`);
    const computedSignature = hmac.digest('base64url');
    if (signature !== computedSignature)
        return null;
    try {
        const decodedPayload = Buffer.from(payload, 'base64url').toString('utf8');
        return JSON.parse(decodedPayload);
    }
    catch {
        return null;
    }
}
/**
 * Verify a standard JWT (HS256) using JWT_SECRET — used by our custom auth module
 */
function verifyStandardJWT(token) {
    try {
        return jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
    }
    catch {
        return null;
    }
}
/**
 * Authentication Middleware: Validates JWT and binds User Context
 */
const requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new exceptions_1.UnauthorizedException('Authentication token required');
        }
        const token = authHeader.split(' ')[1];
        // Try standard JWT first (our auth module), then HMAC fallback (Supabase)
        let payload = verifyStandardJWT(token) || verifyHMAC(token, env_1.env.SUPABASE_JWT_SECRET);
        if (!payload || !payload.sub) {
            throw new exceptions_1.UnauthorizedException('Invalid or expired authentication token');
        }
        const userId = payload.sub;
        const userRecord = await database_1.prisma.user.findUnique({
            where: { id: userId, is_deleted: false },
            include: {
                owner_profile: { select: { id: true } },
                manager_profile: { select: { id: true } },
                tenant_profile: { select: { id: true } },
            },
        });
        if (!userRecord) {
            throw new exceptions_1.UnauthorizedException('User account not found or deactivated');
        }
        let profileId = null;
        if (userRecord.role === client_1.UserRole.OWNER) {
            profileId = userRecord.owner_profile?.id || null;
        }
        else if (userRecord.role === client_1.UserRole.MANAGER) {
            profileId = userRecord.manager_profile?.id || null;
        }
        else if (userRecord.role === client_1.UserRole.USER) {
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
        const currentContext = requestContext_1.RequestContext.current();
        if (currentContext) {
            currentContext.user = userContext;
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.requireAuth = requireAuth;
/**
 * Role Guards Middleware
 */
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        try {
            const user = requestContext_1.RequestContext.getUser();
            if (!user) {
                throw new exceptions_1.UnauthorizedException();
            }
            if (!allowedRoles.includes(user.role)) {
                logger_1.logger.warn(`Unauthorized role access attempt: User ${user.id} with role ${user.role} tried to access role paths: ${allowedRoles}`);
                throw new exceptions_1.ForbiddenException('Access denied: insufficient privileges');
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.requireRole = requireRole;
/**
 * Granular Permission Guards Placeholder (Phase 5)
 */
const requirePermission = (permission) => {
    return (req, res, next) => {
        // Standard RBAC maps roles to dynamic lists. Admins pass everything.
        const user = requestContext_1.RequestContext.getUser();
        if (!user) {
            throw new exceptions_1.UnauthorizedException();
        }
        if (user.role === client_1.UserRole.ADMIN) {
            return next();
        }
        // Standard stub for modular permission check:
        next();
    };
};
exports.requirePermission = requirePermission;
