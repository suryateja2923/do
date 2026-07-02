"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contextMiddleware = void 0;
const crypto_1 = require("crypto");
const requestContext_1 = require("../shared/context/requestContext");
const contextMiddleware = (req, res, next) => {
    const requestId = req.headers['x-request-id'] || (0, crypto_1.randomUUID)();
    const correlationId = req.headers['x-correlation-id'] || requestId;
    // Set response headers for client tracking
    res.setHeader('x-request-id', requestId);
    res.setHeader('x-correlation-id', correlationId);
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';
    const contextData = {
        requestId,
        correlationId,
        timestamp: new Date(),
        ip,
        userAgent,
        user: null, // populated by auth middleware
    };
    // Mount on request object for backward compatibility
    req.requestContext = contextData;
    // Execute request handlers within the AsyncLocalStorage run scope
    requestContext_1.requestContextStorage.run(contextData, () => {
        next();
    });
};
exports.contextMiddleware = contextMiddleware;
exports.default = exports.contextMiddleware;
