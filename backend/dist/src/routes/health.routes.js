"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const database_1 = require("../config/database");
const response_formatter_1 = require("../utils/response.formatter");
const env_1 = require("../config/env");
const os_1 = __importDefault(require("os"));
const router = (0, express_1.Router)();
exports.router = router;
/**
 * @openapi
 * /health/live:
 *   get:
 *     summary: Liveness Probe Endpoint
 *     description: Confirms that the Express HTTP server process is running.
 *     responses:
 *       200:
 *         description: Server is online.
 */
router.get('/live', (req, res) => {
    response_formatter_1.ApiResponse.success(res, { status: 'UP' }, 'Server is live');
});
/**
 * @openapi
 * /health/ready:
 *   get:
 *     summary: Readiness Probe Endpoint
 *     description: Confirms database client connectivity.
 *     responses:
 *       200:
 *         description: Database is online.
 *       500:
 *         description: Database link has failed.
 */
router.get('/ready', async (req, res, next) => {
    try {
        await database_1.prisma.$queryRaw `SELECT 1`;
        response_formatter_1.ApiResponse.success(res, { status: 'READY' }, 'Database connection verified');
    }
    catch (err) {
        next(err);
    }
});
/**
 * @openapi
 * /health:
 *   get:
 *     summary: Detailed Systems Diagnostic Report
 *     description: Compiles CPU, Memory, Uptime, Node settings, and Database links statistics.
 *     responses:
 *       200:
 *         description: Diagnostics report payload.
 *       500:
 *         description: Diagnostics failed.
 */
router.get('/', async (req, res, next) => {
    try {
        await database_1.prisma.$queryRaw `SELECT 1`;
        const memoryUsage = process.memoryUsage();
        const cpuLoad = os_1.default.loadavg();
        response_formatter_1.ApiResponse.success(res, {
            status: 'OK',
            uptime: process.uptime(),
            timestamp: new Date(),
            nodeVersion: process.version,
            platform: process.platform,
            arch: process.arch,
            env: env_1.env.NODE_ENV,
            memory: {
                rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
                heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
                heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
            },
            cpu: {
                loadAverage: cpuLoad,
                cores: os_1.default.cpus().length,
            },
            database: 'connected',
        }, 'Detailed systems diagnostics compiled successfully');
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
