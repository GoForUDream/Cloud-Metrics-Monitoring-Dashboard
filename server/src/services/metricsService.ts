import { pool } from '../config/database.js';
import { redis } from '../config/redis.js';
import { logger } from '../utils/logger.js';

export interface Metric {
  id: number;
  instance_id: string;
  cpu_usage: number;
  memory_usage: number;
  request_count: number;
  response_time: number;
  timestamp: Date;
}

export interface MetricStats {
  avg_cpu: number;
  avg_memory: number;
  total_requests: number;
  avg_response_time: number;
  max_cpu: number;
  max_memory: number;
}

export interface CurrentMetrics {
  [instanceId: string]: {
    cpu_usage: number;
    memory_usage: number;
    request_count: number;
    response_time: number;
    timestamp: Date;
  };
}

const CACHE_TTL = 60; // seconds

export async function saveMetric(metric: Omit<Metric, 'id'>): Promise<Metric> {
  const result = await pool.query<Metric>(
    `INSERT INTO metrics (instance_id, cpu_usage, memory_usage, request_count, response_time, timestamp)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      metric.instance_id,
      metric.cpu_usage,
      metric.memory_usage,
      metric.request_count,
      metric.response_time,
      metric.timestamp,
    ]
  );

  // Cache current metrics in Redis
  await redis.hset(
    'current_metrics',
    metric.instance_id,
    JSON.stringify({
      cpu_usage: metric.cpu_usage,
      memory_usage: metric.memory_usage,
      request_count: metric.request_count,
      response_time: metric.response_time,
      timestamp: metric.timestamp,
    })
  );

  return result.rows[0];
}

export async function getCurrentMetrics(): Promise<CurrentMetrics> {
  const cached = await redis.hgetall('current_metrics');

  if (Object.keys(cached).length > 0) {
    const metrics: CurrentMetrics = {};
    for (const [instanceId, data] of Object.entries(cached)) {
      metrics[instanceId] = JSON.parse(data as string);
    }
    return metrics;
  }

  // Fallback to database
  const result = await pool.query<Metric>(
    `SELECT DISTINCT ON (instance_id) *
     FROM metrics
     ORDER BY instance_id, timestamp DESC`
  );

  const metrics: CurrentMetrics = {};
  for (const row of result.rows) {
    metrics[row.instance_id] = {
      cpu_usage: row.cpu_usage,
      memory_usage: row.memory_usage,
      request_count: row.request_count,
      response_time: row.response_time,
      timestamp: row.timestamp,
    };
  }

  return metrics;
}

export async function getHistoricalMetrics(
  startTime: Date,
  endTime: Date,
  instanceId?: string
): Promise<Metric[]> {
  const cacheKey = `history:${startTime.toISOString()}:${endTime.toISOString()}:${instanceId || 'all'}`;

  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  let query = `
    SELECT * FROM metrics
    WHERE timestamp BETWEEN $1 AND $2
  `;
  const params: (Date | string)[] = [startTime, endTime];

  if (instanceId) {
    query += ` AND instance_id = $3`;
    params.push(instanceId);
  }

  query += ` ORDER BY timestamp ASC`;

  const result = await pool.query<Metric>(query, params);

  await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result.rows));

  return result.rows;
}

export async function getMetricStats(
  startTime: Date,
  endTime: Date
): Promise<MetricStats> {
  const result = await pool.query<MetricStats>(
    `SELECT
       ROUND(AVG(cpu_usage)::numeric, 2) as avg_cpu,
       ROUND(AVG(memory_usage)::numeric, 2) as avg_memory,
       SUM(request_count) as total_requests,
       ROUND(AVG(response_time)::numeric, 2) as avg_response_time,
       MAX(cpu_usage) as max_cpu,
       MAX(memory_usage) as max_memory
     FROM metrics
     WHERE timestamp BETWEEN $1 AND $2`,
    [startTime, endTime]
  );

  return result.rows[0];
}

export async function getInstances(): Promise<{ id: string; name: string; status: string }[]> {
  const result = await pool.query(
    `SELECT id, name, status FROM instances WHERE status = 'active' ORDER BY name`
  );
  return result.rows;
}

logger.debug('Metrics service initialized');
