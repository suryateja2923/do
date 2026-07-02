import { prisma } from '../../config/database';
import { NotificationType, VerificationStatus } from '@prisma/client';
import AuditService from '../../shared/services/audit.service';
import NotificationService from '../../shared/services/notification.service';

export class AdminRepository {
  /**
   * Platform-wide aggregate statistics
   */
  async getDashboardStats() {
    const [
      totalOwners,
      totalManagers,
      totalUsers,
      totalProperties,
      pendingProperties,
      verifiedProperties,
      totalRooms,
      occupiedBeds,
      vacantBeds,
      totalBeds,
      totalBookings,
      pendingBookings,
      openComplaints,
      resolvedComplaints,
      totalPayments,
      occupiedRooms,
      pendingInvoicesSum,
    ] = await Promise.all([
      prisma.ownerProfile.count({ where: { is_deleted: false } }),
      prisma.managerProfile.count({ where: { is_deleted: false } }),
      prisma.user.count({ where: { role: 'USER', is_deleted: false } }),
      prisma.property.count({ where: { is_deleted: false } }),
      prisma.property.count({ where: { approval_status: VerificationStatus.PENDING, is_deleted: false } }),
      prisma.property.count({ where: { approval_status: VerificationStatus.VERIFIED, is_deleted: false } }),
      prisma.room.count({ where: { is_deleted: false } }),
      prisma.bed.count({ where: { occupancy_status: 'OCCUPIED', is_deleted: false } }),
      prisma.bed.count({ where: { occupancy_status: 'VACANT', is_deleted: false } }),
      prisma.bed.count({ where: { is_deleted: false } }),
      prisma.booking.count({ where: { is_deleted: false } }),
      prisma.booking.count({ where: { status: 'PENDING', is_deleted: false } }),
      prisma.complaint.count({ where: { status: 'OPEN', is_deleted: false } }),
      prisma.complaint.count({ where: { status: 'RESOLVED', is_deleted: false } }),
      prisma.payment.aggregate({ where: { status: 'SUCCESS', is_deleted: false }, _sum: { amount: true } }),
      prisma.room.count({
        where: {
          is_deleted: false,
          beds: {
            some: {
              occupancy_status: 'OCCUPIED',
              is_deleted: false,
            },
          },
        },
      }),
      prisma.invoice.aggregate({
        where: {
          status: { in: ['UNPAID', 'OVERDUE'] },
          is_deleted: false,
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

    const vacantRooms = Math.max(0, totalRooms - occupiedRooms);
    const pendingPayments = Number(pendingInvoicesSum._sum.amount || 0);

    // Monthly data for last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [recentPayments, recentBookingsForChart, recentUsersForChart, recentPropertiesForChart] = await Promise.all([
      prisma.payment.findMany({
        where: { status: 'SUCCESS', is_deleted: false, payment_date: { gte: sixMonthsAgo } },
        select: { amount: true, payment_date: true },
      }),
      prisma.booking.findMany({
        where: { is_deleted: false, created_at: { gte: sixMonthsAgo } },
        select: { created_at: true },
      }),
      prisma.user.findMany({
        where: { is_deleted: false, created_at: { gte: sixMonthsAgo } },
        select: { created_at: true },
      }),
      prisma.property.findMany({
        where: { is_deleted: false, created_at: { gte: sixMonthsAgo } },
        select: { created_at: true },
      }),
    ]);

    // Aggregate revenue by month
    const revenueMap: Record<string, number> = {};
    for (const p of recentPayments) {
      const key = p.payment_date.toLocaleString('en-US', { month: 'short', year: '2-digit' });
      revenueMap[key] = (revenueMap[key] || 0) + Number(p.amount);
    }
    const revenue = Object.entries(revenueMap).map(([month, amount]) => ({ month, amount }));

    // Aggregate bookings by month
    const bookingsMap: Record<string, number> = {};
    for (const b of recentBookingsForChart) {
      const key = b.created_at.toLocaleString('en-US', { month: 'short', year: '2-digit' });
      bookingsMap[key] = (bookingsMap[key] || 0) + 1;
    }
    const bookingsTrend = Object.entries(bookingsMap).map(([month, bookings]) => ({ month, bookings }));

    // Aggregate growth by month
    const userGrowthMap: Record<string, number> = {};
    for (const u of recentUsersForChart) {
      const key = u.created_at.toLocaleString('en-US', { month: 'short', year: '2-digit' });
      userGrowthMap[key] = (userGrowthMap[key] || 0) + 1;
    }
    const propertyGrowthMap: Record<string, number> = {};
    for (const p of recentPropertiesForChart) {
      const key = p.created_at.toLocaleString('en-US', { month: 'short', year: '2-digit' });
      propertyGrowthMap[key] = (propertyGrowthMap[key] || 0) + 1;
    }

    const monthsSet = new Set([...Object.keys(userGrowthMap), ...Object.keys(propertyGrowthMap)]);
    const growthTrend = Array.from(monthsSet).map((month) => ({
      month,
      users: userGrowthMap[month] || 0,
      properties: propertyGrowthMap[month] || 0,
    }));

    // Recent activities from audit_logs or fallback to recent bookings/complaints
    const recentBookings = await prisma.booking.findMany({
      take: 5,
      where: { is_deleted: false },
      orderBy: { created_at: 'desc' },
      include: { tenant: { include: { user: { select: { first_name: true, last_name: true } } } } },
    });

    const recentActivities = recentBookings.map((b) => ({
      id: b.id,
      type: 'BOOKING_REQUEST',
      description: `Booking by ${b.tenant.user.first_name} ${b.tenant.user.last_name} - status: ${b.status}`,
      timestamp: b.created_at.toISOString(),
    }));

    return {
      totals: {
        owners: totalOwners,
        managers: totalManagers,
        properties: totalProperties,
        pendingProperties,
        verifiedProperties,
        rooms: totalRooms,
        occupiedRooms,
        vacantRooms,
        beds: totalBeds,
        occupiedBeds,
        vacantBeds,
        users: totalUsers,
        monthlyRevenue: Number(totalPayments._sum.amount || 0),
        pendingPayments,
        activeBookings: totalBookings,
        pendingComplaints: openComplaints,
        resolvedComplaints,
      },
      charts: {
        revenue: revenue.length ? revenue : [],
        occupancy: [
          { category: 'Occupied Beds', value: occupiedBeds },
          { category: 'Vacant Beds', value: vacantBeds },
        ],
        bookings: bookingsTrend.length ? bookingsTrend : [],
        growth: growthTrend.length ? growthTrend : [],
      },
      recentActivities,
    };
  }

  /**
   * List all owners with user + property count
   */
  async getOwners(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [owners, total] = await Promise.all([
      prisma.ownerProfile.findMany({
        where: { is_deleted: false },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              first_name: true,
              last_name: true,
              phone: true,
              role: true,
              created_at: true,
              profile_image: { select: { url: true } },
            },
          },
          owner_documents: {
            where: { is_deleted: false },
          },
          _count: { select: { properties: true } },
        },
      }),
      prisma.ownerProfile.count({ where: { is_deleted: false } }),
    ]);

    const mappedOwners = owners.map((owner) => ({
      ...owner,
      company_name: owner.business_name,
      kyc_status: owner.verification_status === 'VERIFIED' ? 'APPROVED' : owner.verification_status,
    }));

    return { owners: mappedOwners, total, page, limit };
  }

