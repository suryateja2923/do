"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRepository = void 0;
const database_1 = require("../../config/database");
const client_1 = require("@prisma/client");
const uuid_1 = require("uuid");
class AuthRepository {
    /**
     * Find user by email (including password hash)
     */
    async findByEmail(email) {
        return database_1.prisma.user.findFirst({
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
    async findById(id) {
        return database_1.prisma.user.findUnique({
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
    async findByPhone(phone) {
        return database_1.prisma.user.findFirst({
            where: { phone, is_deleted: false },
        });
    }
    /**
     * Create User + TenantProfile atomically
     */
    async createTenantUser(data) {
        return database_1.prisma.$transaction(async (tx) => {
            const userId = (0, uuid_1.v4)();
            const user = await tx.user.create({
                data: {
                    id: userId,
                    email: data.email,
                    phone: data.phone,
                    first_name: data.first_name,
                    last_name: data.last_name || '',
                    role: client_1.UserRole.USER,
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
    async createOwner(data) {
        return database_1.prisma.$transaction(async (tx) => {
            const userId = (0, uuid_1.v4)();
            const user = await tx.user.create({
                data: {
                    id: userId,
                    email: data.email,
                    phone: data.phone,
                    first_name: data.first_name,
                    last_name: data.last_name,
                    role: client_1.UserRole.OWNER,
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
                            id: (0, uuid_1.v4)(),
                            owner_profile_id: ownerProfile.id,
                            type: 'AADHAR_CARD',
                            url: data.documents.id_url,
                            path: data.documents.id_url,
                            status: client_1.VerificationStatus.PENDING,
                        },
                    });
                }
                if (data.documents.pan_url) {
                    await tx.ownerDocument.create({
                        data: {
                            id: (0, uuid_1.v4)(),
                            owner_profile_id: ownerProfile.id,
                            type: 'PAN_CARD',
                            url: data.documents.pan_url,
                            path: data.documents.pan_url,
                            status: client_1.VerificationStatus.PENDING,
                        },
                    });
                }
                if (data.documents.property_proof_url) {
                    await tx.ownerDocument.create({
                        data: {
                            id: (0, uuid_1.v4)(),
                            owner_profile_id: ownerProfile.id,
                            type: 'BUSINESS_LICENSE',
                            url: data.documents.property_proof_url,
                            path: data.documents.property_proof_url,
                            status: client_1.VerificationStatus.PENDING,
                        },
                    });
                }
                if (data.documents.profile_photo_url) {
                    await tx.profileImage.create({
                        data: {
                            id: (0, uuid_1.v4)(),
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
exports.AuthRepository = AuthRepository;
exports.default = AuthRepository;
