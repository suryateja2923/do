"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loggerMiddleware = void 0;
const morgan_1 = __importDefault(require("morgan"));
const logger_1 = require("../config/logger");
const env_1 = require("../config/env");
const stream = {
    write: (message) => logger_1.logger.http(message.trim()),
};
const skip = () => {
    return env_1.env.NODE_ENV === 'test';
};
exports.loggerMiddleware = (0, morgan_1.default)(':remote-addr - :method :url :status - :response-time ms', { stream, skip });
exports.default = exports.loggerMiddleware;
