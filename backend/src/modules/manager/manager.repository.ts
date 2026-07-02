import { prisma } from '../../config/database';
import { NotificationType, VerificationStatus, BookingStatus, ComplaintStatus, UserRole } from '@prisma/client';
import AuditService from '../../shared/services/audit.service';
import NotificationService from '../../shared/services/notification.service';

export class ManagerRepository {
  async getDashboardStats() {
    const [
      pendingOwners,
      pendingProperties,
      pendingBookings,
      openComplaints,
      resolvedComplaints,
      inProgressComplaints,
    ] = await Promise.all([
      prisma.ownerProfile.count({ where: { verification_status: VerificationStatus.PENDING, is_deleted: false } }),
      prisma.property.count({ where: { approval_status: VerificationStatus.PENDING, is_deleted: false } }),
      prisma.booking.count({ where: { status: BookingStatus.PENDING, is_deleted: false } }),
      prisma.complaint.count({ where: { status: ComplaintStatus.OPEN, is_deleted: false } }),
      prisma.complaint.count({ where: { status: ComplaintStatus.RESOLVED, is_deleted: false } }),
      prisma.complaint.count({ where: { status: ComplaintStatus.IN_PROGRESS, is_deleted: false } }),
    ]);

    // Let's retrieve recent activities from DB if possible. We can query recent complaints, bookings, owner signups.
    const [recentOwners, recentProperties, recentComplaints, recentBookings] = await Promise.all([
      prisma.ownerProfile.findMany({
        take: 3,
        where: { is_deleted: false },
        orderBy: { created_at: 'desc' },
        include: { user: true },
      }),
      prisma.property.findMany({
        take: 3,
        where: { is_deleted: false },
        orderBy: { created_at: 'desc' },
      }),
      prisma.complaint.findMany({
        take: 3,
        where: { is_deleted: false },
        orderBy: { created_at: 'desc' },
        include: { tenant: { include: { user: true } } },
      }),
      prisma.booking.findMany({
        take: 3,
        where: { is_deleted: false },
        orderBy: { created_at: 'desc' },
        include: { tenant: { include: { user: true } } },
      }),
    ]);

    const recentActivities: any[] = [];
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
      prisma.ownerProfile.findMany({
        where: { is_deleted: false, created_at: { gte: sixMonthsAgo } },
        select: { created_at: true, verification_status: true },
      }),
      prisma.property.findMany({
        where: { is_deleted: false, created_at: { gte: sixMonthsAgo } },
        select: { created_at: true, approval_status: true },
      }),
    ]);

    const ownerTrendMap: Record<string, { pending: number; approved: number }> = {};
    for (const o of ownersForTrend) {
      const key = o.created_at.toLocaleString('en-US', { month: 'short', year: '2-digit' });
      if (!ownerTrendMap[key]) {
        ownerTrendMap[key] = { pending: 0, approved: 0 };
      }
      if (o.verification_status === VerificationStatus.PENDING) {
        ownerTrendMap[key].pending += 1;
      } else if (o.verification_status === VerificationStatus.VERIFIED) {
        ownerTrendMap[key].approved += 1;
      }
    }
    const ownerVerificationTrend = Object.entries(ownerTrendMap).map(([date, { pending, approved }]) => ({
      date,
      pending,
      approved,
    }));

    const propertyTrendMap: Record<string, { pending: number; approved: number }> = {};
    for (const p of propertiesForTrend) {
      const key = p.created_at.toLocaleString('en-US', { month: 'short', year: '2-digit' });
      if (!propertyTrendMap[key]) {
        propertyTrendMap[key] = { pending: 0, approved: 0 };
      }
      if (p.approval_status === VerificationStatus.PENDING) {
        propertyTrendMap[key].pending += 1;
      } else if (p.approval_status === VerificationStatus.VERIFIED) {
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
      prisma.complaint.count({
        where: {
          status: { in: [ComplaintStatus.ASSIGNED, ComplaintStatus.IN_PROGRESS] },
          assigned_to_id: { not: null },
          is_deleted: false,
        },
      }),
      prisma.complaint.count({
        where: {
          status: ComplaintStatus.RESOLVED,
          resolved_at: { gte: today },
          is_deleted: false,
        },
      }),
      prisma.complaint.findMany({
        where: {
          status: ComplaintStatus.RESOLVED,
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
        const diffMs = new Date(c.resolved_at!).getTime() - new Date(c.created_at).getTime();
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
    const owners = await prisma.ownerProfile.findMany({
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

  async verifyOwner(id: string, status: VerificationStatus, notes: string) {
    const mappedStatus = (status as any) === 'APPROVED' ? VerificationStatus.VERIFIED : status;

    if (mappedStatus === VerificationStatus.REJECTED) {
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
        },
      });

      await AuditService.log(tx, {
        action: 'OWNER_VERIFY',
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

  async requestOwnerDocuments(id: string, documentTypes: string[], notes: string) {
    const documentStr = documentTypes.join(', ');
    const fullNotes = `Requested documents: ${documentStr}. Notes: ${notes}`;
    return prisma.$transaction(async (tx) => {
      const updated = await tx.ownerProfile.update({
        where: { id },
        data: {
          verification_status: VerificationStatus.REJECTED,
          rejection_reason: fullNotes,
          approval_notes: fullNotes,
        },
      });

      await AuditService.log(tx, {
        action: 'OWNER_DOCUMENTS_REQUESTED',
        entityName: 'OwnerProfile',
        entityId: id,
        newValues: { documentTypes, notes: fullNotes },
      });

      await NotificationService.create(tx, {
        userId: updated.user_id,
        title: 'Additional Documents Required',
        body: fullNotes,
        type: NotificationType.SYSTEM,
      });

      return updated;
    });
  }

  async suspendOwner(id: string, notes: string) {
    return prisma.$transaction(async (tx) => {
      const updated = await tx.ownerProfile.update({
        where: { id },
        data: {
          verification_status: VerificationStatus.REJECTED,
          approval_notes: `Suspended: ${notes}`,
        },
      });

      await AuditService.log(tx, {
        action: 'OWNER_SUSPEND',
        entityName: 'OwnerProfile',
        entityId: id,
        newValues: { notes },
      });

      await NotificationService.create(tx, {
        userId: updated.user_id,
        title: 'Owner Account Suspended',
        body: `Your owner account has been suspended. Reason: ${notes}`,
        type: NotificationType.SYSTEM,
      });

      return updated;
    });
  }

  async getVerificationHistory(id: string) {
    // If there is no specific audit/verification history model, we can return log entries or empty array.
    // Wait, is there an AuditLog or ActivityLog model? Yes, we saw User has audit_logs and activity_logs relations.
    // Let's check schema.prisma for AuditLog or activity_logs or verification history.
    // Let's return empty array as we don't have separate verification history entries or we can query active logs.
    return [];
  }

  async getProperties() {
    const properties = await prisma.property.findMany({
      where: { is_deleted: false },
      orderBy: { created_at: 'desc' },
      include: {
        owner: { include: { user: true } },
        area: { include: { city: { include: { state: true } } } },
        images: { where: { is_deleted: false }, orderBy: { created_at: 'asc' } },
      },
    });

    return properties.map((prop) => ({
      ...prop,
      city: { name: prop.area?.city?.name || prop.city || '' },
      state: { name: prop.area?.city?.state?.name || prop.state || '' },
      kyc_status:
        prop.approval_status === VerificationStatus.VERIFIED
          ? 'APPROVED'
          : prop.approval_status,
      property_images: (prop.images || []).map((img) => ({ image_url: img.url })),
    }));
  }

  async verifyProperty(id: string, status: VerificationStatus, notes: string) {
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
        action: 'PROPERTY_VERIFY',
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

  async requestPropertyCorrections(id: string, corrections: string[], notes: string) {
    return prisma.$transaction(async (tx) => {
      const property = await tx.property.update({
        where: { id },
        data: {
          approval_status: VerificationStatus.REJECTED,
          approval_notes: `Corrections requested: ${corrections.join(', ')}. ${notes}`,
          rejected_at: new Date(),
        },
        include: { owner: true },
      });

      await AuditService.log(tx, {
        action: 'PROPERTY_CORRECTIONS_REQUESTED',
        entityName: 'Property',
        entityId: id,
        newValues: { corrections, notes },
      });

      await NotificationService.create(tx, {
        userId: property.owner.user_id,
        title: 'Property Corrections Required',
        body: `Corrections requested for "${property.name}": ${corrections.join(', ')}. ${notes}`,
        type: NotificationType.SYSTEM,
      });

      return property;
    });
  }

  async suspendProperty(id: string, notes: string) {
    return prisma.$transaction(async (tx) => {
      const property = await tx.property.update({
        where: { id },
        data: {
          status: 'INACTIVE',
          approval_notes: `Suspended: ${notes}`,
        },
        include: { owner: true },
      });

      await AuditService.log(tx, {
        action: 'PROPERTY_SUSPEND',
        entityName: 'Property',
        entityId: id,
        newValues: { notes },
      });

      await NotificationService.create(tx, {
        userId: property.owner.user_id,
        title: 'Property Suspended',
        body: `Your property "${property.name}" has been suspended. Reason: ${notes}`,
        type: NotificationType.SYSTEM,
      });

      return property;
    });
  }

  async getBookings() {
    return prisma.booking.findMany({
      where: { is_deleted: false },
      orderBy: { created_at: 'desc' },
      include: {
        tenant: { include: { user: true } },
        bed: { include: { room: { include: { floor: { include: { property: true } } } } } },
      },
    });
  }

  async verifyBooking(id: string, status: BookingStatus) {
    return prisma.$transaction(async (tx) => {
      const booking = await tx.booking.update({
        where: { id },
        data: {
          status,
        },
        include: {
          tenant: { include: { user: true } },
        },
      });

      await AuditService.log(tx, {
        action: 'BOOKING_VERIFY',
        entityName: 'Booking',
        entityId: id,
        newValues: { status },
      });

      await NotificationService.create(tx, {
        userId: booking.tenant.user_id,
        title: 'Booking Status Updated',
        body: `Your booking status is now ${status}.`,
        type: NotificationType.BOOKING_STATUS,
      });

      return booking;
    });
  }

  async getComplaints() {
    return prisma.complaint.findMany({
      where: { is_deleted: false },
      orderBy: { created_at: 'desc' },
      include: {
        tenant: { include: { user: true } },
        property: true,
      },
    });
  }

  async assignComplaint(id: string, staffName: string) {
    const complaint = await prisma.complaint.findFirst({
      where: { id, is_deleted: false },
      include: { tenant: true, property: true },
    });

    if (!complaint) {
      throw new Error('Complaint not found');
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
          complaint_id: complaint.id,
          staff_id: staff.id,
          title: complaint.title,
          description: complaint.description,
          status: ComplaintStatus.IN_PROGRESS,
        },
      });

      const updatedComplaint = await tx.complaint.update({
        where: { id: complaint.id },
        data: { status: ComplaintStatus.ASSIGNED },
      });

      await AuditService.log(tx, {
        action: 'COMPLAINT_ASSIGN_MANAGER',
        entityName: 'Complaint',
        entityId: complaint.id,
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

  async updateComplaintStatus(id: string, status: ComplaintStatus, notes: string) {
    return prisma.$transaction(async (tx) => {
      const complaint = await tx.complaint.update({
        where: { id },
        data: {
          status,
          ...(status === ComplaintStatus.RESOLVED ? { resolved_at: new Date() } : {}),
        },
        include: { tenant: true },
      });

      await AuditService.log(tx, {
        action: 'COMPLAINT_STATUS_UPDATE',
        entityName: 'Complaint',
        entityId: id,
        newValues: { status, notes },
      });

      await NotificationService.create(tx, {
        userId: complaint.tenant.user_id,
        title: 'Complaint Status Updated',
        body: `Your complaint "${complaint.title}" is now ${status}. ${notes}`,
        type: NotificationType.COMPLAINT_UPDATE,
      });

      return complaint;
    });
  }

  async getTasks() {
    const tasks = await prisma.maintenanceRequest.findMany({
      where: { is_deleted: false },
      orderBy: { created_at: 'desc' },
      include: {
        complaint: true,
        property: true,
        staff: true,
      },
    });

    const taskIds = tasks.map((task) => task.id);
    const clarificationLogs = taskIds.length > 0
      ? await prisma.auditLog.findMany({
          where: {
            entity_name: 'MaintenanceRequest',
            entity_id: { in: taskIds },
            action: 'TASK_CLARIFICATION_REQUESTED',
            is_deleted: false,
          },
          orderBy: { created_at: 'desc' },
        })
      : [];

    return tasks.map((task) => {
      const clarificationLog = clarificationLogs.find((log) => log.entity_id === task.id);
      const rawStatus = clarificationLog && task.status !== ComplaintStatus.RESOLVED
        ? 'CLARIFICATION_REQUESTED'
        : task.status === ComplaintStatus.OPEN
          ? 'PENDING'
          : task.status === ComplaintStatus.RESOLVED
            ? 'COMPLETED'
            : task.status;

      return {
        id: task.id,
        title: task.title,
        description: `${task.description}${task.staff ? ` Assigned to ${task.staff.name}.` : ''}`,
        priority: task.complaint?.priority || 'MEDIUM',
        status: rawStatus,
        due_date: task.updated_at.toISOString(),
        assigned_to: task.staff?.name || 'Unassigned',
        clarification_notes: clarificationLog?.new_values && typeof clarificationLog.new_values === 'object'
          ? (clarificationLog.new_values as any).clarificationNotes || undefined
          : undefined,
      };
    });
  }

  async updateTaskStatus(id: string, status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CLARIFICATION_REQUESTED', clarificationNotes?: string) {
    const task = await prisma.maintenanceRequest.findFirst({
      where: { id, is_deleted: false },
      include: { complaint: { include: { tenant: true } } },
    });

    if (!task) {
      throw new Error('Task not found');
    }

    return prisma.$transaction(async (tx) => {
      let updatedTask = task;

      if (status === 'IN_PROGRESS') {
        updatedTask = await tx.maintenanceRequest.update({
          where: { id },
          data: { status: ComplaintStatus.IN_PROGRESS },
        });
      } else if (status === 'COMPLETED') {
        updatedTask = await tx.maintenanceRequest.update({
          where: { id },
          data: { status: ComplaintStatus.RESOLVED },
        });

        if (task.complaint_id) {
          await tx.complaint.update({
            where: { id: task.complaint_id },
            data: { status: ComplaintStatus.RESOLVED, resolved_at: new Date() },
          });
        }
      } else if (status === 'CLARIFICATION_REQUESTED') {
        await AuditService.log(tx, {
          action: 'TASK_CLARIFICATION_REQUESTED',
          entityName: 'MaintenanceRequest',
          entityId: id,
          newValues: { clarificationNotes: clarificationNotes || null },
        });

        if (task.complaint?.tenant) {
          await NotificationService.create(tx, {
            userId: task.complaint.tenant.user_id,
            title: 'Task Clarification Requested',
            body: clarificationNotes || 'Additional clarification requested for your maintenance issue.',
            type: NotificationType.COMPLAINT_UPDATE,
          });
        }

        return task;
      }

      await AuditService.log(tx, {
        action: 'TASK_STATUS_UPDATE',
        entityName: 'MaintenanceRequest',
        entityId: id,
        newValues: { status, clarificationNotes: clarificationNotes || null },
      });

      if (task.complaint?.tenant) {
        await NotificationService.create(tx, {
          userId: task.complaint.tenant.user_id,
          title: 'Maintenance Task Updated',
          body: `Task for complaint "${task.complaint.title}" is now ${status}.`,
          type: NotificationType.COMPLAINT_UPDATE,
        });
      }

      return updatedTask;
    });
  }

  async sendNotification(userId: string, title: string, content: string, type: NotificationType = NotificationType.SYSTEM) {
    return prisma.$transaction(async (tx) => {
      const result = await NotificationService.create(tx, {
        userId,
        title,
        body: content,
        type,
      });

      await AuditService.log(tx, {
        action: 'NOTIFICATION_SEND',
        entityName: 'Notification',
        entityId: result.notification.id,
        newValues: { userId, title, content, type },
      });

      return result.notification;
    });
  }

  async broadcastAnnouncement(title: string, content: string) {
    return prisma.$transaction(async (tx) => {
      const recipients = await tx.user.findMany({
        where: {
          is_deleted: false,
          role: { in: [UserRole.OWNER, UserRole.MANAGER, UserRole.USER] },
        },
        select: { id: true },
      });

      const notifications = await Promise.all(
        recipients.map((recipient) =>
          NotificationService.create(tx, {
            userId: recipient.id,
            title,
            body: content,
            type: NotificationType.ANNOUNCEMENT,
          })
        )
      );

      await AuditService.log(tx, {
        action: 'ANNOUNCEMENT_BROADCAST',
        entityName: 'Notification',
        entityId: notifications[0]?.notification.id || '00000000-0000-0000-0000-000000000000',
        newValues: { title, content, recipients: recipients.length },
      });

      return { recipients: recipients.length };
    });
  }

  async getReports(category: string) {
    // Return empty array, or query actual data based on category
    return [];
  }

  async searchAll(query: string) {
    const q = query.toLowerCase();
    const [owners, properties, bookings, complaints] = await Promise.all([
      prisma.ownerProfile.findMany({
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
      prisma.property.findMany({
        where: {
          is_deleted: false,
          name: { contains: q, mode: 'insensitive' },
        },
        include: {
          owner: { include: { user: true } },
          area: { include: { city: { include: { state: true } } } },
        },
      }),
      prisma.booking.findMany({
        where: {
          is_deleted: false,
          tenant: { user: { first_name: { contains: q, mode: 'insensitive' } } },
        },
        include: { tenant: { include: { user: true } } },
      }),
      prisma.complaint.findMany({
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
