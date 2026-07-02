export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    ME: '/auth/me',
  },
  DASHBOARD: {
    STATS: '/manager/dashboard-stats',
  },
  OWNERS: {
    LIST: '/manager/owners',
    VERIFY: (id: string) => `/manager/owners/${id}/verify`,
    REQUEST_DOCS: (id: string) => `/manager/owners/${id}/request-docs`,
    SUSPEND: (id: string) => `/manager/owners/${id}/suspend`,
    HISTORY: (id: string) => `/manager/verification-history/${id}`,
  },
  PROPERTIES: {
    LIST: '/manager/properties',
    VERIFY: (id: string) => `/manager/properties/${id}/verify`,
    REQUEST_CORRECTIONS: (id: string) => `/manager/properties/${id}/request-corrections`,
    SUSPEND: (id: string) => `/manager/properties/${id}/suspend`,
  },
  BOOKINGS: {
    LIST: '/manager/bookings',
    VERIFY: (id: string) => `/manager/bookings/${id}/verify`,
  },
  COMPLAINTS: {
    LIST: '/manager/complaints',
    ASSIGN: (id: string) => `/manager/complaints/${id}/assign`,
    STATUS: (id: string) => `/manager/complaints/${id}/status`,
  },
  TASKS: {
    LIST: '/manager/tasks',
    STATUS: (id: string) => `/manager/tasks/${id}/status`,
  },
  NOTIFICATIONS: {
    SEND: '/manager/notifications/send',
    BROADCAST: '/manager/notifications/broadcast',
  },
  REPORTS: {
    QUERY: '/manager/reports',
  },
  SEARCH: {
    QUERY: '/manager/search',
  },
};

export default API_ENDPOINTS;
