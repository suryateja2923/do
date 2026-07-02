import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { ApiResponse } from '../utils/response.formatter';
import { env } from '../config/env';
import os from 'os';

const router = Router();

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
router.get('/live', (req: Request, res: Response): void => {
  ApiResponse.success(res, { status: 'UP' }, 'Server is live');
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
router.get('/ready', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    ApiResponse.success(res, { status: 'READY' }, 'Database connection verified');
  } catch (err: any) {
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
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    const memoryUsage = process.memoryUsage();
    const cpuLoad = os.loadavg();

    ApiResponse.success(res, {
      status: 'OK',
      uptime: process.uptime(),
      timestamp: new Date(),
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      env: env.NODE_ENV,
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
      },
      cpu: {
        loadAverage: cpuLoad,
        cores: os.cpus().length,
      },
      database: 'connected',
    }, 'Detailed systems diagnostics compiled successfully');
  } catch (err: any) {
    next(err);
  }
});

export default router;
export { router };
