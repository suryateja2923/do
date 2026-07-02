export const ROLES = {
  OWNER: 'OWNER',
  TENANT: 'USER',
} as const;

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
  BED: {
    VACANT: 'VACANT',
    OCCUPIED: 'OCCUPIED',
    UNDER_MAINTENANCE: 'UNDER_MAINTENANCE',
  },
} as const;

export const STATUS_COLORS = {
  APPROVED: '#10b981',
  SUCCESS: '#10b981',
  COMPLETED: '#10b981',
  RESOLVED: '#10b981',
  OCCUPIED: '#10b981',
  
  PENDING: '#3b82f6',
  OPEN: '#ef4444',
  IN_PROGRESS: '#f59e0b',
  
  REJECTED: '#ef4444',
  CANCELLED: '#6b7280',
  CLOSED: '#6b7280',
  SUSPENDED: '#f59e0b',
  UNDER_MAINTENANCE: '#f59e0b',
  VACANT: '#3b82f6',
} as const;

export const AMENITIES_OPTIONS = [
  'Wi-Fi',
  'Air Conditioning',
  'Attached Bathroom',
  'Geyser',
  'CCTV Security',
  'Washing Machine',
  'Power Backup',
  'Refrigerator',
  'Gym',
  'Parking',
];

export const HOUSE_RULES_OPTIONS = [
  'No smoking inside rooms',
  'Gate closes at 10:30 PM',
  'Guests not allowed overnight',
  'No loud music after 10 PM',
  'Maintain room cleanliness',
];

export default {
  ROLES,
  STATUS,
  STATUS_COLORS,
  AMENITIES_OPTIONS,
  HOUSE_RULES_OPTIONS,
};
