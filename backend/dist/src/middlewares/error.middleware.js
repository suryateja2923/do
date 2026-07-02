"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
const exceptions_1 = require("../utils/exceptions");
const response_formatter_1 = require("../utils/response.formatter");
const logger_1 = require("../config/logger");
const env_1 = require("../config/env");
const errorMiddleware = (error, req, res, next) => {
    let status = 500;
    let message = 'Internal Server Error';
    let errors = null;
    if (error instanceof exceptions_1.HttpException) {
        status = error.status;
        message = error.message;
        errors = error.errors;
    }
    else {
        // For unhandled exceptions, log the full stack trace to winston logs
        logger_1.logger.error(`[Unhandled Error] [${req.method}] ${req.path}`, error);
    }
    // Include detailed error stack messages only in development
    const responseMessage = env_1.env.NODE_ENV === 'development' || error instanceof exceptions_1.HttpException
        ? message
        : 'Something went wrong on the server.';
    response_formatter_1.ApiResponse.error(res, responseMessage, status, errors);
};
exports.errorMiddleware = errorMiddleware;
exports.default = exports.errorMiddleware;
