"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const database_1 = require("../../config/database");
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const env_1 = require("../../config/env");
class UserRepository {
    async getProfile(userId) {
        return database_1.prisma.user.findUnique({
            where: { id: userId, is_deleted: false },
            include: {
                tenant_profile: {
                    include: {
                        favorites: true,
                        bookings: {
                            include: {
                                bed: {
                                    include: {
                                        room: {
                                            include: {
                                                floor: {
                                                    include: {
                                                        property: true,
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
    }
    async updateProfile(userId, data) {
        const updateData = {};
        if (data.first_name !== undefined)
            updateData.first_name = data.first_name;
        if (data.last_name !== undefined)
            updateData.last_name = data.last_name;
        if (data.phone !== undefined)
            updateData.phone = data.phone;
        if (data.password) {
            updateData.password_hash = await bcryptjs_1.default.hash(data.password, env_1.env.BCRYPT_ROUNDS);
        }
        return database_1.prisma.$transaction(async (tx) => {
            const user = await tx.user.update({
                where: { id: userId },
                data: updateData,
            });
            if (data.permanent_address !== undefined || data.emergency_contact_name !== undefined || data.emergency_contact_phone !== undefined) {
                const tenant = await tx.tenantProfile.findUnique({ where: { user_id: userId } });
                if (tenant) {
                    await tx.tenantProfile.update({
                        where: { id: tenant.id },
                        data: {
                            permanent_address: data.permanent_address,
                            emergency_contact_name: data.emergency_contact_name,
                            emergency_contact_phone: data.emergency_contact_phone,
                        },
                    });
                }
            }
            if (data.profile_photo_url) {
                const existingImg = await tx.profileImage.findFirst({ where: { user_id: userId } });
                if (existingImg) {
                    await tx.profileImage.update({
                        where: { id: existingImg.id },
                        data: { url: data.profile_photo_url, path: data.profile_photo_url },
                    });
                }
                else {
                    await tx.profileImage.create({
                        data: {
                            user_id: userId,
                            url: data.profile_photo_url,
                            path: data.profile_photo_url,
                        },
                    });
                }
            }
            return user;
        });
    }
    async searchProperties(filters) {
        const whereClause = {
            is_deleted: false,
            status: client_1.PropertyStatus.ACTIVE,
            approval_status: client_1.VerificationStatus.VERIFIED,
            owner: {
                verification_status: client_1.VerificationStatus.VERIFIED,
                is_deleted: false,
            },
        };
        if (filters.city) {
            whereClause.city = {
                contains: filters.city,
                mode: 'insensitive',
            };
        }
        const properties = await database_1.prisma.property.findMany({
            where: whereClause,
            include: {
                images: true,
                floors: {
                    include: {
                        rooms: {
                            include: {
                                beds: {
                                    where: { is_deleted: false },
                                },
                            },
                        },
                    },
                },
            },
        });
        // In-memory filtering for max price and amenities since they might be nested or stored in custom formats
        let filtered = properties;
        if (filters.price) {
            const maxPrice = parseFloat(filters.price);
            filtered = filtered.filter((prop) => {
                return prop.floors.some((floor) => floor.rooms.some((room) => room.beds.some((bed) => parseFloat(bed.rent.toString()) <= maxPrice)));
            });
        }
        if (filters.wifi === 'true') {
            filtered = filtered.filter((prop) => prop.amenities.some(a => a.toLowerCase() === 'wifi' || a.toLowerCase() === 'wi-fi'));
        }
        if (filters.parking === 'true') {
            filtered = filtered.filter((prop) => prop.amenities.some(a => a.toLowerCase() === 'parking'));
        }
        if (filters.laundry === 'true') {
            filtered = filtered.filter((prop) => prop.amenities.some(a => a.toLowerCase() === 'laundry'));
        }
        if (filters.food === 'true') {
            filtered = filtered.filter((prop) => prop.amenities.some(a => a.toLowerCase() === 'food'));
        }
        return filtered.map((prop) => {
            // Find minimum rent across available beds
            let minRent = 0;
            let hasVacant = false;
            prop.floors.forEach((floor) => {
                floor.rooms.forEach((room) => {
                    room.beds.forEach((bed) => {
                        const rentVal = parseFloat(bed.rent.toString());
                        if (minRent === 0 || rentVal < minRent) {
                            minRent = rentVal;
                        }
                        if (bed.occupancy_status === client_1.BedOccupancyStatus.VACANT) {
                            hasVacant = true;
                        }
                    });
                });
            });
            const hasAmenity = (name) => prop.amenities.some(a => a.toLowerCase() === name.toLowerCase() || a.toLowerCase() === name.replace('-', '').toLowerCase());
            return {
                id: prop.id,
                name: prop.name,
                address: prop.address,
                zip_code: prop.zip_code,
                city: prop.city,
                state: prop.state,
                amenities: prop.amenities,
                wifi_available: hasAmenity('wifi') || hasAmenity('wi-fi'),
                parking_available: hasAmenity('parking'),
                laundry_available: hasAmenity('laundry'),
                cctv_available: hasAmenity('cctv'),
                food_available: hasAmenity('food'),
                min_rent: minRent,
                has_vacant_beds: hasVacant,
                images: prop.images,
            };
        });
    }
    async getPropertyDetail(propertyId) {
        const prop = await database_1.prisma.property.findFirst({
            where: { id: propertyId, is_deleted: false },
            include: {
                images: true,
                floors: {
                    where: { is_deleted: false },
                    include: {
                        rooms: {
                            where: { is_deleted: false },
                            include: {
                                beds: {
                                    where: { is_deleted: false },
                                },
                            },
                        },
                    },
                },
                reviews: {
                    where: { is_deleted: false },
                    include: {
                        tenant: {
                            include: {
                                user: true,
                            },
                        },
                    },
                },
            },
        });
        if (!prop)
            return null;
        const rents = prop.floors.flatMap((f) => f.rooms.flatMap((r) => r.beds.map((b) => parseFloat(b.rent.toString()))));
        const minRent = rents.length > 0 ? Math.min(...rents) : 0;
        return {
            ...prop,
            min_rent: minRent,
        };
    }
    async getFavorites(tenantId) {
        return database_1.prisma.favorite.findMany({
            where: { tenant_id: tenantId, is_deleted: false },
            include: {
                property: {
                    include: {
                        images: true,
                    },
                },
            },
        });
    }
    async addFavorite(tenantId, propertyId) {
        return database_1.prisma.favorite.upsert({
            where: {
                tenant_id_property_id: {
                    tenant_id: tenantId,
                    property_id: propertyId,
                },
            },
            create: {
                tenant_id: tenantId,
                property_id: propertyId,
            },
            update: {
                is_deleted: false,
            },
        });
    }
    async removeFavorite(tenantId, propertyId) {
        return database_1.prisma.favorite.update({
            where: {
                tenant_id_property_id: {
                    tenant_id: tenantId,
                    property_id: propertyId,
                },
            },
            data: {
                is_deleted: true,
            },
        });
    }
    async getBookings(tenantId) {
        return database_1.prisma.booking.findMany({
            where: { tenant_id: tenantId, is_deleted: false },
            include: {
                bed: {
                    include: {
                        room: {
                            include: {
                                floor: {
                                    include: {
                                        property: {
                                            include: {
                                                images: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: { created_at: 'desc' },
        });
    }
    async createBooking(tenantId, userId, bedId, expectedMoveIn) {
        return database_1.prisma.$transaction(async (tx) => {
            // 1. Verify bed exists and is vacant
            const bed = await tx.bed.findFirst({
                where: { id: bedId, is_deleted: false, occupancy_status: client_1.BedOccupancyStatus.VACANT },
            });
            if (!bed) {
                throw new Error('Bed is no longer vacant or does not exist');
            }
            // 2. Create booking record
            const booking = await tx.booking.create({
                data: {
                    tenant_id: tenantId,
                    bed_id: bedId,
                    expected_move_in: expectedMoveIn,
                    booking_amount: bed.rent,
                    security_deposit: bed.security_deposit,
                    rent: bed.rent,
                    status: client_1.BookingStatus.PENDING,
                },
            });
            // 3. Mark bed as RESERVED (to prevent double booking)
            await tx.bed.update({
                where: { id: bedId },
                data: { occupancy_status: client_1.BedOccupancyStatus.RESERVED },
            });
            // 4. Create Audit Log
            await tx.auditLog.create({
                data: {
                    action: 'BOOKING_CREATE',
                    entity_name: 'Booking',
                    entity_id: booking.id,
                    user_id: userId,
                    new_values: { details: `Tenant created a booking for bed ${bed.bed_number} (rent: ${bed.rent})` },
                },
            });
            return booking;
        });
    }
    async cancelBooking(tenantId, bookingId) {
        return database_1.prisma.$transaction(async (tx) => {
            const booking = await tx.booking.findFirst({
                where: { id: bookingId, tenant_id: tenantId, status: client_1.BookingStatus.PENDING },
            });
            if (!booking) {
                throw new Error('Booking not found or cannot be cancelled');
            }
            const updated = await tx.booking.update({
                where: { id: bookingId },
                data: { status: client_1.BookingStatus.CANCELLED },
            });
            // Restore bed occupancy to VACANT
            await tx.bed.update({
                where: { id: booking.bed_id },
                data: { occupancy_status: client_1.BedOccupancyStatus.VACANT },
            });
            return updated;
        });
    }
    async getComplaints(tenantId) {
        return database_1.prisma.complaint.findMany({
            where: { tenant_id: tenantId, is_deleted: false },
            include: {
                property: true,
                room: true,
            },
            orderBy: { created_at: 'desc' },
        });
    }
    async createComplaint(tenantId, data) {
        return database_1.prisma.$transaction(async (tx) => {
            const complaint = await tx.complaint.create({
                data: {
                    tenant_id: tenantId,
                    property_id: data.property_id,
                    room_id: data.room_id || null,
                    category: data.category,
                    title: data.title,
                    description: data.description,
                    priority: data.priority || 'MEDIUM',
                    status: client_1.ComplaintStatus.OPEN,
                },
            });
            return complaint;
        });
    }
    async getNotifications(userId) {
        return database_1.prisma.notification.findMany({
            where: { user_id: userId, is_deleted: false },
            orderBy: { created_at: 'desc' },
        });
    }
    async markNotificationAsRead(userId, notificationId) {
        return database_1.prisma.notification.updateMany({
            where: { id: notificationId, user_id: userId },
            data: {
                is_read: true,
                read_at: new Date(),
            },
        });
    }
    async createReview(tenantId, data) {
        return database_1.prisma.$transaction(async (tx) => {
            const review = await tx.review.create({
                data: {
                    tenant_id: tenantId,
                    property_id: data.property_id,
                    rating: data.rating,
                    comment: data.comment,
                },
            });
            return review;
        });
    }
}
exports.UserRepository = UserRepository;
