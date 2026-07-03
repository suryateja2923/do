import http from 'http';
import { app } from './app';
import { env } from './config/env';
import { prisma } from './config/database';
import { logger } from './config/logger';
import { initSocket } from './realtime/socket';

const server = http.createServer(app);
initSocket(server);

const startServer = async () => {
  try {
    // Verify database connectivity on startup
    await prisma.$connect();
    logger.info('✔ Database connection established cleanly.');

    server.listen(env.PORT, () => {
      logger.info(`🚀 Server running in [${env.NODE_ENV}] mode on http://localhost:${env.PORT}`);
      logger.info(`📖 API documentation available on http://localhost:${env.PORT}/api-docs`);
    });
  } catch (err: any) {
    logger.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

// Graceful Shutdown Handler
const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  server.close(async () => {
    logger.info('HTTP server closed.');
    try {
      await prisma.$disconnect();
      logger.info('Prisma Client disconnected cleanly.');
      process.exit(0);
    } catch (err) {
      logger.error('Error during database disconnection:', err);
      process.exit(1);
    }
  });

  // Force close after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown: active connections did not terminate within timeout.');
    process.exit(1);
  }, 10000);
};

// Listen to system signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Catch unhandled rejections/exceptions globally
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection at Promise:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception thrown:', error);
  // Graceful shutdown on critical exception
  gracefulShutdown('uncaughtException');
});

startServer();
