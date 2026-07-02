export const API_VERSION = 'v1';
export const API_PREFIX = `/api/${API_VERSION}`;

export enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
}

export const ERROR_CODES = {
  VALIDATION_ERROR: 'VAL_ERR',
  AUTHENTICATION_ERROR: 'AUTH_ERR',
  AUTHORIZATION_ERROR: 'AUTH_ERR',
  FORBIDDEN_ERROR: 'FORBIDDEN_ERR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERR',
  CONFLICT_ERROR: 'CONFLICT_ERR',
  RATE_LIMIT_ERROR: 'LIMIT_ERR',
  SERVER_ERROR: 'SRV_ERR',
};

export const APP_MESSAGES = {
  SUCCESS: 'Operation completed successfully',
  HEALTHY: 'Service is healthy',
  UNAUTHORIZED: 'Authentication required. Please provide a valid credentials token.',
  FORBIDDEN: 'Access denied. You do not possess authorized scopes.',
  NOT_FOUND: 'Requested resource could not be found.',
  RATE_LIMIT: 'Too many requests. Please throttle calls.',
  INTERNAL_SERVER_ERROR: 'An unexpected database or systems failure occurred.',
};

export const FILE_UPLOAD_LIMITS = {
  IMAGE_MAX_SIZE: 5 * 1024 * 1024, // 5MB
  DOCUMENT_MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_MIMES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_DOCUMENT_MIMES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
};

export const PAGINATION_DEFAULTS = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

export const ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  OWNER: 'OWNER',
  USER: 'USER',
};
