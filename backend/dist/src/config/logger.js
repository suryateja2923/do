"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const env_1 = require("./env");
const requestContext_1 = require("../shared/context/requestContext");
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};
const level = () => {
    const isDevelopment = env_1.env.NODE_ENV === 'development';
    return isDevelopment ? 'debug' : 'info';
};
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};
winston_1.default.addColors(colors);
// Custom format to automatically pull requestId and correlationId from context
const contextFormat = winston_1.default.format((info) => {
    const context = requestContext_1.RequestContext.current();
    if (context) {
        info.requestId = context.requestId;
        info.correlationId = context.correlationId;
        if (context.user) {
            info.userId = context.user.id;
            info.userRole = context.user.role;
        }
    }
    return info;
});
const format = winston_1.default.format.combine(contextFormat(), winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json());
const consoleFormat = winston_1.default.format.printf((info) => {
    const reqId = info.requestId;
    const userId = info.userId;
    const ctxString = reqId ? ` [ReqID: ${reqId.substring(0, 8)}]` : '';
    const userString = userId ? ` [User: ${userId.substring(0, 8)} (${info.userRole})]` : '';
    return `[${info.timestamp}] [${info.level}]:${ctxString}${userString} ${info.message}${info.stack ? `\n${info.stack}` : ''}`;
});
const transports = [
    new winston_1.default.transports.Console({
        format: winston_1.default.format.combine(winston_1.default.format.colorize({ all: true }), consoleFormat),
    }),
    new winston_daily_rotate_file_1.default({
        filename: 'logs/error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        level: 'error',
    }),
    new winston_daily_rotate_file_1.default({
        filename: 'logs/combined-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
    }),
];
exports.logger = winston_1.default.createLogger({
    level: level(),
    levels,
    format,
    transports,
});
exports.default = exports.logger;
