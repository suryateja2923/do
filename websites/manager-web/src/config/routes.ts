export const ROUTES = {
  PUBLIC: {
    LOGIN: '/login',
    FORGOT_PASSWORD: '/forgot-password',
  },
  PROTECTED: {
    DASHBOARD: '/',
    OWNERS: '/owners',
    PROPERTIES: '/properties',
    BOOKINGS: '/bookings',
    COMPLAINTS: '/complaints',
    NOTIFICATIONS: '/notifications',
    TASKS: '/tasks',
    REPORTS: '/reports',
    PROFILE: '/profile',
  },
  ERROR: {
    UNAUTHORIZED: '/unauthorized',
    FORBIDDEN: '/403',
    NOT_FOUND: '/not-found',
    SERVER_ERROR: '/500',
    SESSION_EXPIRED: '/session-expired',
  },
};

export const PUBLIC_PATHS = [
  ROUTES.PUBLIC.LOGIN,
  ROUTES.PUBLIC.FORGOT_PASSWORD,
  ROUTES.ERROR.UNAUTHORIZED,
  ROUTES.ERROR.FORBIDDEN,
  ROUTES.ERROR.SESSION_EXPIRED,
  ROUTES.ERROR.SERVER_ERROR,
];

export default ROUTES;
