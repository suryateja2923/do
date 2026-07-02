"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const app_1 = require("./app");
const env_1 = require("./config/env");
const database_1 = require("./config/database");
const logger_1 = require("./config/logger");
const server = http_1.default.createServer(app_1.app);
const startServer = async () => {
    try {
        // Verify database connectivity on startup
        await database_1.prisma.$connect();
        logger_1.logger.info('✔ Database connection established cleanly.');
        server.listen(env_1.env.PORT, () => {
            logger_1.logger.info(`🚀 Server running in [${env_1.env.NODE_ENV}] mode on http://localhost:${env_1.env.PORT}`);
            logger_1.logger.info(`📖 API documentation available on http://localhost:${env_1.env.PORT}/api-docs`);
        });
    }
    catch (err) {
        logger_1.logger.error('❌ Failed to start server:', err);
        process.exit(1);
    }
};
// Graceful Shutdown Handler
const gracefulShutdown = async (signal) => {
    logger_1.logger.info(`Received ${signal}. Starting graceful shutdown...`);
    server.close(async () => {
        logger_1.logger.info('HTTP server closed.');
        try {
            await database_1.prisma.$disconnect();
            logger_1.logger.info('Prisma Client disconnected cleanly.');
            process.exit(0);
        }
        catch (err) {
            logger_1.logger.error('Error during database disconnection:', err);
            process.exit(1);
        }
    });
    // Force close after 10 seconds
    setTimeout(() => {
        logger_1.logger.error('Forced shutdown: active connections did not terminate within timeout.');
        process.exit(1);
    }, 10000);
};
// Listen to system signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
// Catch unhandled rejections/exceptions globally
process.on('unhandledRejection', (reason) => {
    logger_1.logger.error('Unhandled Rejection at Promise:', reason);
});
process.on('uncaughtException', (error) => {
    logger_1.logger.error('Uncaught Exception thrown:', error);
    // Graceful shutdown on critical exception
    gracefulShutdown('uncaughtException');
});
startServer();
