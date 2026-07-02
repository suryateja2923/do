"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLES = exports.PAGINATION_DEFAULTS = exports.FILE_UPLOAD_LIMITS = exports.APP_MESSAGES = exports.ERROR_CODES = exports.HttpStatusCode = exports.API_PREFIX = exports.API_VERSION = void 0;
exports.API_VERSION = 'v1';
exports.API_PREFIX = `/api/${exports.API_VERSION}`;
var HttpStatusCode;
(function (HttpStatusCode) {
    HttpStatusCode[HttpStatusCode["OK"] = 200] = "OK";
    HttpStatusCode[HttpStatusCode["CREATED"] = 201] = "CREATED";
    HttpStatusCode[HttpStatusCode["ACCEPTED"] = 202] = "ACCEPTED";
    HttpStatusCode[HttpStatusCode["NO_CONTENT"] = 204] = "NO_CONTENT";
    HttpStatusCode[HttpStatusCode["BAD_REQUEST"] = 400] = "BAD_REQUEST";
    HttpStatusCode[HttpStatusCode["UNAUTHORIZED"] = 401] = "UNAUTHORIZED";
    HttpStatusCode[HttpStatusCode["FORBIDDEN"] = 403] = "FORBIDDEN";
    HttpStatusCode[HttpStatusCode["NOT_FOUND"] = 404] = "NOT_FOUND";
    HttpStatusCode[HttpStatusCode["CONFLICT"] = 409] = "CONFLICT";
    HttpStatusCode[HttpStatusCode["UNPROCESSABLE_ENTITY"] = 422] = "UNPROCESSABLE_ENTITY";
    HttpStatusCode[HttpStatusCode["TOO_MANY_REQUESTS"] = 429] = "TOO_MANY_REQUESTS";
    HttpStatusCode[HttpStatusCode["INTERNAL_SERVER_ERROR"] = 500] = "INTERNAL_SERVER_ERROR";
})(HttpStatusCode || (exports.HttpStatusCode = HttpStatusCode = {}));
exports.ERROR_CODES = {
    VALIDATION_ERROR: 'VAL_ERR',
    AUTHENTICATION_ERROR: 'AUTH_ERR',
    AUTHORIZATION_ERROR: 'AUTH_ERR',
    FORBIDDEN_ERROR: 'FORBIDDEN_ERR',
    NOT_FOUND_ERROR: 'NOT_FOUND_ERR',
    CONFLICT_ERROR: 'CONFLICT_ERR',
    RATE_LIMIT_ERROR: 'LIMIT_ERR',
    SERVER_ERROR: 'SRV_ERR',
};
exports.APP_MESSAGES = {
    SUCCESS: 'Operation completed successfully',
    HEALTHY: 'Service is healthy',
    UNAUTHORIZED: 'Authentication required. Please provide a valid credentials token.',
    FORBIDDEN: 'Access denied. You do not possess authorized scopes.',
    NOT_FOUND: 'Requested resource could not be found.',
    RATE_LIMIT: 'Too many requests. Please throttle calls.',
    INTERNAL_SERVER_ERROR: 'An unexpected database or systems failure occurred.',
};
exports.FILE_UPLOAD_LIMITS = {
    IMAGE_MAX_SIZE: 5 * 1024 * 1024, // 5MB
    DOCUMENT_MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_IMAGE_MIMES: ['image/jpeg', 'image/png', 'image/webp'],
    ALLOWED_DOCUMENT_MIMES: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
};
exports.PAGINATION_DEFAULTS = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
};
exports.ROLES = {
    ADMIN: 'ADMIN',
    MANAGER: 'MANAGER',
    OWNER: 'OWNER',
    USER: 'USER',
};
