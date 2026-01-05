import { z } from 'zod';
import { config as dotenvConfig } from 'dotenv';

// Load .env file (dotenv won't override existing env vars)
dotenvConfig();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3001'),

  // Database
  DATABASE_URL: z.string().default('postgresql://cloudmetrics:cloudmetrics_dev@localhost:5432/cloudmetrics'),

  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  // Metrics
  METRICS_INTERVAL_MS: z.string().default('30000'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const config = {
  env: parsed.data.NODE_ENV,
  port: parseInt(parsed.data.PORT, 10),
  database: {
    url: parsed.data.DATABASE_URL,
  },
  redis: {
    url: parsed.data.REDIS_URL,
  },
  cors: {
    origin: parsed.data.CORS_ORIGIN,
  },
  metrics: {
    intervalMs: parseInt(parsed.data.METRICS_INTERVAL_MS, 10),
  },
} as const;
