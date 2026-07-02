export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    FORGOT_PASSWORD: '/auth/forgot-password',
  },
  DASHBOARD: {
    STATS: '/admin/dashboard-stats',
  },
  OWNERS: {
    LIST: '/admin/owners',
    VERIFY: (id: string) => `/admin/owners/${id}/verify`,
  },
  PROPERTIES: {
    LIST: '/admin/properties',
    VERIFY: (id: string) => `/admin/properties/${id}/verify`,
  },
};

export default API_ENDPOINTS;
