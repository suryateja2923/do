import { ROUTES } from '@/config/routes';

export const ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  OWNER: 'OWNER',
  USER: 'USER',
} as const;

export type UserRole = keyof typeof ROLES;

export const STATUS = {
  KYC: {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    SUSPENDED: 'SUSPENDED',
  },
  COMPLAINT: {
    OPEN: 'OPEN',
    IN_PROGRESS: 'IN_PROGRESS',
    RESOLVED: 'RESOLVED',
    CLOSED: 'CLOSED',
  },
  BOOKING: {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    CANCELLED: 'CANCELLED',
    MOVE_IN: 'MOVE_IN',
    MOVE_OUT: 'MOVE_OUT',
  },
  TASK: {
    PENDING: 'PENDING',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    CLARIFICATION_REQUESTED: 'CLARIFICATION_REQUESTED',
  },
} as const;

export const COLORS = {
  STATUS: {
    APPROVED: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    SUCCESS: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    COMPLETED: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    PENDING: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    IN_PROGRESS: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    REJECTED: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    CANCELLED: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    CLOSED: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    SUSPENDED: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    CLARIFICATION_REQUESTED: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  },
  PRIORITY: {
    LOW: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    MEDIUM: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    HIGH: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    URGENT: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  },
} as const;

export const TIMEOUTS = {
  API_REQUEST: 15000,
  INACTIVITY: 900000, // 15 mins
  WARNING: 60000,     // 1 min
} as const;

export default {
  ROLES,
  STATUS,
  COLORS,
  TIMEOUTS,
  ROUTES,
};
