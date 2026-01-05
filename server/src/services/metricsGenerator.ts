import { saveMetric } from './metricsService.js';
import { checkThresholds } from './alertService.js';
import { logger } from '../utils/logger.js';
import type { Server as SocketServer } from 'socket.io';

const INSTANCES = ['i-server-01', 'i-server-02', 'i-server-03'];

interface GeneratorState {
  [instanceId: string]: {
    baseCpu: number;
    baseMemory: number;
    baseRequests: number;
    baseResponseTime: number;
    trend: number;
  };
}

const state: GeneratorState = {};

// Initialize state for each instance with different base values
for (const instanceId of INSTANCES) {
  state[instanceId] = {
    baseCpu: 30 + Math.random() * 20,
    baseMemory: 40 + Math.random() * 20,
    baseRequests: 100 + Math.floor(Math.random() * 200),
    baseResponseTime: 50 + Math.random() * 100,
    trend: 0,
  };
}

function generateRealisticMetric(
  base: number,
  variance: number,
  min: number,
  max: number,
  trend: number
): number {
  // Add some noise and trend
  const noise = (Math.random() - 0.5) * variance;
  const trendEffect = trend * variance * 0.5;
  const value = base + noise + trendEffect;
  return Math.max(min, Math.min(max, value));
}

function updateTrend(instanceId: string): void {
  // Randomly change trend direction occasionally
  if (Math.random() < 0.1) {
    state[instanceId].trend = (Math.random() - 0.5) * 2;
  }

  // Gradually return trend to 0
  state[instanceId].trend *= 0.95;

  // Occasionally simulate a spike
  if (Math.random() < 0.02) {
    state[instanceId].trend = Math.random() < 0.5 ? 2 : -1;
  }
}

export async function generateMetrics(io: SocketServer): Promise<void> {
  const metrics: Array<{
    instanceId: string;
    cpu: number;
    memory: number;
    requests: number;
    responseTime: number;
    timestamp: Date;
  }> = [];

  for (const instanceId of INSTANCES) {
    updateTrend(instanceId);
    const s = state[instanceId];

    // Slowly drift base values
    s.baseCpu += (Math.random() - 0.5) * 2;
    s.baseCpu = Math.max(20, Math.min(80, s.baseCpu));

    s.baseMemory += (Math.random() - 0.5) * 1;
    s.baseMemory = Math.max(30, Math.min(85, s.baseMemory));

    const cpu = generateRealisticMetric(s.baseCpu, 15, 0, 100, s.trend);
    const memory = generateRealisticMetric(s.baseMemory, 10, 0, 100, s.trend);
    const requests = Math.floor(
      generateRealisticMetric(s.baseRequests, 100, 0, 10000, s.trend)
    );
    const responseTime = generateRealisticMetric(
      s.baseResponseTime,
      50,
      10,
      2000,
      s.trend
    );

    const timestamp = new Date();

    try {
      await saveMetric({
        instance_id: instanceId,
        cpu_usage: parseFloat(cpu.toFixed(2)),
        memory_usage: parseFloat(memory.toFixed(2)),
        request_count: requests,
        response_time: parseFloat(responseTime.toFixed(2)),
        timestamp,
      });

      metrics.push({
        instanceId,
        cpu: parseFloat(cpu.toFixed(2)),
        memory: parseFloat(memory.toFixed(2)),
        requests,
        responseTime: parseFloat(responseTime.toFixed(2)),
        timestamp,
      });

      // Check thresholds and emit alerts
      const alerts = await checkThresholds(instanceId, cpu, memory, responseTime);
      if (alerts.length > 0) {
        io.emit('alerts:new', alerts);
      }
    } catch (error) {
      logger.error('Failed to save metric', { instanceId, error });
    }
  }

  // Emit metrics update to all connected clients
  io.emit('metrics:update', metrics);
  logger.debug('Metrics generated and broadcast', { count: metrics.length });
}

let intervalId: NodeJS.Timeout | null = null;

export function startMetricsGenerator(io: SocketServer, intervalMs: number): void {
  if (intervalId) {
    logger.warn('Metrics generator already running');
    return;
  }

  logger.info('Starting metrics generator', { intervalMs });

  // Generate initial metrics
  generateMetrics(io);

  intervalId = setInterval(() => {
    generateMetrics(io);
  }, intervalMs);
}

export function stopMetricsGenerator(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    logger.info('Metrics generator stopped');
  }
}
