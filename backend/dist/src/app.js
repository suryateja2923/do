"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const env_1 = require("./config/env");
const logger_middleware_1 = require("./middlewares/logger.middleware");
const error_middleware_1 = require("./middlewares/error.middleware");
const context_middleware_1 = require("./middlewares/context.middleware");
const swagger_1 = require("./config/swagger");
const health_routes_1 = __importDefault(require("./routes/health.routes"));
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const admin_routes_1 = __importDefault(require("./modules/admin/admin.routes"));
const manager_routes_1 = __importDefault(require("./modules/manager/manager.routes"));
const owner_routes_1 = __importDefault(require("./modules/owner/owner.routes"));
const user_routes_1 = __importDefault(require("./modules/user/user.routes"));
const app = (0, express_1.default)();
exports.app = app;
app.disable('etag');
// 1. Basic Middlewares & Parsers
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// 2. Global Request Context (AsyncLocalStorage mapping)
app.use(context_middleware_1.contextMiddleware);
// 3. CORS setup
const corsOrigins = env_1.env.CORS_ORIGINS;
app.use((0, cors_1.default)({
    origin: corsOrigins === '*' ? '*' : corsOrigins.split(','),
    credentials: true,
}));
// 4. Request Logger (Morgan + Winston stream)
app.use(logger_middleware_1.loggerMiddleware);
// 5. Rate Limiter
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.',
    },
});
app.use(limiter);
// 6. Documentation Router
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec));
// 7. Base routes mapping
app.use('/api/v1/health', health_routes_1.default);
app.use('/api/v1/auth', auth_routes_1.default);
app.use('/api/v1/admin', admin_routes_1.default);
app.use('/api/v1/manager', manager_routes_1.default);
app.use('/api/v1/owner', owner_routes_1.default);
app.use('/api/v1/user', user_routes_1.default);
// 8. 404 Route handler
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Cannot ${req.method} ${req.path}`,
    });
});
// 9. Centralized Error Handler (must be attached last!)
app.use(error_middleware_1.errorMiddleware);
exports.default = app;
