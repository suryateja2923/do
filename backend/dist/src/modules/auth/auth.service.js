"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../../config/env");
const auth_repository_1 = require("./auth.repository");
const exceptions_1 = require("../../utils/exceptions");
const logger_1 = require("../../config/logger");
const database_1 = require("../../config/database");
class AuthService {
    repo = new auth_repository_1.AuthRepository();
    /**
     * Register a new user/tenant account atomically
     */
    async registerUser(dto) {
        const existingEmail = await this.repo.findByEmail(dto.email);
        if (existingEmail) {
            throw new exceptions_1.ConflictException('An account with this email already exists');
        }
        const existingPhone = await this.repo.findByPhone(dto.phone);
        if (existingPhone) {
            throw new exceptions_1.ConflictException('An account with this mobile number already exists');
        }
        const password_hash = await bcryptjs_1.default.hash(dto.password, env_1.env.BCRYPT_ROUNDS);
        const { user, tenantProfile } = await this.repo.createTenantUser({
            first_name: dto.first_name,
            last_name: dto.last_name || '',
            email: dto.email,
            phone: dto.phone,
            password_hash,
        });
        const token = this.signToken(user.id, user.role, user.email);
        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                phone: user.phone,
                role: user.role,
                created_at: user.created_at,
            },
            tenantProfile: {
                id: tenantProfile.id,
                user_id: tenantProfile.user_id,
            },
        };
    }
    /**
     * Register a new owner account atomically
     */
    async registerOwner(dto) {
        const existing = await this.repo.findByEmail(dto.email);
        if (existing) {
            throw new exceptions_1.ConflictException('An account with this email already exists');
        }
        const rawPassword = dto.password || 'password123';
        const password_hash = await bcryptjs_1.default.hash(rawPassword, env_1.env.BCRYPT_ROUNDS);
        let first_name = dto.first_name || '';
        let last_name = dto.last_name || '';
        if (dto.fullName && !first_name) {
            const parts = dto.fullName.trim().split(/\s+/);
            first_name = parts[0] || 'Owner';
            last_name = parts.slice(1).join(' ') || 'User';
        }
        const phone = dto.phone || dto.mobile || '';
        const business_name = dto.business_name || dto.businessName || '';
        const { user, ownerProfile } = await this.repo.createOwner({
            first_name,
            last_name,
            email: dto.email,
            phone,
            password_hash,
            business_name,
            gst_number: dto.gst_number,
            pan_number: dto.pan_number,
            documents: dto.documents,
        });
        const token = this.signToken(user.id, user.role, user.email);
        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                phone: user.phone,
                role: user.role,
                created_at: user.created_at,
            },
            ownerProfile: {
                id: ownerProfile.id,
                verification_status: ownerProfile.verification_status,
                business_name: ownerProfile.business_name,
            },
        };
    }
    /**
     * Login and return JWT token
     */
    async login(dto) {
        const user = await this.repo.findByEmail(dto.email);
        if (!user) {
            throw new exceptions_1.NotFoundException('No account found with this email. Please register first.');
        }
        if (!user.password_hash) {
            throw new exceptions_1.UnauthorizedException('Account requires password reset');
        }
        const isPasswordValid = await bcryptjs_1.default.compare(dto.password, user.password_hash);
        if (!isPasswordValid) {
            throw new exceptions_1.UnauthorizedException('Invalid email or password');
        }
        const token = this.signToken(user.id, user.role, user.email);
        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                phone: user.phone,
                role: user.role,
                created_at: user.created_at,
            },
            ownerProfile: user.owner_profile
                ? {
                    id: user.owner_profile.id,
                    user_id: user.owner_profile.user_id,
                    business_name: user.owner_profile.business_name || '',
                    verification_status: user.owner_profile.verification_status,
                    kyc_status: user.owner_profile.verification_status === 'VERIFIED' ? 'APPROVED' : user.owner_profile.verification_status,
                    created_at: user.owner_profile.created_at.toISOString(),
                    documents: {
                        rejection_reason: user.owner_profile.rejection_reason || undefined,
                    },
                }
                : null,
            managerProfile: user.manager_profile
                ? {
                    id: user.manager_profile.id,
                    user_id: user.manager_profile.user_id,
                }
                : null,
            tenantProfile: user.tenant_profile
                ? {
                    id: user.tenant_profile.id,
                    user_id: user.tenant_profile.user_id,
                }
                : null,
        };
    }
    /**
     * Return current user details from DB
     */
    async getMe(userId) {
        const user = await this.repo.findById(userId);
        if (!user)
            throw new exceptions_1.NotFoundException('User not found');
        return {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            phone: user.phone,
            role: user.role,
            created_at: user.created_at,
            owner_profile: user.owner_profile
                ? {
                    id: user.owner_profile.id,
                    verification_status: user.owner_profile.verification_status,
                    business_name: user.owner_profile.business_name,
                    gst_number: user.owner_profile.gst_number,
                }
                : null,
            manager_profile: user.manager_profile
                ? { id: user.manager_profile.id }
                : null,
            tenant_profile: user.tenant_profile
                ? {
                    id: user.tenant_profile.id,
                    emergency_contact_name: user.tenant_profile.emergency_contact_name,
                    emergency_contact_phone: user.tenant_profile.emergency_contact_phone,
                    permanent_address: user.tenant_profile.permanent_address,
                }
                : null,
        };
    }
    /**
     * Sign JWT with payload { sub, role, email }
     */
    signToken(userId, role, email) {
        return jsonwebtoken_1.default.sign({ sub: userId, role, email }, env_1.env.JWT_SECRET, { expiresIn: '24h' });
    }
    static otpCache = new Map();
    async forgotPassword(email) {
        const user = await this.repo.findByEmail(email);
        if (!user) {
            throw new exceptions_1.NotFoundException('No user account found with this email');
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        AuthService.otpCache.set(email, {
            otp,
            expires: new Date(Date.now() + 15 * 60 * 1000), // 15 mins validity
        });
        logger_1.logger.info(`🔑 OTP for ${email}: ${otp}`);
        return { sent: true };
    }
    async resetPassword(email, otp, new_password) {
        const cached = AuthService.otpCache.get(email);
        if (!cached) {
            throw new exceptions_1.BadRequestException('Verification code has expired or was not requested');
        }
        if (cached.otp !== otp) {
            throw new exceptions_1.BadRequestException('Invalid verification code');
        }
        if (cached.expires < new Date()) {
            AuthService.otpCache.delete(email);
            throw new exceptions_1.BadRequestException('Verification code has expired');
        }
        const user = await this.repo.findByEmail(email);
        if (!user) {
            throw new exceptions_1.NotFoundException('User not found');
        }
        const password_hash = await bcryptjs_1.default.hash(new_password, env_1.env.BCRYPT_ROUNDS);
        await database_1.prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: user.id },
                data: { password_hash },
            });
            await tx.auditLog.create({
                data: {
                    action: 'PASSWORD_RESET',
                    entity_name: 'User',
                    entity_id: user.id,
                    user_id: user.id,
                    new_values: { details: 'Password reset completed via OTP' },
                },
            });
        });
        AuthService.otpCache.delete(email);
        return { success: true };
    }
}
exports.AuthService = AuthService;
exports.default = AuthService;
