import { prisma } from '../../config/database';
import { NotificationType, Prisma, VerificationStatus, PropertyStatus, BookingStatus, ComplaintStatus, BedOccupancyStatus } from '@prisma/client';
import AuditService from '../../shared/services/audit.service';
import NotificationService from '../../shared/services/notification.service';

export class OwnerRepository {
  async getApplicationStatus(ownerProfileId: string) {
    const profile = await prisma.ownerProfile.findUnique({
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

  async getProfile(ownerProfileId: string) {
    return prisma.ownerProfile.findUnique({
      where: { id: ownerProfileId },
      include: { user: true },
    });
  }

  async getDashboardStats(ownerProfileId: string, propertyId?: string) {
    const propFilter = propertyId ? { id: propertyId } : undefined;

    // Properties owned by this owner
    const [
      propertiesCount,
      pendingPropertiesCount,
      verifiedPropertiesCount,
      bookingsCount,
      pendingBookingsCount,
      confirmedBookingsCount,
      openComplaintsCount,
      resolvedComplaintsCount,
    ] = await Promise.all([
      prisma.property.count({ where: { ...(propertyId ? { id: propertyId } : {}), owner_id: ownerProfileId, is_deleted: false } }),
      prisma.property.count({ where: { ...(propertyId ? { id: propertyId } : {}), owner_id: ownerProfileId, approval_status: VerificationStatus.PENDING, is_deleted: false } }),
      prisma.property.count({ where: { ...(propertyId ? { id: propertyId } : {}), owner_id: ownerProfileId, approval_status: VerificationStatus.VERIFIED, is_deleted: false } }),
      prisma.booking.count({ where: { bed: { room: { floor: { property: { ...(propertyId ? { id: propertyId } : {}), owner_id: ownerProfileId } } } }, is_deleted: false } }),
      prisma.booking.count({ where: { bed: { room: { floor: { property: { ...(propertyId ? { id: propertyId } : {}), owner_id: ownerProfileId } } } }, status: BookingStatus.PENDING, is_deleted: false } }),
      prisma.booking.count({ where: { bed: { room: { floor: { property: { ...(propertyId ? { id: propertyId } : {}), owner_id: ownerProfileId } } } }, status: BookingStatus.APPROVED, is_deleted: false } }),
      prisma.complaint.count({ where: { ...(propertyId ? { property_id: propertyId } : {}), property: { owner_id: ownerProfileId }, status: ComplaintStatus.OPEN, is_deleted: false } }),
      prisma.complaint.count({ where: { ...(propertyId ? { property_id: propertyId } : {}), property: { owner_id: ownerProfileId }, status: ComplaintStatus.RESOLVED, is_deleted: false } }),
    ]);

    const [
      floorsCount,
      roomsCount,
      bedsCount,
      occupiedBedsCount,
      vacantBedsCount,
      reservedBedsCount,
      activeTenantsCount,
    ] = await Promise.all([
      prisma.floor.count({ where: { ...(propertyId ? { property_id: propertyId } : {}), property: { owner_id: ownerProfileId }, is_deleted: false } }),
      prisma.room.count({ where: { floor: { ...(propertyId ? { property_id: propertyId } : {}), property: { owner_id: ownerProfileId } }, is_deleted: false } }),
      prisma.bed.count({ where: { room: { floor: { ...(propertyId ? { property_id: propertyId } : {}), property: { owner_id: ownerProfileId } } }, is_deleted: false } }),
      prisma.bed.count({ where: { room: { floor: { ...(propertyId ? { property_id: propertyId } : {}), property: { owner_id: ownerProfileId } } }, occupancy_status: BedOccupancyStatus.OCCUPIED, is_deleted: false } }),
      prisma.bed.count({ where: { room: { floor: { ...(propertyId ? { property_id: propertyId } : {}), property: { owner_id: ownerProfileId } } }, occupancy_status: BedOccupancyStatus.VACANT, is_deleted: false } }),
      prisma.bed.count({ where: { room: { floor: { ...(propertyId ? { property_id: propertyId } : {}), property: { owner_id: ownerProfileId } } }, occupancy_status: BedOccupancyStatus.RESERVED, is_deleted: false } }),
      prisma.tenantProfile.count({ where: { bookings: { some: { bed: { room: { floor: { property: { ...(propertyId ? { id: propertyId } : {}), owner_id: ownerProfileId } } } }, status: BookingStatus.MOVE_IN } }, is_deleted: false } }),
    ]);

    // Let's get recent activities from DB for this owner
    const [recentBookings, recentComplaints] = await Promise.all([
      prisma.booking.findMany({
        take: 5,
        where: { bed: { room: { floor: { property: { ...(propertyId ? { id: propertyId } : {}), owner_id: ownerProfileId } } } }, is_deleted: false },
        orderBy: { created_at: 'desc' },
        include: { tenant: { include: { user: true } }, bed: { include: { room: { include: { floor: { include: { property: true } } } } } } },
      }),
      prisma.complaint.findMany({
        take: 5,
        where: { ...(propertyId ? { property_id: propertyId } : {}), property: { owner_id: ownerProfileId }, is_deleted: false },
        orderBy: { created_at: 'desc' },
        include: { tenant: { include: { user: true } } },
      }),
    ]);

    const recentActivities: any[] = [];
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

  async getProperties(ownerProfileId: string) {
    return prisma.property.findMany({
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

  async createProperty(ownerProfileId: string, data: any) {
    const rulesText = [
      data.description ? `Description: ${data.description}` : '',
      data.rules || '',
    ]
      .filter(Boolean)
      .join('\n');

    return prisma.$transaction(async (tx) => {
      const property = await tx.property.create({
        data: {
          owner_id: ownerProfileId,
          name: data.name,
          address: data.address || data.address_line1 || '',
          zip_code: data.zip_code || '000000',
          city: data.city || '',
          state: data.state || '',
          rules: rulesText || data.rules || '',
          amenities: Array.isArray(data.amenities) ? data.amenities : [],
          status: PropertyStatus.ACTIVE,
          approval_status: VerificationStatus.PENDING,
        },
        include: { owner: true },
      });

      await AuditService.log(tx, {
        action: 'PROPERTY_CREATE',
        entityName: 'Property',
        entityId: property.id,
        newValues: { name: property.name, city: property.city, state: property.state },
      });

      await NotificationService.create(tx, {
        userId: property.owner.user_id,
        title: 'Property Submitted',
        body: `Your property "${property.name}" has been created and is pending verification.`,
        type: NotificationType.SYSTEM,
      });

      return property;
    });
  }

  async getPropertyDetail(ownerProfileId: string, id: string) {
    return prisma.property.findFirst({
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

  async updateProperty(ownerProfileId: string, id: string, data: any) {
    return prisma.$transaction(async (tx) => {
      const property = await tx.property.update({
        where: { id },
        data: {
          name: data.name,
          address: data.address,
          zip_code: data.zip_code,
          city: data.city,
          state: data.state,
          rules: data.rules,
          approval_status: VerificationStatus.PENDING,
          approval_notes: null,
        },
        include: { owner: true },
      });

      await AuditService.log(tx, {
        action: 'PROPERTY_UPDATE',
        entityName: 'Property',
        entityId: property.id,
        newValues: { name: property.name, city: property.city, state: property.state },
      });

      await NotificationService.create(tx, {
        userId: property.owner.user_id,
        title: 'Property Updated',
        body: `Your property "${property.name}" has been updated and is pending re-verification.`,
        type: NotificationType.SYSTEM,
      });

      return property;
    });
  }

  async deactivateProperty(ownerProfileId: string, id: string) {
    return prisma.$transaction(async (tx) => {
      const property = await tx.property.update({
        where: { id },
        data: { status: PropertyStatus.INACTIVE },
        include: { owner: true },
      });

      await AuditService.log(tx, {
        action: 'PROPERTY_DEACTIVATE',
        entityName: 'Property',
        entityId: property.id,
        newValues: { status: PropertyStatus.INACTIVE },
      });

      await NotificationService.create(tx, {
        userId: property.owner.user_id,
        title: 'Property Deactivated',
        body: `Your property "${property.name}" has been deactivated.`,
        type: NotificationType.SYSTEM,
      });

      return property;
    });
  }

  async uploadPropertyImage(ownerProfileId: string, propertyId: string, imageUrl: string) {
    const property = await prisma.property.findFirst({
      where: { id: propertyId, owner_id: ownerProfileId },
    });

    if (!property) {
      throw new Error('Property not found or access denied');
    }

    return prisma.$transaction(async (tx) => {
      const image = await tx.propertyImage.create({
        data: {
          property_id: propertyId,
          url: imageUrl,
          path: imageUrl,
          is_primary: false,
        },
      });

      await AuditService.log(tx, {
        action: 'PROPERTY_IMAGE_UPLOAD',
        entityName: 'PropertyImage',
        entityId: image.id,
        newValues: { propertyId, imageUrl },
      });

      return image;
    });
  }

  async deletePropertyImage(ownerProfileId: string, propertyId: string, imageId: string) {
    const image = await prisma.propertyImage.findFirst({
      where: {
        id: imageId,
        property_id: propertyId,
        is_deleted: false,
        property: { owner_id: ownerProfileId, is_deleted: false },
      },
    });

    if (!image) {
      throw new Error('Property image not found or access denied');
    }

    return prisma.$transaction(async (tx) => {
      const deleted = await tx.propertyImage.update({
        where: { id: imageId },
        data: { is_deleted: true, deleted_at: new Date() },
      });

      await AuditService.log(tx, {
        action: 'PROPERTY_IMAGE_DELETE',
        entityName: 'PropertyImage',
        entityId: imageId,
        newValues: { propertyId },
      });

      return deleted;
    });
  }

  async getBookings(ownerProfileId: string) {
    return prisma.booking.findMany({
      where: { bed: { room: { floor: { property: { owner_id: ownerProfileId } } } }, is_deleted: false },
      include: {
        tenant: { include: { user: true } },
        bed: { include: { room: { include: { floor: { include: { property: true } } } } } },
      },
    });
  }

  async verifyBooking(ownerProfileId: string, id: string, data: any) {
    return prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findFirst({
        where: { id, bed: { room: { floor: { property: { owner_id: ownerProfileId } } } } },
        include: { tenant: true },
      });

      if (!booking) {
        throw new Error('Booking not found or access denied');
      }

      const updated = await tx.booking.update({
        where: { id },
        data: { status: data.status as BookingStatus },
      });

      await AuditService.log(tx, {
        action: 'BOOKING_VERIFY',
        entityName: 'Booking',
        entityId: booking.id,
        newValues: { status: data.status },
      });

      await NotificationService.create(tx, {
        userId: booking.tenant.user_id,
        title: 'Booking Status Updated',
        body: `Your booking status is now ${data.status}.`,
        type: NotificationType.BOOKING_STATUS,
      });

      return updated;
    });
  }

  async getNotifications(userId: string) {
    return prisma.notification.findMany({
      where: { user_id: userId, is_deleted: false },
      orderBy: { created_at: 'desc' },
    });
  }

  async markNotificationAsRead(userId: string, notificationId: string) {
    return prisma.notification.updateMany({
      where: { id: notificationId, user_id: userId },
      data: {
        is_read: true,
        read_at: new Date(),
      },
    });
  }

  async sendNotification(userId: string, title: string, body: string, type: NotificationType = NotificationType.SYSTEM) {
    return prisma.$transaction(async (tx) => {
      const result = await NotificationService.create(tx, {
        userId,
        title,
        body,
        type,
      });

      await AuditService.log(tx, {
        action: 'NOTIFICATION_SEND',
        entityName: 'Notification',
        entityId: result.notification.id,
        newValues: { userId, title, body, type },
      });

      return result.notification;
    });
  }

  async getComplaints(ownerProfileId: string) {
    return prisma.complaint.findMany({
      where: { property: { owner_id: ownerProfileId }, is_deleted: false },
      include: {
        tenant: { include: { user: true } },
        property: true,
        room: true,
      },
    });
  }

  async getTenants(ownerProfileId: string) {
    return prisma.tenantProfile.findMany({
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

  async getTenantDetail(ownerProfileId: string, tenantId: string) {
    return prisma.tenantProfile.findFirst({
      where: {
        id: tenantId,
        is_deleted: false,
        bookings: {
          some: {
            is_deleted: false,
            bed: { room: { floor: { property: { owner_id: ownerProfileId, is_deleted: false } } } },
          },
        },
      },
      include: {
        user: true,
        bookings: {
          where: { is_deleted: false },
          orderBy: { created_at: 'desc' },
          include: {
            bed: {
              include: {
                room: {
                  include: {
                    floor: { include: { property: true } },
                  },
                },
              },
            },
          },
        },
        complaints: {
          where: { is_deleted: false },
          orderBy: { created_at: 'desc' },
          include: { property: true, room: true },
        },
      },
    });
  }

  async resubmitDocuments(ownerProfileId: string, data: any) {
    const { id_url, pan_url, property_proof_url, profile_photo_url } = data;

    // 1. Update verification status back to PENDING and clear rejection messages
    const profile = await prisma.ownerProfile.update({
      where: { id: ownerProfileId },
      data: {
        verification_status: VerificationStatus.PENDING,
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
        const existing = await prisma.ownerDocument.findFirst({
          where: { owner_profile_id: ownerProfileId, type: doc.type as any, is_deleted: false },
        });

        if (existing) {
          await prisma.ownerDocument.update({
            where: { id: existing.id },
            data: { url: doc.url, path: doc.url },
          });
        } else {
          await prisma.ownerDocument.create({
            data: {
              owner_profile_id: ownerProfileId,
              type: doc.type as any,
              url: doc.url,
              path: doc.url,
              status: VerificationStatus.PENDING,
            },
          });
        }
      }
    }

    // 3. Upsert Profile Image
    if (profile_photo_url) {
      const existingImg = await prisma.profileImage.findFirst({
        where: { user_id: profile.user_id },
      });

      if (existingImg) {
        await prisma.profileImage.update({
          where: { id: existingImg.id },
          data: { url: profile_photo_url, path: profile_photo_url },
        });
      } else {
        await prisma.profileImage.create({
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

  async getBookingTimeline(ownerProfileId: string, bookingId: string) {
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        is_deleted: false,
        bed: { room: { floor: { property: { owner_id: ownerProfileId, is_deleted: false } } } },
      },
      include: {
        tenant: { include: { user: true } },
        bed: { include: { room: { include: { floor: { include: { property: true } } } } } },
      },
    });

    if (!booking) {
      throw new Error('Booking not found or access denied');
    }

    const timeline = [
      {
        id: `${booking.id}-created`,
        type: 'BOOKING_CREATED',
        title: 'Booking Created',
        description: `Booking created for ${booking.tenant.user.first_name || 'tenant'} in room ${booking.bed.room.room_number}`,
        timestamp: booking.created_at.toISOString(),
      },
      {
        id: `${booking.id}-expected-move-in`,
        type: 'EXPECTED_MOVE_IN',
        title: 'Expected Move In',
        description: `Expected move-in date set to ${booking.expected_move_in.toISOString()}`,
        timestamp: booking.expected_move_in.toISOString(),
      },
    ];

    if (booking.actual_move_in) {
      timeline.push({
        id: `${booking.id}-actual-move-in`,
        type: 'MOVE_IN',
        title: 'Tenant Checked In',
        description: 'Tenant has checked into the bed.',
        timestamp: booking.actual_move_in.toISOString(),
      });
    }

    if (booking.actual_move_out) {
      timeline.push({
        id: `${booking.id}-actual-move-out`,
        type: 'MOVE_OUT',
        title: 'Tenant Checked Out',
        description: 'Tenant has checked out from the bed.',
        timestamp: booking.actual_move_out.toISOString(),
      });
    }

    return {
      bookingId: booking.id,
      status: booking.status,
      timeline: timeline.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
    };
  }

  async listFloors(ownerProfileId: string, propertyId: string) {
    const property = await prisma.property.findFirst({
      where: { id: propertyId, owner_id: ownerProfileId, is_deleted: false },
    });
    if (!property) throw new Error('Property not found or access denied');

    return prisma.floor.findMany({
      where: { property_id: propertyId, is_deleted: false },
      include: { rooms: { where: { is_deleted: false }, include: { beds: { where: { is_deleted: false } } } } },
    });
  }

  async createFloor(ownerProfileId: string, propertyId: string, name: string) {
    const count = await prisma.floor.count({
      where: { property_id: propertyId, is_deleted: false },
    });

    return prisma.floor.create({
      data: {
        property_id: propertyId,
        name,
        floor_number: count + 1,
      },
    });
  }


  async replyComplaint(ownerProfileId: string, complaintId: string, userId: string, message: string) {
    const complaint = await prisma.complaint.findFirst({
      where: { id: complaintId, is_deleted: false, property: { owner_id: ownerProfileId, is_deleted: false } },
      include: { tenant: true },
    });

    if (!complaint) {
      throw new Error('Complaint not found or access denied');
    }

    return prisma.$transaction(async (tx) => {
      const comment = await tx.complaintComment.create({
        data: {
          complaint_id: complaintId,
          user_id: userId,
          content: message,
        },
      });

      await AuditService.log(tx, {
        action: 'COMPLAINT_REPLY',
        entityName: 'Complaint',
        entityId: complaintId,
        newValues: { message },
      });

      await NotificationService.create(tx, {
        userId: complaint.tenant.user_id,
        title: 'Complaint Reply Received',
        body: message,
        type: NotificationType.COMPLAINT_UPDATE,
      });

      return comment;
    });
  }

  async assignComplaint(ownerProfileId: string, complaintId: string, userId: string, staffName: string) {
    const complaint = await prisma.complaint.findFirst({
      where: { id: complaintId, is_deleted: false, property: { owner_id: ownerProfileId, is_deleted: false } },
      include: { tenant: true, property: true },
    });

    if (!complaint) {
      throw new Error('Complaint not found or access denied');
    }

    return prisma.$transaction(async (tx) => {
      let staff = await tx.staff.findFirst({
        where: { property_id: complaint.property_id, name: staffName, is_deleted: false },
      });

      if (!staff) {
        staff = await tx.staff.create({
          data: {
            property_id: complaint.property_id,
            name: staffName,
            role: 'MAINTENANCE_TECH',
          },
        });
      }

      const maintenanceRequest = await tx.maintenanceRequest.create({
        data: {
          property_id: complaint.property_id,
          staff_id: staff.id,
          complaint_id: complaint.id,
          title: complaint.title,
          description: complaint.description,
          status: ComplaintStatus.IN_PROGRESS,
        },
      });

      const updatedComplaint = await tx.complaint.update({
        where: { id: complaint.id },
        data: { status: ComplaintStatus.ASSIGNED },
      });

      await tx.complaintComment.create({
        data: {
          complaint_id: complaint.id,
          user_id: userId,
          content: `Assigned to maintenance staff: ${staff.name}`,
        },
      });

      await AuditService.log(tx, {
        action: 'COMPLAINT_ASSIGN',
        entityName: 'Complaint',
        entityId: complaintId,
        newValues: { staffName: staff.name, maintenanceRequestId: maintenanceRequest.id },
      });

      await NotificationService.create(tx, {
        userId: complaint.tenant.user_id,
        title: 'Complaint Assigned',
        body: `Your complaint "${complaint.title}" has been assigned to ${staff.name}.`,
        type: NotificationType.COMPLAINT_UPDATE,
      });

      return updatedComplaint;
    });
  }

  async updateComplaintStatus(ownerProfileId: string, complaintId: string, userId: string, status: ComplaintStatus, notes?: string) {
    const complaint = await prisma.complaint.findFirst({
      where: { id: complaintId, is_deleted: false, property: { owner_id: ownerProfileId, is_deleted: false } },
      include: { tenant: true },
    });

    if (!complaint) {
      throw new Error('Complaint not found or access denied');
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.complaint.update({
        where: { id: complaint.id },
        data: {
          status,
          ...(status === ComplaintStatus.RESOLVED ? { resolved_at: new Date() } : {}),
        },
      });

      if (notes && notes.trim().length > 0) {
        await tx.complaintComment.create({
          data: {
            complaint_id: complaint.id,
            user_id: userId,
            content: notes,
          },
        });
      }

      await AuditService.log(tx, {
        action: 'COMPLAINT_STATUS_UPDATE',
        entityName: 'Complaint',
        entityId: complaintId,
        newValues: { status, notes: notes || null },
      });

      await NotificationService.create(tx, {
        userId: complaint.tenant.user_id,
        title: 'Complaint Status Updated',
        body: `Your complaint "${complaint.title}" is now ${status}.${notes ? ` ${notes}` : ''}`,
        type: NotificationType.COMPLAINT_UPDATE,
      });

      return updated;
    });
  }

  async getReports(ownerProfileId: string) {
    const [properties, complaints, bookings, occupiedBeds, vacantBeds] = await Promise.all([
      prisma.property.count({ where: { owner_id: ownerProfileId, is_deleted: false } }),
      prisma.complaint.count({ where: { property: { owner_id: ownerProfileId }, is_deleted: false } }),
      prisma.booking.count({ where: { bed: { room: { floor: { property: { owner_id: ownerProfileId } } } }, is_deleted: false } }),
      prisma.bed.count({ where: { room: { floor: { property: { owner_id: ownerProfileId } } }, occupancy_status: BedOccupancyStatus.OCCUPIED, is_deleted: false } }),
      prisma.bed.count({ where: { room: { floor: { property: { owner_id: ownerProfileId } } }, occupancy_status: BedOccupancyStatus.VACANT, is_deleted: false } }),
    ]);

    return {
      occupancy: { properties, occupiedBeds, vacantBeds },
      complaints: { total: complaints },
      bookings: { total: bookings },
    };
  }

  async searchAll(ownerProfileId: string, query: string) {
    const q = query.trim();
    if (!q) {
      return { properties: [], tenants: [], bookings: [], complaints: [] };
    }

    const [properties, tenants, bookings, complaints] = await Promise.all([
      prisma.property.findMany({
        where: { owner_id: ownerProfileId, is_deleted: false, name: { contains: q, mode: 'insensitive' } },
        take: 10,
      }),
      prisma.tenantProfile.findMany({
        where: {
          is_deleted: false,
          bookings: { some: { bed: { room: { floor: { property: { owner_id: ownerProfileId } } } } } },
          user: {
            OR: [
              { first_name: { contains: q, mode: 'insensitive' } },
              { last_name: { contains: q, mode: 'insensitive' } },
            ],
          },
        },
        include: { user: true },
        take: 10,
      }),
      prisma.booking.findMany({
        where: {
          is_deleted: false,
          bed: { room: { floor: { property: { owner_id: ownerProfileId } } } },
          tenant: { user: { first_name: { contains: q, mode: 'insensitive' } } },
        },
        include: { tenant: { include: { user: true } } },
        take: 10,
      }),
      prisma.complaint.findMany({
        where: {
          is_deleted: false,
          property: { owner_id: ownerProfileId },
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 10,
      }),
    ]);

    return { properties, tenants, bookings, complaints };
  }
  async updateFloor(ownerProfileId: string, propertyId: string, floorId: string, name: string) {
    const floor = await prisma.floor.findFirst({
      where: { id: floorId, property_id: propertyId, property: { owner_id: ownerProfileId }, is_deleted: false },
    });
    if (!floor) throw new Error('Floor not found or access denied');

    return prisma.floor.update({
      where: { id: floorId },
      data: { name },
    });
  }

  async deleteFloor(ownerProfileId: string, propertyId: string, floorId: string) {
    const floor = await prisma.floor.findFirst({
      where: { id: floorId, property_id: propertyId, property: { owner_id: ownerProfileId }, is_deleted: false },
      include: { rooms: { where: { is_deleted: false } } },
    });
    if (!floor) throw new Error('Floor not found or access denied');
    if (floor.rooms.length > 0) throw new Error('Cannot delete floor containing rooms');

    return prisma.floor.update({
      where: { id: floorId },
      data: { is_deleted: true, deleted_at: new Date() },
    });
  }

  async listRooms(ownerProfileId: string, floorId: string) {
    const floor = await prisma.floor.findFirst({
      where: { id: floorId, property: { owner_id: ownerProfileId }, is_deleted: false },
    });
    if (!floor) throw new Error('Floor not found or access denied');

    return prisma.room.findMany({
      where: { floor_id: floorId, is_deleted: false },
      include: { beds: { where: { is_deleted: false } } },
    });
  }

  private getSharingType(capacity: number) {
    if (capacity === 1) return 'SINGLE';
    if (capacity === 2) return 'DOUBLE';
    if (capacity === 3) return 'TRIPLE';
    if (capacity === 4) return 'FOUR_SHARING';
    return 'OTHER';
  }

  async createRoom(ownerProfileId: string, floorId: string, data: any) {
    const floor = await prisma.floor.findFirst({
      where: { id: floorId, property: { owner_id: ownerProfileId }, is_deleted: false },
    });
    if (!floor) throw new Error('Floor not found or access denied');

    const capacity = parseInt(data.sharing_capacity) || 1;

    return prisma.room.create({
      data: {
        floor_id: floorId,
        room_number: data.room_number,
        sharing_type: this.getSharingType(capacity) as any,
        room_type: data.room_type || 'NON_AC',
      },
    });
  }

  async updateRoom(ownerProfileId: string, roomId: string, data: any) {
    const room = await prisma.room.findFirst({
      where: { id: roomId, floor: { property: { owner_id: ownerProfileId } }, is_deleted: false },
    });
    if (!room) throw new Error('Room not found or access denied');

    const capacity = parseInt(data.sharing_capacity) || 1;

    return prisma.room.update({
      where: { id: roomId },
      data: {
        room_number: data.room_number,
        sharing_type: this.getSharingType(capacity) as any,
        room_type: data.room_type,
      },
    });
  }

  async deleteRoom(ownerProfileId: string, roomId: string) {
    const room = await prisma.room.findFirst({
      where: { id: roomId, floor: { property: { owner_id: ownerProfileId } }, is_deleted: false },
      include: { beds: { where: { is_deleted: false } } },
    });
    if (!room) throw new Error('Room not found or access denied');
    if (room.beds.length > 0) throw new Error('Cannot delete room containing beds');

    return prisma.room.update({
      where: { id: roomId },
      data: { is_deleted: true, deleted_at: new Date() },
    });
  }

  async listBeds(ownerProfileId: string, roomId: string) {
    const room = await prisma.room.findFirst({
      where: { id: roomId, floor: { property: { owner_id: ownerProfileId } }, is_deleted: false },
    });
    if (!room) throw new Error('Room not found or access denied');

    return prisma.bed.findMany({
      where: { room_id: roomId, is_deleted: false },
    });
  }

  async createBed(ownerProfileId: string, roomId: string, bedNumber: string, data: any = {}) {
    const room = await prisma.room.findFirst({
      where: { id: roomId, floor: { property: { owner_id: ownerProfileId } }, is_deleted: false },
    });
    if (!room) throw new Error('Room not found or access denied');

    return prisma.bed.create({
      data: {
        room_id: roomId,
        bed_number: bedNumber,
        rent: new Prisma.Decimal(data.rent || 10000),
        security_deposit: new Prisma.Decimal(data.security_deposit || 10000),
        occupancy_status: BedOccupancyStatus.VACANT,
      },
    });
  }

  async updateBed(ownerProfileId: string, bedId: string, data: any) {
    const bed = await prisma.bed.findFirst({
      where: { id: bedId, room: { floor: { property: { owner_id: ownerProfileId } } }, is_deleted: false },
    });
    if (!bed) throw new Error('Bed not found or access denied');

    return prisma.bed.update({
      where: { id: bedId },
      data: {
        bed_number: data.bed_number !== undefined ? data.bed_number : undefined,
        occupancy_status: data.status !== undefined ? (data.status as BedOccupancyStatus) : undefined,
        rent: data.rent !== undefined ? new Prisma.Decimal(data.rent) : undefined,
        security_deposit: data.security_deposit !== undefined ? new Prisma.Decimal(data.security_deposit) : undefined,
      },
    });
  }

  async deleteBed(ownerProfileId: string, bedId: string) {
    const bed = await prisma.bed.findFirst({
      where: { id: bedId, room: { floor: { property: { owner_id: ownerProfileId } } }, is_deleted: false },
    });
    if (!bed) throw new Error('Bed not found or access denied');
    if (bed.occupancy_status === BedOccupancyStatus.OCCUPIED) {
      throw new Error('Cannot delete an occupied bed');
    }

    return prisma.bed.update({
      where: { id: bedId },
      data: { is_deleted: true, deleted_at: new Date() },
    });
  }
}
