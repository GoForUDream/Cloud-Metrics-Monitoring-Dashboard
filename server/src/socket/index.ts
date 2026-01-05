import type { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

export function setupSocket(httpServer: HttpServer): SocketServer {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: config.cors.origin,
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    logger.info('Client connected', { socketId: socket.id });

    socket.on('disconnect', (reason) => {
      logger.info('Client disconnected', { socketId: socket.id, reason });
    });

    socket.on('error', (error) => {
      logger.error('Socket error', { socketId: socket.id, error: error.message });
    });

    // Client can request current metrics on demand
    socket.on('metrics:request', async () => {
      logger.debug('Metrics requested by client', { socketId: socket.id });
      // The metricsGenerator will handle this through regular broadcasts
    });
  });

  logger.info('Socket.io server initialized');
  return io;
}
