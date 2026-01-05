import pg from 'pg';
import { config } from './index.js';
import { logger } from '../utils/logger.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: config.database.url,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  logger.error('Unexpected database pool error', { error: err.message });
});

export async function connectDatabase(): Promise<void> {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    logger.info('Database connected successfully');
  } catch (error) {
    logger.error('Failed to connect to database', { error });
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  await pool.end();
  logger.info('Database connection closed');
}
