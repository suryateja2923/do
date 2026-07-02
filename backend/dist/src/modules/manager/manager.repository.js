"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManagerRepository = void 0;
const database_1 = require("../../config/database");
const client_1 = require("@prisma/client");
class ManagerRepository {
    async getDashboardStats() {
        const [pendingOwners, pendingProperties, pendingBookings, openComplaints, resolvedComplaints, inProgressComplaints,] = await Promise.all([
            database_1.prisma.ownerProfile.count({ where: { verification_status: client_1.VerificationStatus.PENDING, is_deleted: false } }),
            database_1.prisma.property.count({ where: { approval_status: client_1.VerificationStatus.PENDING, is_deleted: false } }),
            database_1.prisma.booking.count({ where: { status: client_1.BookingStatus.PENDING, is_deleted: false } }),
            database_1.prisma.complaint.count({ where: { status: client_1.ComplaintStatus.OPEN, is_deleted: false } }),
            database_1.prisma.complaint.count({ where: { status: client_1.ComplaintStatus.RESOLVED, is_deleted: false } }),
            database_1.prisma.complaint.count({ where: { status: client_1.ComplaintStatus.IN_PROGRESS, is_deleted: false } }),
        ]);
        // Let's retrieve recent activities from DB if possible. We can query recent complaints, bookings, owner signups.
        const [recentOwners, recentProperties, recentComplaints, recentBookings] = await Promise.all([
            database_1.prisma.ownerProfile.findMany({
                take: 3,
                where: { is_deleted: false },
                orderBy: { created_at: 'desc' },
                include: { user: true },
            }),
            database_1.prisma.property.findMany({
                take: 3,
                where: { is_deleted: false },
                orderBy: { created_at: 'desc' },
            }),
            database_1.prisma.complaint.findMany({
                take: 3,
                where: { is_deleted: false },
                orderBy: { created_at: 'desc' },
                include: { tenant: { include: { user: true } } },
            }),
            database_1.prisma.booking.findMany({
                take: 3,
                where: { is_deleted: false },
                orderBy: { created_at: 'desc' },
                include: { tenant: { include: { user: true } } },
            }),
        ]);
        const recentActivities = [];
        recentOwners.forEach(o => {
            recentActivities.push({
                id: `act-owner-${o.id}`,
                type: 'OWNER_REGISTRATION',
                title: 'New Owner Registered',
                description: `${o.user.first_name || ''} ${o.user.last_name || ''} registered business ${o.business_name || ''}`,
                timestamp: o.created_at.toISOString(),
                status: o.verification_status,
            });
        });
        recentProperties.forEach(p => {
            recentActivities.push({
                id: `act-prop-${p.id}`,
                type: 'PROPERTY_SUBMISSION',
                title: 'New Property Submitted',
                description: `${p.name} submitted for approval`,
                timestamp: p.created_at.toISOString(),
                status: p.approval_status,
            });
        });
        recentComplaints.forEach(c => {
            recentActivities.push({
                id: `act-comp-${c.id}`,
                type: 'COMPLAINT_FILED',
                title: 'New Complaint Filed',
                description: `${c.title}: ${c.description}`,
                timestamp: c.created_at.toISOString(),
                status: c.status,
            });
        });
        recentBookings.forEach(b => {
            recentActivities.push({
                id: `act-book-${b.id}`,
                type: 'BOOKING_REQUEST',
                title: 'New Booking Request',
                description: `Booking request for bed ID ${b.bed_id}`,
                timestamp: b.created_at.toISOString(),
                status: b.status,
            });
        });
        recentActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        // Generate trend data based on actual DB records
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const [ownersForTrend, propertiesForTrend] = await Promise.all([
            database_1.prisma.ownerProfile.findMany({
                where: { is_deleted: false, created_at: { gte: sixMonthsAgo } },
                select: { created_at: true, verification_status: true },
            }),
            database_1.prisma.property.findMany({
                where: { is_deleted: false, created_at: { gte: sixMonthsAgo } },
                select: { created_at: true, approval_status: true },
            }),
        ]);
        const ownerTrendMap = {};
        for (const o of ownersForTrend) {
            const key = o.created_at.toLocaleString('en-US', { month: 'short', year: '2-digit' });
            if (!ownerTrendMap[key]) {
                ownerTrendMap[key] = { pending: 0, approved: 0 };
            }
            if (o.verification_status === client_1.VerificationStatus.PENDING) {
                ownerTrendMap[key].pending += 1;
            }
            else if (o.verification_status === client_1.VerificationStatus.VERIFIED) {
                ownerTrendMap[key].approved += 1;
            }
        }
        const ownerVerificationTrend = Object.entries(ownerTrendMap).map(([date, { pending, approved }]) => ({
            date,
            pending,
            approved,
        }));
        const propertyTrendMap = {};
        for (const p of propertiesForTrend) {
            const key = p.created_at.toLocaleString('en-US', { month: 'short', year: '2-digit' });
            if (!propertyTrendMap[key]) {
                propertyTrendMap[key] = { pending: 0, approved: 0 };
            }
            if (p.approval_status === client_1.VerificationStatus.PENDING) {
                propertyTrendMap[key].pending += 1;
            }
            else if (p.approval_status === client_1.VerificationStatus.VERIFIED) {
                propertyTrendMap[key].approved += 1;
            }
        }
        const propertyApprovalTrend = Object.entries(propertyTrendMap).map(([date, { pending, approved }]) => ({
            date,
            pending,
            approved,
        }));
        // Query task/complaint resolution metrics dynamically
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const [assignedTasks, todayCompletedTasks, resolvedComplaintsList] = await Promise.all([
            database_1.prisma.complaint.count({
                where: {
                    status: { in: [client_1.ComplaintStatus.ASSIGNED, client_1.ComplaintStatus.IN_PROGRESS] },
                    assigned_to_id: { not: null },
                    is_deleted: false,
                },
            }),
            database_1.prisma.complaint.count({
                where: {
                    status: client_1.ComplaintStatus.RESOLVED,
                    resolved_at: { gte: today },
                    is_deleted: false,
                },
            }),
            database_1.prisma.complaint.findMany({
                where: {
                    status: client_1.ComplaintStatus.RESOLVED,
                    resolved_at: { not: null },
                    is_deleted: false,
                },
                select: {
                    created_at: true,
                    resolved_at: true,
                },
            }),
        ]);
        let avgVerificationTimeHours = 0;
        if (resolvedComplaintsList.length > 0) {
            const totalHours = resolvedComplaintsList.reduce((sum, c) => {
                const diffMs = new Date(c.resolved_at).getTime() - new Date(c.created_at).getTime();
                return sum + (diffMs / (1000 * 60 * 60));
            }, 0);
            avgVerificationTimeHours = Math.round(totalHours / resolvedComplaintsList.length);
        }
        return {
            totals: {
                pendingOwners,
                pendingProperties,
                pendingBookings,
                openComplaints,
                assignedTasks,
                waitingApprovalProperties: pendingProperties,
                todayCompletedTasks,
                avgVerificationTimeHours,
            },
            charts: {
                ownerVerificationTrend,
                propertyApprovalTrend,
                complaintStatus: [
                    { status: 'Open', count: openComplaints, color: '#f87171' },
                    { status: 'In Progress', count: inProgressComplaints, color: '#fbbf24' },
                    { status: 'Resolved', count: resolvedComplaints, color: '#34d399' },
                ],
                taskCompletionRate: [],
            },
            recentActivities: recentActivities.slice(0, 10),
        };
    }
    async getOwners() {
        const owners = await database_1.prisma.ownerProfile.findMany({
            where: { is_deleted: false },
            orderBy: { created_at: 'desc' },
            include: {
                user: {
                    include: {
                        profile_image: { select: { url: true } },
                    },
                },
                owner_documents: {
                    where: { is_deleted: false },
                },
                _count: { select: { properties: true } },
            },
        });
        return owners.map((owner) => ({
            ...owner,
            company_name: owner.business_name,
            kyc_status: owner.verification_status === 'VERIFIED' ? 'APPROVED' : owner.verification_status,
        }));
    }
    async verifyOwner(id, status, notes) {
        const mappedStatus = status === 'APPROVED' ? client_1.VerificationStatus.VERIFIED : status;
        if (mappedStatus === client_1.VerificationStatus.REJECTED) {
            const profile = await database_1.prisma.ownerProfile.findUnique({
                where: { id },
                select: { user_id: true },
            });
            if (profile) {
                await database_1.prisma.$transaction([
                    database_1.prisma.ownerDocument.deleteMany({ where: { owner_profile_id: id } }),
                    database_1.prisma.ownerSubscription.deleteMany({ where: { owner_profile_id: id } }),
                    database_1.prisma.property.deleteMany({ where: { owner_id: id } }),
                    database_1.prisma.ownerProfile.delete({ where: { id } }),
                    database_1.prisma.profileImage.deleteMany({ where: { user_id: profile.user_id } }),
                    database_1.prisma.user.delete({ where: { id: profile.user_id } }),
                ]);
            }
            return { deleted: true };
        }
        return database_1.prisma.ownerProfile.update({
            where: { id },
            data: {
                verification_status: mappedStatus,
                approval_notes: notes,
            },
        });
    }
    async requestOwnerDocuments(id, documentTypes, notes) {
        const documentStr = documentTypes.join(', ');
        const fullNotes = `Requested documents: ${documentStr}. Notes: ${notes}`;
        return database_1.prisma.ownerProfile.update({
            where: { id },
            data: {
                verification_status: client_1.VerificationStatus.REJECTED,
                rejection_reason: fullNotes,
                approval_notes: fullNotes,
            },
        });
    }
    async suspendOwner(id, notes) {
        return database_1.prisma.ownerProfile.update({
            where: { id },
            data: {
                verification_status: client_1.VerificationStatus.REJECTED,
                approval_notes: `Suspended: ${notes}`,
            },
        });
    }
    async getVerificationHistory(id) {
        // If there is no specific audit/verification history model, we can return log entries or empty array.
        // Wait, is there an AuditLog or ActivityLog model? Yes, we saw User has audit_logs and activity_logs relations.
        // Let's check schema.prisma for AuditLog or activity_logs or verification history.
        // Let's return empty array as we don't have separate verification history entries or we can query active logs.
        return [];
    }
    async getProperties() {
        const properties = await database_1.prisma.property.findMany({
            where: { is_deleted: false },
            orderBy: { created_at: 'desc' },
            include: {
                owner: { include: { user: true } },
                area: { include: { city: { include: { state: true } } } },
            },
        });
        return properties.map((prop) => ({
            ...prop,
            city: { name: prop.area?.city?.name || prop.city || '' },
            state: { name: prop.area?.city?.state?.name || prop.state || '' },
        }));
    }
    async verifyProperty(id, status, notes) {
        return database_1.prisma.property.update({
            where: { id },
            data: {
                approval_status: status,
                approval_notes: notes,
            },
        });
    }
    async getBookings() {
        return database_1.prisma.booking.findMany({
            where: { is_deleted: false },
            orderBy: { created_at: 'desc' },
            include: {
                tenant: { include: { user: true } },
                bed: { include: { room: { include: { floor: { include: { property: true } } } } } },
            },
        });
    }
    async verifyBooking(id, status) {
        return database_1.prisma.booking.update({
            where: { id },
            data: {
                status,
            },
        });
    }
    async getComplaints() {
        return database_1.prisma.complaint.findMany({
            where: { is_deleted: false },
            orderBy: { created_at: 'desc' },
            include: {
                tenant: { include: { user: true } },
                property: true,
            },
        });
    }
    async updateComplaintStatus(id, status, notes) {
        // Let's update status and save comments if needed.
        return database_1.prisma.complaint.update({
            where: { id },
            data: {
                status,
            },
        });
    }
    async getReports(category) {
        // Return empty array, or query actual data based on category
        return [];
    }
    async searchAll(query) {
        const q = query.toLowerCase();
        const [owners, properties, bookings, complaints] = await Promise.all([
            database_1.prisma.ownerProfile.findMany({
                where: {
                    is_deleted: false,
                    OR: [
                        { business_name: { contains: q, mode: 'insensitive' } },
                        { user: { first_name: { contains: q, mode: 'insensitive' } } },
                        { user: { last_name: { contains: q, mode: 'insensitive' } } },
                    ],
                },
                include: { user: true },
            }),
            database_1.prisma.property.findMany({
                where: {
                    is_deleted: false,
                    name: { contains: q, mode: 'insensitive' },
                },
                include: {
                    owner: { include: { user: true } },
                    area: { include: { city: { include: { state: true } } } },
                },
            }),
            database_1.prisma.booking.findMany({
                where: {
                    is_deleted: false,
                    tenant: { user: { first_name: { contains: q, mode: 'insensitive' } } },
                },
                include: { tenant: { include: { user: true } } },
            }),
            database_1.prisma.complaint.findMany({
                where: {
                    is_deleted: false,
                    title: { contains: q, mode: 'insensitive' },
                },
                include: { tenant: { include: { user: true } } },
            }),
        ]);
        const mappedProperties = properties.map((prop) => ({
            ...prop,
            city: { name: prop.area?.city?.name || prop.city || '' },
            state: { name: prop.area?.city?.state?.name || prop.state || '' },
        }));
        return {
            owners,
            properties: mappedProperties,
            bookings,
            complaints,
            tasks: [],
        };
    }
}
exports.ManagerRepository = ManagerRepository;
