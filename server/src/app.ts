import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import routes from './routes/index.js';

const app = express();

// Security middleware
app.use(helmet());

// CORS
app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
  })
);

// Request parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(
  morgan('combined', {
    stream: {
      write: (message: string) => logger.http(message.trim()),
    },
  })
);

// API routes
app.use('/api', routes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
