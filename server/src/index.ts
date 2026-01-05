import { createServer } from 'http';
import app from './app.js';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { disconnectRedis } from './config/redis.js';
import { setupSocket } from './socket/index.js';
import { startMetricsGenerator, stopMetricsGenerator } from './services/metricsGenerator.js';

const httpServer = createServer(app);
const io = setupSocket(httpServer);

async function start(): Promise<void> {
  try {
    // Connect to database
    await connectDatabase();

    // Start metrics generator
    startMetricsGenerator(io, config.metrics.intervalMs);

    // Start HTTP server
    httpServer.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`, {
        env: config.env,
        metricsInterval: config.metrics.intervalMs,
      });
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

async function shutdown(): Promise<void> {
  logger.info('Shutting down server...');

  stopMetricsGenerator();

  httpServer.close(() => {
    logger.info('HTTP server closed');
  });

  await disconnectRedis();
  await disconnectDatabase();

  process.exit(0);
}

// Graceful shutdown handlers
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error });
  process.exit(1);
});

start();
