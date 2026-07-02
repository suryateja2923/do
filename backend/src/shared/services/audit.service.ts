import { Prisma, PrismaClient } from '@prisma/client';

import { RequestContext } from '../context/requestContext';

type DbClient = Prisma.TransactionClient | PrismaClient;

export interface AuditLogPayload {
  action: string;
  entityName: string;
  entityId: string;
  userId?: string | null;
  oldValues?: Prisma.InputJsonValue;
  newValues?: Prisma.InputJsonValue;
}

export class AuditService {
  public static async log(db: DbClient, payload: AuditLogPayload) {
    const context = RequestContext.current();

    return db.auditLog.create({
      data: {
        action: payload.action,
        entity_name: payload.entityName,
        entity_id: payload.entityId,
        user_id: payload.userId ?? context?.user?.id ?? null,
        ip_address: context?.ip || null,
        old_values: payload.oldValues,
        new_values: {
          ...(typeof payload.newValues === 'object' && payload.newValues !== null ? payload.newValues as object : {}),
          _request: {
            requestId: context?.requestId || null,
            correlationId: context?.correlationId || null,
            userAgent: context?.userAgent || null,
            timestamp: new Date().toISOString(),
          },
        } as Prisma.InputJsonValue,
      },
    });
  }
}

export default AuditService;