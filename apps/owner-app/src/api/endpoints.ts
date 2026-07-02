export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register-owner',
    ME: '/auth/me',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    STATUS: '/owner/application-status',
    PROFILE: '/owner/profile',
  },
  DASHBOARD: {
    STATS: '/owner/dashboard-stats',
  },
  PROPERTIES: {
    LIST: '/owner/properties',
    DETAIL: (id: string) => `/owner/properties/${id}`,
    CREATE: '/owner/properties',
    UPDATE: (id: string) => `/owner/properties/${id}`,
    DEACTIVATE: (id: string) => `/owner/properties/${id}/deactivate`,
    UPLOAD_IMAGES: (id: string) => `/owner/properties/${id}/images`,
    DELETE_IMAGE: (id: string, imageId: string) => `/owner/properties/${id}/images/${imageId}`,
  },
  FLOORS: {
    LIST: (propertyId: string) => `/owner/properties/${propertyId}/floors`,
    CREATE: (propertyId: string) => `/owner/properties/${propertyId}/floors`,
    UPDATE: (propertyId: string, floorId: string) => `/owner/properties/${propertyId}/floors/${floorId}`,
    DELETE: (propertyId: string, floorId: string) => `/owner/properties/${propertyId}/floors/${floorId}`,
  },
  ROOMS: {
    LIST: (floorId: string) => `/owner/floors/${floorId}/rooms`,
    CREATE: (floorId: string) => `/owner/floors/${floorId}/rooms`,
    UPDATE: (roomId: string) => `/owner/rooms/${roomId}`,
    DELETE: (roomId: string) => `/owner/rooms/${roomId}`,
  },
  BEDS: {
    LIST: (roomId: string) => `/owner/rooms/${roomId}/beds`,
    CREATE: (roomId: string) => `/owner/rooms/${roomId}/beds`,
    UPDATE: (bedId: string) => `/owner/beds/${bedId}`,
    DELETE: (bedId: string) => `/owner/beds/${bedId}`,
  },
  BOOKINGS: {
    LIST: '/owner/bookings',
    VERIFY: (id: string) => `/owner/bookings/${id}/verify`,
    TIMELINE: (id: string) => `/owner/bookings/${id}/timeline`,
  },
  TENANTS: {
    LIST: '/owner/tenants',
    DETAIL: (id: string) => `/owner/tenants/${id}`,
  },
  COMPLAINTS: {
    LIST: '/owner/complaints',
    REPLY: (id: string) => `/owner/complaints/${id}/replies`,
    ASSIGN: (id: string) => `/owner/complaints/${id}/assign`,
    STATUS: (id: string) => `/owner/complaints/${id}/status`,
  },
  NOTIFICATIONS: {
    LIST: '/owner/notifications',
    SEND: '/owner/notifications/send',
  },
  REPORTS: {
    QUERY: '/owner/reports',
  },
  SEARCH: {
    QUERY: '/owner/search',
  },
};

export default API_ENDPOINTS;
