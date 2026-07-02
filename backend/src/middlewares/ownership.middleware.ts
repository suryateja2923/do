import { NextFunction, Request, Response } from 'express';

import { prisma } from '../config/database';
import { RequestContext } from '../shared/context/requestContext';
import { ForbiddenException, UnauthorizedException } from '../utils/exceptions';

type ResourceKind =
  | 'property'
  | 'floor'
  | 'room'
  | 'bed'
  | 'booking'
  | 'complaint'
  | 'tenant';

const getOwnerProfileId = (): string => {
  const user = RequestContext.getUser();

  if (!user) {
    throw new UnauthorizedException('Authentication token required');
  }

  if (!user.profileId) {
    throw new ForbiddenException('Owner access context is missing');
  }

  return user.profileId;
};

const ownershipResolvers: Record<ResourceKind, (resourceId: string, ownerProfileId: string) => Promise<boolean>> = {
  property: async (resourceId, ownerProfileId) => {
    const property = await prisma.property.findFirst({
      where: { id: resourceId, owner_id: ownerProfileId, is_deleted: false },
      select: { id: true },
    });

    return Boolean(property);
  },
  floor: async (resourceId, ownerProfileId) => {
    const floor = await prisma.floor.findFirst({
      where: { id: resourceId, is_deleted: false, property: { owner_id: ownerProfileId, is_deleted: false } },
      select: { id: true },
    });

    return Boolean(floor);
  },
  room: async (resourceId, ownerProfileId) => {
    const room = await prisma.room.findFirst({
      where: {
        id: resourceId,
        is_deleted: false,
        floor: { is_deleted: false, property: { owner_id: ownerProfileId, is_deleted: false } },
      },
      select: { id: true },
    });

    return Boolean(room);
  },
  bed: async (resourceId, ownerProfileId) => {
    const bed = await prisma.bed.findFirst({
      where: {
        id: resourceId,
        is_deleted: false,
        room: {
          is_deleted: false,
          floor: { is_deleted: false, property: { owner_id: ownerProfileId, is_deleted: false } },
        },
      },
      select: { id: true },
    });

    return Boolean(bed);
  },
  booking: async (resourceId, ownerProfileId) => {
    const booking = await prisma.booking.findFirst({
      where: {
        id: resourceId,
        is_deleted: false,
        bed: {
          room: {
            is_deleted: false,
            floor: { is_deleted: false, property: { owner_id: ownerProfileId, is_deleted: false } },
          },
        },
      },
      select: { id: true },
    });

    return Boolean(booking);
  },
  complaint: async (resourceId, ownerProfileId) => {
    const complaint = await prisma.complaint.findFirst({
      where: {
        id: resourceId,
        is_deleted: false,
        property: { owner_id: ownerProfileId, is_deleted: false },
      },
      select: { id: true },
    });

    return Boolean(complaint);
  },
  tenant: async (resourceId, ownerProfileId) => {
    const tenant = await prisma.tenantProfile.findFirst({
      where: {
        id: resourceId,
        is_deleted: false,
        bookings: {
          some: {
            is_deleted: false,
            bed: {
              room: {
                is_deleted: false,
                floor: { is_deleted: false, property: { owner_id: ownerProfileId, is_deleted: false } },
              },
            },
          },
        },
      },
      select: { id: true },
    });

    return Boolean(tenant);
  },
};

export const requireOwnerResourceOwnership = (
  resourceKind: ResourceKind,
  paramName: string
) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ownerProfileId = getOwnerProfileId();
      const resourceId = req.params[paramName];

      if (!resourceId) {
        throw new ForbiddenException(`Missing route parameter: ${paramName}`);
      }

      const isOwned = await ownershipResolvers[resourceKind](resourceId, ownerProfileId);
      if (!isOwned) {
        throw new ForbiddenException(`Access denied: ${resourceKind} does not belong to this owner`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default requireOwnerResourceOwnership;