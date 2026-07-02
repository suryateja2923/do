import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { AuthRepository } from './auth.repository';
import { RegisterOwnerDto, LoginDto } from './dto/auth.dto';
import {
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '../../utils/exceptions';
import { logger } from '../../config/logger';
import { prisma } from '../../config/database';

export class AuthService {
  private repo = new AuthRepository();

  /**
   * Register a new user/tenant account atomically
   */
  async registerUser(dto: any) {
    const existingEmail = await this.repo.findByEmail(dto.email);
    if (existingEmail) {
      throw new ConflictException('An account with this email already exists');
    }

    const existingPhone = await this.repo.findByPhone(dto.phone);
    if (existingPhone) {
      throw new ConflictException('An account with this mobile number already exists');
    }

    const password_hash = await bcrypt.hash(dto.password, env.BCRYPT_ROUNDS);

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
  async registerOwner(dto: RegisterOwnerDto) {
    const existing = await this.repo.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const rawPassword = dto.password || 'password123';
    const password_hash = await bcrypt.hash(rawPassword, env.BCRYPT_ROUNDS);

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
  async login(dto: LoginDto) {
    const user = await this.repo.findByEmail(dto.email);

    if (!user) {
      throw new NotFoundException(
        'No account found with this email. Please register first.'
      );
    }

    if (!user.password_hash) {
      throw new UnauthorizedException('Account requires password reset');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
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
  async getMe(userId: string) {
    const user = await this.repo.findById(userId);
    if (!user) throw new NotFoundException('User not found');
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
  private signToken(userId: string, role: string, email: string): string {
    return jwt.sign(
      { sub: userId, role, email },
      env.JWT_SECRET,
      { expiresIn: '24h' }
    );
  }

  private static otpCache = new Map<string, { otp: string; expires: Date }>();

  async forgotPassword(email: string) {
    const user = await this.repo.findByEmail(email);
    if (!user) {
      throw new NotFoundException('No user account found with this email');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    AuthService.otpCache.set(email, {
      otp,
      expires: new Date(Date.now() + 15 * 60 * 1000), // 15 mins validity
    });

    logger.info(`🔑 OTP for ${email}: ${otp}`);

    return { sent: true };
  }

  async resetPassword(email: string, otp: string, new_password: string) {
    const cached = AuthService.otpCache.get(email);
    if (!cached) {
      throw new BadRequestException('Verification code has expired or was not requested');
    }

    if (cached.otp !== otp) {
      throw new BadRequestException('Invalid verification code');
    }

    if (cached.expires < new Date()) {
      AuthService.otpCache.delete(email);
      throw new BadRequestException('Verification code has expired');
    }

    const user = await this.repo.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const password_hash = await bcrypt.hash(new_password, env.BCRYPT_ROUNDS);

    await prisma.$transaction(async (tx) => {
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
          new_values: { details: 'Password reset completed via OTP' } as any,
        },
      });
    });

    AuthService.otpCache.delete(email);

    return { success: true };
  }
}

export default AuthService;
