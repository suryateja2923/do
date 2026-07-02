import { prisma } from '../../config/database';
import { UserRole, VerificationStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

export class AuthRepository {
  /**
   * Find user by email (including password hash)
   */
  async findByEmail(email: string) {
    return prisma.user.findFirst({
      where: { email, is_deleted: false },
      include: {
        owner_profile: true,
        manager_profile: true,
        tenant_profile: true,
      },
    });
  }

  /**
   * Find user by ID
   */
  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id, is_deleted: false },
      include: {
        owner_profile: true,
        manager_profile: true,
        tenant_profile: true,
      },
    });
  }

  /**
   * Find user by phone
   */
  async findByPhone(phone: string) {
    return prisma.user.findFirst({
      where: { phone, is_deleted: false },
    });
  }

  /**
   * Create User + TenantProfile atomically
   */
  async createTenantUser(data: {
    first_name: string;
    last_name?: string;
    email: string;
    phone: string;
    password_hash: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const userId = uuidv4();

      const user = await tx.user.create({
        data: {
          id: userId,
          email: data.email,
          phone: data.phone,
          first_name: data.first_name,
          last_name: data.last_name || '',
          role: UserRole.USER,
          password_hash: data.password_hash,
        },
      });

      const tenantProfile = await tx.tenantProfile.create({
        data: {
          user_id: userId,
        },
      });

      return { user, tenantProfile };
    });
  }

  /**
   * Create User + OwnerProfile atomically
   */
  async createOwner(data: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    password_hash: string;
    business_name?: string;
    gst_number?: string;
    pan_number?: string;
    documents?: {
      id_url?: string;
      pan_url?: string;
      property_proof_url?: string;
      profile_photo_url?: string;
    };
  }) {
    return prisma.$transaction(async (tx) => {
      const userId = uuidv4();

      const user = await tx.user.create({
        data: {
          id: userId,
          email: data.email,
          phone: data.phone,
          first_name: data.first_name,
          last_name: data.last_name,
          role: UserRole.OWNER,
          password_hash: data.password_hash,
        },
      });

      const ownerProfile = await tx.ownerProfile.create({
        data: {
          user_id: userId,
          business_name: data.business_name,
          gst_number: data.gst_number,
          pan_number: data.pan_number,
        },
      });

      // Save documents if provided
      if (data.documents) {
        if (data.documents.id_url) {
          await tx.ownerDocument.create({
            data: {
              id: uuidv4(),
              owner_profile_id: ownerProfile.id,
              type: 'AADHAR_CARD',
              url: data.documents.id_url,
              path: data.documents.id_url,
              status: VerificationStatus.PENDING,
            },
          });
        }
        if (data.documents.pan_url) {
          await tx.ownerDocument.create({
            data: {
              id: uuidv4(),
              owner_profile_id: ownerProfile.id,
              type: 'PAN_CARD',
              url: data.documents.pan_url,
              path: data.documents.pan_url,
              status: VerificationStatus.PENDING,
            },
          });
        }
        if (data.documents.property_proof_url) {
          await tx.ownerDocument.create({
            data: {
              id: uuidv4(),
              owner_profile_id: ownerProfile.id,
              type: 'BUSINESS_LICENSE',
              url: data.documents.property_proof_url,
              path: data.documents.property_proof_url,
              status: VerificationStatus.PENDING,
            },
          });
        }
        if (data.documents.profile_photo_url) {
          await tx.profileImage.create({
            data: {
              id: uuidv4(),
              user_id: userId,
              url: data.documents.profile_photo_url,
              path: data.documents.profile_photo_url,
            },
          });
        }
      }

      return { user, ownerProfile };
    });
  }
}

export default AuthRepository;