  /**
   * Update owner verification_status
   */
  async verifyOwner(id: string, status: VerificationStatus, notes?: string) {
    const mappedStatus = (status as any) === 'APPROVED' ? VerificationStatus.VERIFIED : status;

    if ((mappedStatus as any) === VerificationStatus.REJECTED) {
      const profile = await prisma.ownerProfile.findUnique({
        where: { id },
        select: { user_id: true },
      });
      if (profile) {
        await prisma.$transaction([
          prisma.ownerDocument.deleteMany({ where: { owner_profile_id: id } }),
          prisma.ownerSubscription.deleteMany({ where: { owner_profile_id: id } }),
          prisma.property.deleteMany({ where: { owner_id: id } }),
          prisma.ownerProfile.delete({ where: { id } }),
          prisma.profileImage.deleteMany({ where: { user_id: profile.user_id } }),
          prisma.user.delete({ where: { id: profile.user_id } }),
        ]);
      }
      return { deleted: true };
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.ownerProfile.update({
        where: { id },
        data: {
          verification_status: mappedStatus,
          approval_notes: notes,
          ...(mappedStatus === VerificationStatus.VERIFIED ? { approved_at: new Date() } : {}),
          ...(((mappedStatus as any) === VerificationStatus.REJECTED) ? { rejected_at: new Date() } : {}),
        },
      });

      await AuditService.log(tx, {
        action: 'OWNER_VERIFY_ADMIN',
        entityName: 'OwnerProfile',
        entityId: id,
        newValues: { status: mappedStatus, notes },
      });

      await NotificationService.create(tx, {
        userId: updated.user_id,
        title: 'Owner Verification Updated',
        body: `Your owner verification status is now ${mappedStatus}.`,
        type: NotificationType.SYSTEM,
      });

      return updated;
    });
  }

  /**
   * List all properties with owner + location
   */
  async getProperties(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where: { is_deleted: false },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          owner: {
            include: {
              user: { select: { first_name: true, last_name: true, email: true } },
            },
          },
          area: { select: { name: true, city: { select: { name: true, state: { select: { name: true } } } } } },
          images: { where: { is_deleted: false }, orderBy: { created_at: 'asc' } },
          _count: { select: { floors: true } },
        },
      }),
      prisma.property.count({ where: { is_deleted: false } }),
    ]);

    const mappedProperties = properties.map((prop) => ({
      ...prop,
      city: { name: prop.area?.city?.name || prop.city || '' },
      state: { name: prop.area?.city?.state?.name || prop.state || '' },
      kyc_status:
        prop.approval_status === VerificationStatus.VERIFIED
          ? 'APPROVED'
          : prop.approval_status,
      property_images: (prop.images || []).map((img) => ({ image_url: img.url })),
    }));

    return { properties: mappedProperties, total, page, limit };
  }

  /**
   * Update property approval_status
   */
  async verifyProperty(id: string, status: VerificationStatus, notes?: string) {
    const mappedStatus =
      (status as any) === 'APPROVED'
        ? VerificationStatus.VERIFIED
        : (status as any) === 'PENDING'
          ? VerificationStatus.PENDING
          : status;

    return prisma.$transaction(async (tx) => {
      const property = await tx.property.update({
        where: { id },
        data: {
          approval_status: mappedStatus,
          approval_notes: notes,
          ...(mappedStatus === VerificationStatus.VERIFIED ? { approved_at: new Date() } : {}),
          ...(mappedStatus === VerificationStatus.REJECTED ? { rejected_at: new Date() } : {}),
        },
        include: { owner: true },
      });

      await AuditService.log(tx, {
        action: 'PROPERTY_VERIFY_ADMIN',
        entityName: 'Property',
        entityId: id,
        newValues: { status: mappedStatus, notes },
      });

      await NotificationService.create(tx, {
        userId: property.owner.user_id,
        title: 'Property Verification Updated',
        body: `Your property "${property.name}" status is now ${mappedStatus}.`,
        type: NotificationType.SYSTEM,
      });

      return property;
    });
  }

  /**
   * List all bookings
   */
  async getBookings(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where: { is_deleted: false },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          tenant: {
            include: { user: { select: { first_name: true, last_name: true, email: true, phone: true } } },
          },
          bed: {
            include: {
              room: {
                include: {
                  floor: {
                    include: {
                      property: { select: { id: true, name: true, address: true } },
                    },
                  },
                },
              },
            },
          },
        },
      }),
      prisma.booking.count({ where: { is_deleted: false } }),
    ]);
    return { bookings, total, page, limit };
  }

  /**
   * List all complaints
   */
  async getComplaints(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [complaints, total] = await Promise.all([
      prisma.complaint.findMany({
        where: { is_deleted: false },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          tenant: {
            include: { user: { select: { first_name: true, last_name: true } } },
          },
          property: { select: { id: true, name: true, address: true } },
        },
      }),
      prisma.complaint.count({ where: { is_deleted: false } }),
    ]);
    return { complaints, total, page, limit };
  }

  /**
   * List all managers
   */
  async getManagers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    return prisma.managerProfile.findMany({
      where: { is_deleted: false },
      skip,
      take: limit,
      include: {
        user: { select: { id: true, email: true, first_name: true, last_name: true, phone: true } },
      },
    });
  }

  /**
   * List all users
   */
  async getUsers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: { is_deleted: false },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        select: {
          id: true, email: true, first_name: true, last_name: true,
          phone: true, role: true, status: true, created_at: true,
        },
      }),
      prisma.user.count({ where: { is_deleted: false } }),
    ]);
    return { users, total, page, limit };
  }

  /**
   * List all payments
   */
  async getPayments(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where: { is_deleted: false },
        skip,
        take: limit,
        orderBy: { payment_date: 'desc' },
        include: {
          tenant: { include: { user: { select: { first_name: true, last_name: true, email: true } } } },
        },
      }),
      prisma.payment.count({ where: { is_deleted: false } }),
    ]);
    return { payments, total, page, limit };
  }
}

export default AdminRepository;
