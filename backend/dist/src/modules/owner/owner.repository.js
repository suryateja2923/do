"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OwnerRepository = void 0;
const database_1 = require("../../config/database");
const client_1 = require("@prisma/client");
class OwnerRepository {
    async getApplicationStatus(ownerProfileId) {
        const profile = await database_1.prisma.ownerProfile.findUnique({
            where: { id: ownerProfileId },
            select: {
                id: true,
                user_id: true,
                business_name: true,
                gst_number: true,
                verification_status: true,
                rejection_reason: true,
                created_at: true,
            },
        });
        if (!profile) {
            return {
                kyc_status: 'PENDING',
                documents: {},
            };
        }
        return {
            id: profile.id,
            user_id: profile.user_id,
            company_name: profile.business_name,
            gst_number: profile.gst_number,
            kyc_status: profile.verification_status === 'VERIFIED' ? 'APPROVED' : profile.verification_status,
            created_at: profile.created_at,
            documents: {
                rejection_reason: profile.rejection_reason || undefined,
            },
        };
    }
    async getProfile(ownerProfileId) {
        return database_1.prisma.ownerProfile.findUnique({
            where: { id: ownerProfileId },
            include: { user: true },
        });
    }
    async getDashboardStats(ownerProfileId, propertyId) {
        const propFilter = propertyId ? { id: propertyId } : undefined;
        // Properties owned by this owner
        const [propertiesCount, pendingPropertiesCount, verifiedPropertiesCount, bookingsCount, pendingBookingsCount, confirmedBookingsCount, openComplaintsCount, resolvedComplaintsCount,] = await Promise.all([
            database_1.prisma.property.count({ where: { ...(propertyId ? { id: propertyId } : {}), owner_id: ownerProfileId, is_deleted: false } }),
            database_1.prisma.property.count({ where: { ...(propertyId ? { id: propertyId } : {}), owner_id: ownerProfileId, approval_status: client_1.VerificationStatus.PENDING, is_deleted: false } }),
            database_1.prisma.property.count({ where: { ...(propertyId ? { id: propertyId } : {}), owner_id: ownerProfileId, approval_status: client_1.VerificationStatus.VERIFIED, is_deleted: false } }),
            database_1.prisma.booking.count({ where: { bed: { room: { floor: { property: { ...(propertyId ? { id: propertyId } : {}), owner_id: ownerProfileId } } } }, is_deleted: false } }),
            database_1.prisma.booking.count({ where: { bed: { room: { floor: { property: { ...(propertyId ? { id: propertyId } : {}), owner_id: ownerProfileId } } } }, status: client_1.BookingStatus.PENDING, is_deleted: false } }),
            database_1.prisma.booking.count({ where: { bed: { room: { floor: { property: { ...(propertyId ? { id: propertyId } : {}), owner_id: ownerProfileId } } } }, status: client_1.BookingStatus.APPROVED, is_deleted: false } }),
            database_1.prisma.complaint.count({ where: { ...(propertyId ? { property_id: propertyId } : {}), property: { owner_id: ownerProfileId }, status: client_1.ComplaintStatus.OPEN, is_deleted: false } }),
            database_1.prisma.complaint.count({ where: { ...(propertyId ? { property_id: propertyId } : {}), property: { owner_id: ownerProfileId }, status: client_1.ComplaintStatus.RESOLVED, is_deleted: false } }),
        ]);
        const [floorsCount, roomsCount, bedsCount, occupiedBedsCount, vacantBedsCount, reservedBedsCount, activeTenantsCount,] = await Promise.all([
            database_1.prisma.floor.count({ where: { ...(propertyId ? { property_id: propertyId } : {}), property: { owner_id: ownerProfileId }, is_deleted: false } }),
            database_1.prisma.room.count({ where: { floor: { ...(propertyId ? { property_id: propertyId } : {}), property: { owner_id: ownerProfileId } }, is_deleted: false } }),
            database_1.prisma.bed.count({ where: { room: { floor: { ...(propertyId ? { property_id: propertyId } : {}), property: { owner_id: ownerProfileId } } }, is_deleted: false } }),
            database_1.prisma.bed.count({ where: { room: { floor: { ...(propertyId ? { property_id: propertyId } : {}), property: { owner_id: ownerProfileId } } }, occupancy_status: client_1.BedOccupancyStatus.OCCUPIED, is_deleted: false } }),
            database_1.prisma.bed.count({ where: { room: { floor: { ...(propertyId ? { property_id: propertyId } : {}), property: { owner_id: ownerProfileId } } }, occupancy_status: client_1.BedOccupancyStatus.VACANT, is_deleted: false } }),
            database_1.prisma.bed.count({ where: { room: { floor: { ...(propertyId ? { property_id: propertyId } : {}), property: { owner_id: ownerProfileId } } }, occupancy_status: client_1.BedOccupancyStatus.RESERVED, is_deleted: false } }),
            database_1.prisma.tenantProfile.count({ where: { bookings: { some: { bed: { room: { floor: { property: { ...(propertyId ? { id: propertyId } : {}), owner_id: ownerProfileId } } } }, status: client_1.BookingStatus.MOVE_IN } }, is_deleted: false } }),
        ]);
        // Let's get recent activities from DB for this owner
        const [recentBookings, recentComplaints] = await Promise.all([
            database_1.prisma.booking.findMany({
                take: 5,
                where: { bed: { room: { floor: { property: { ...(propertyId ? { id: propertyId } : {}), owner_id: ownerProfileId } } } }, is_deleted: false },
                orderBy: { created_at: 'desc' },
                include: { tenant: { include: { user: true } }, bed: { include: { room: { include: { floor: { include: { property: true } } } } } } },
            }),
            database_1.prisma.complaint.findMany({
                take: 5,
                where: { ...(propertyId ? { property_id: propertyId } : {}), property: { owner_id: ownerProfileId }, is_deleted: false },
                orderBy: { created_at: 'desc' },
                include: { tenant: { include: { user: true } } },
            }),
        ]);
        const recentActivities = [];
        recentBookings.forEach(b => {
            recentActivities.push({
                id: b.id,
                type: 'BOOKING_REQUEST',
                title: 'Booking Request Received',
                description: `${b.tenant.user.first_name || ''} requested room ${b.bed.room.room_number} in ${b.bed.room.floor.property.name}`,
                timestamp: b.created_at.toISOString(),
            });
        });
        recentComplaints.forEach(c => {
            recentActivities.push({
                id: c.id,
                type: 'COMPLAINT_FILED',
                title: 'Complaint Logged',
                description: `${c.tenant.user.first_name || ''} reported: ${c.title}`,
                timestamp: c.created_at.toISOString(),
            });
        });
        recentActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        return {
            totals: {
                properties: propertiesCount,
                floors: floorsCount,
                rooms: roomsCount,
                beds: bedsCount,
                occupiedBeds: occupiedBedsCount,
                vacantBeds: vacantBedsCount,
                reservedBeds: reservedBedsCount,
                pendingVerificationProperties: pendingPropertiesCount,
                verifiedProperties: verifiedPropertiesCount,
                pendingBookings: pendingBookingsCount,
                confirmedBookings: confirmedBookingsCount,
                cancelledBookings: 0,
                activeTenants: activeTenantsCount,
                vacatedTenants: 0,
                openComplaints: openComplaintsCount,
                resolvedComplaints: resolvedComplaintsCount,
            },
            charts: {
                occupancyTrend: [],
                bookingTrend: [],
                complaintTrend: [],
            },
            recentActivities: recentActivities.slice(0, 5),
        };
    }
    async getProperties(ownerProfileId) {
        return database_1.prisma.property.findMany({
            where: { owner_id: ownerProfileId, is_deleted: false },
            include: {
                images: true,
                floors: {
                    include: {
                        rooms: {
                            include: {
                                beds: true,
                            },
                        },
                    },
                },
            },
        });
    }
    async createProperty(ownerProfileId, data) {
        const rulesText = [
            data.description ? `Description: ${data.description}` : '',
            data.rules || '',
        ]
            .filter(Boolean)
            .join('\n');
        return database_1.prisma.property.create({
            data: {
                owner_id: ownerProfileId,
                name: data.name,
                address: data.address || data.address_line1 || '',
                zip_code: data.zip_code || '000000',
                city: data.city || '',
                state: data.state || '',
                rules: rulesText || data.rules || '',
                amenities: Array.isArray(data.amenities) ? data.amenities : [],
                status: client_1.PropertyStatus.ACTIVE,
                approval_status: client_1.VerificationStatus.PENDING,
            },
        });
    }
    async getPropertyDetail(ownerProfileId, id) {
        return database_1.prisma.property.findFirst({
            where: { id, owner_id: ownerProfileId, is_deleted: false },
            include: {
                images: true,
                floors: {
                    include: {
                        rooms: {
                            include: {
                                beds: true,
                            },
                        },
                    },
                },
            },
        });
    }
    async updateProperty(ownerProfileId, id, data) {
        return database_1.prisma.property.updateMany({
            where: { id, owner_id: ownerProfileId },
            data: {
                name: data.name,
                address: data.address,
                zip_code: data.zip_code,
                city: data.city,
                state: data.state,
                rules: data.rules,
                approval_status: client_1.VerificationStatus.PENDING,
                approval_notes: null,
            },
        });
    }
    async deactivateProperty(ownerProfileId, id) {
        return database_1.prisma.property.updateMany({
            where: { id, owner_id: ownerProfileId },
            data: { status: client_1.PropertyStatus.INACTIVE },
        });
    }
    async uploadPropertyImage(ownerProfileId, propertyId, imageUrl) {
        const property = await database_1.prisma.property.findFirst({
            where: { id: propertyId, owner_id: ownerProfileId },
        });
        if (!property) {
            throw new Error('Property not found or access denied');
        }
        return database_1.prisma.propertyImage.create({
            data: {
                property_id: propertyId,
                url: imageUrl,
                path: imageUrl,
                is_primary: false,
            },
        });
    }
    async getBookings(ownerProfileId) {
        return database_1.prisma.booking.findMany({
            where: { bed: { room: { floor: { property: { owner_id: ownerProfileId } } } }, is_deleted: false },
            include: {
                tenant: { include: { user: true } },
                bed: { include: { room: { include: { floor: { include: { property: true } } } } } },
            },
        });
    }
    async verifyBooking(ownerProfileId, id, data) {
        // Confirm booking status
        return database_1.prisma.booking.updateMany({
            where: { id, bed: { room: { floor: { property: { owner_id: ownerProfileId } } } } },
            data: { status: data.status },
        });
    }
    async getComplaints(ownerProfileId) {
        return database_1.prisma.complaint.findMany({
            where: { property: { owner_id: ownerProfileId }, is_deleted: false },
            include: {
                tenant: { include: { user: true } },
                property: true,
                room: true,
            },
        });
    }
    async getTenants(ownerProfileId) {
        return database_1.prisma.tenantProfile.findMany({
            where: { bookings: { some: { bed: { room: { floor: { property: { owner_id: ownerProfileId } } } } } }, is_deleted: false },
            include: {
                user: true,
                bookings: {
                    include: {
                        bed: { include: { room: { include: { floor: { include: { property: true } } } } } },
                    },
                },
            },
        });
    }
    async resubmitDocuments(ownerProfileId, data) {
        const { id_url, pan_url, property_proof_url, profile_photo_url } = data;
        // 1. Update verification status back to PENDING and clear rejection messages
        const profile = await database_1.prisma.ownerProfile.update({
            where: { id: ownerProfileId },
            data: {
                verification_status: client_1.VerificationStatus.PENDING,
                rejection_reason: null,
                approval_notes: null,
            },
        });
        // 2. Upsert Aadhaar, PAN, Property Proof documents
        const docUpdates = [
            { type: 'AADHAR_CARD', url: id_url },
            { type: 'PAN_CARD', url: pan_url },
            { type: 'BUSINESS_LICENSE', url: property_proof_url },
        ];
        for (const doc of docUpdates) {
            if (doc.url) {
                const existing = await database_1.prisma.ownerDocument.findFirst({
                    where: { owner_profile_id: ownerProfileId, type: doc.type, is_deleted: false },
                });
                if (existing) {
                    await database_1.prisma.ownerDocument.update({
                        where: { id: existing.id },
                        data: { url: doc.url, path: doc.url },
                    });
                }
                else {
                    await database_1.prisma.ownerDocument.create({
                        data: {
                            owner_profile_id: ownerProfileId,
                            type: doc.type,
                            url: doc.url,
                            path: doc.url,
                            status: client_1.VerificationStatus.PENDING,
                        },
                    });
                }
            }
        }
        // 3. Upsert Profile Image
        if (profile_photo_url) {
            const existingImg = await database_1.prisma.profileImage.findFirst({
                where: { user_id: profile.user_id },
            });
            if (existingImg) {
                await database_1.prisma.profileImage.update({
                    where: { id: existingImg.id },
                    data: { url: profile_photo_url, path: profile_photo_url },
                });
            }
            else {
                await database_1.prisma.profileImage.create({
                    data: {
                        user_id: profile.user_id,
                        url: profile_photo_url,
                        path: profile_photo_url,
                    },
                });
            }
        }
        return {
            id: profile.id,
            user_id: profile.user_id,
            company_name: profile.business_name,
            gst_number: profile.gst_number,
            kyc_status: profile.verification_status === 'VERIFIED' ? 'APPROVED' : profile.verification_status,
            created_at: profile.created_at,
            documents: {
                rejection_reason: null,
            },
        };
    }
    async listFloors(ownerProfileId, propertyId) {
        const property = await database_1.prisma.property.findFirst({
            where: { id: propertyId, owner_id: ownerProfileId, is_deleted: false },
        });
        if (!property)
            throw new Error('Property not found or access denied');
        return database_1.prisma.floor.findMany({
            where: { property_id: propertyId, is_deleted: false },
            include: { rooms: { where: { is_deleted: false }, include: { beds: { where: { is_deleted: false } } } } },
        });
    }
    async createFloor(ownerProfileId, propertyId, name) {
        const property = await database_1.prisma.property.findFirst({
            where: { id: propertyId, owner_id: ownerProfileId, is_deleted: false },
        });
        if (!property)
            throw new Error('Property not found or access denied');
        const count = await database_1.prisma.floor.count({
            where: { property_id: propertyId, is_deleted: false },
        });
        return database_1.prisma.floor.create({
            data: {
                property_id: propertyId,
                name,
                floor_number: count + 1,
            },
        });
    }
    async updateFloor(ownerProfileId, propertyId, floorId, name) {
        const floor = await database_1.prisma.floor.findFirst({
            where: { id: floorId, property_id: propertyId, property: { owner_id: ownerProfileId }, is_deleted: false },
        });
        if (!floor)
            throw new Error('Floor not found or access denied');
        return database_1.prisma.floor.update({
            where: { id: floorId },
            data: { name },
        });
    }
    async deleteFloor(ownerProfileId, propertyId, floorId) {
        const floor = await database_1.prisma.floor.findFirst({
            where: { id: floorId, property_id: propertyId, property: { owner_id: ownerProfileId }, is_deleted: false },
            include: { rooms: { where: { is_deleted: false } } },
        });
        if (!floor)
            throw new Error('Floor not found or access denied');
        if (floor.rooms.length > 0)
            throw new Error('Cannot delete floor containing rooms');
        return database_1.prisma.floor.update({
            where: { id: floorId },
            data: { is_deleted: true, deleted_at: new Date() },
        });
    }
    async listRooms(ownerProfileId, floorId) {
        const floor = await database_1.prisma.floor.findFirst({
            where: { id: floorId, property: { owner_id: ownerProfileId }, is_deleted: false },
        });
        if (!floor)
            throw new Error('Floor not found or access denied');
        return database_1.prisma.room.findMany({
            where: { floor_id: floorId, is_deleted: false },
            include: { beds: { where: { is_deleted: false } } },
        });
    }
    getSharingType(capacity) {
        if (capacity === 1)
            return 'SINGLE';
        if (capacity === 2)
            return 'DOUBLE';
        if (capacity === 3)
            return 'TRIPLE';
        if (capacity === 4)
            return 'FOUR_SHARING';
        return 'OTHER';
    }
    async createRoom(ownerProfileId, floorId, data) {
        const floor = await database_1.prisma.floor.findFirst({
            where: { id: floorId, property: { owner_id: ownerProfileId }, is_deleted: false },
        });
        if (!floor)
            throw new Error('Floor not found or access denied');
        const capacity = parseInt(data.sharing_capacity) || 1;
        return database_1.prisma.room.create({
            data: {
                floor_id: floorId,
                room_number: data.room_number,
                sharing_type: this.getSharingType(capacity),
                room_type: data.room_type || 'NON_AC',
            },
        });
    }
    async updateRoom(ownerProfileId, roomId, data) {
        const room = await database_1.prisma.room.findFirst({
            where: { id: roomId, floor: { property: { owner_id: ownerProfileId } }, is_deleted: false },
        });
        if (!room)
            throw new Error('Room not found or access denied');
        const capacity = parseInt(data.sharing_capacity) || 1;
        return database_1.prisma.room.update({
            where: { id: roomId },
            data: {
                room_number: data.room_number,
                sharing_type: this.getSharingType(capacity),
                room_type: data.room_type,
            },
        });
    }
    async deleteRoom(ownerProfileId, roomId) {
        const room = await database_1.prisma.room.findFirst({
            where: { id: roomId, floor: { property: { owner_id: ownerProfileId } }, is_deleted: false },
            include: { beds: { where: { is_deleted: false } } },
        });
        if (!room)
            throw new Error('Room not found or access denied');
        if (room.beds.length > 0)
            throw new Error('Cannot delete room containing beds');
        return database_1.prisma.room.update({
            where: { id: roomId },
            data: { is_deleted: true, deleted_at: new Date() },
        });
    }
    async listBeds(ownerProfileId, roomId) {
        const room = await database_1.prisma.room.findFirst({
            where: { id: roomId, floor: { property: { owner_id: ownerProfileId } }, is_deleted: false },
        });
        if (!room)
            throw new Error('Room not found or access denied');
        return database_1.prisma.bed.findMany({
            where: { room_id: roomId, is_deleted: false },
        });
    }
    async createBed(ownerProfileId, roomId, bedNumber, data = {}) {
        const room = await database_1.prisma.room.findFirst({
            where: { id: roomId, floor: { property: { owner_id: ownerProfileId } }, is_deleted: false },
        });
        if (!room)
            throw new Error('Room not found or access denied');
        return database_1.prisma.bed.create({
            data: {
                room_id: roomId,
                bed_number: bedNumber,
                rent: new client_1.Prisma.Decimal(data.rent || 10000),
                security_deposit: new client_1.Prisma.Decimal(data.security_deposit || 10000),
                occupancy_status: client_1.BedOccupancyStatus.VACANT,
            },
        });
    }
    async updateBed(ownerProfileId, bedId, data) {
        const bed = await database_1.prisma.bed.findFirst({
            where: { id: bedId, room: { floor: { property: { owner_id: ownerProfileId } } }, is_deleted: false },
        });
        if (!bed)
            throw new Error('Bed not found or access denied');
        return database_1.prisma.bed.update({
            where: { id: bedId },
            data: {
                bed_number: data.bed_number !== undefined ? data.bed_number : undefined,
                occupancy_status: data.status !== undefined ? data.status : undefined,
                rent: data.rent !== undefined ? new client_1.Prisma.Decimal(data.rent) : undefined,
                security_deposit: data.security_deposit !== undefined ? new client_1.Prisma.Decimal(data.security_deposit) : undefined,
            },
        });
    }
    async deleteBed(ownerProfileId, bedId) {
        const bed = await database_1.prisma.bed.findFirst({
            where: { id: bedId, room: { floor: { property: { owner_id: ownerProfileId } } }, is_deleted: false },
        });
        if (!bed)
            throw new Error('Bed not found or access denied');
        if (bed.occupancy_status === client_1.BedOccupancyStatus.OCCUPIED) {
            throw new Error('Cannot delete an occupied bed');
        }
        return database_1.prisma.bed.update({
            where: { id: bedId },
            data: { is_deleted: true, deleted_at: new Date() },
        });
    }
}
exports.OwnerRepository = OwnerRepository;
