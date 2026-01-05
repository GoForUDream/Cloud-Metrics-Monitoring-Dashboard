import { pool } from '../config/database.js';
import { logger } from '../utils/logger.js';

export interface Alert {
  id: number;
  instance_id: string | null;
  type: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  metric_value: number | null;
  threshold: number | null;
  acknowledged: boolean;
  acknowledged_at: Date | null;
  created_at: Date;
}

export interface AlertThresholds {
  cpu_warning: number;
  cpu_critical: number;
  memory_warning: number;
  memory_critical: number;
  response_time_warning: number;
  response_time_critical: number;
}

const DEFAULT_THRESHOLDS: AlertThresholds = {
  cpu_warning: 70,
  cpu_critical: 90,
  memory_warning: 75,
  memory_critical: 95,
  response_time_warning: 500,
  response_time_critical: 1000,
};

export async function createAlert(
  alert: Omit<Alert, 'id' | 'acknowledged' | 'acknowledged_at' | 'created_at'>
): Promise<Alert> {
  const result = await pool.query<Alert>(
    `INSERT INTO alerts (instance_id, type, severity, message, metric_value, threshold)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      alert.instance_id,
      alert.type,
      alert.severity,
      alert.message,
      alert.metric_value,
      alert.threshold,
    ]
  );

  logger.info('Alert created', { alertId: result.rows[0].id, severity: alert.severity });
  return result.rows[0];
}

export async function getAlerts(
  limit = 50,
  includeAcknowledged = false
): Promise<Alert[]> {
  let query = `SELECT * FROM alerts`;

  if (!includeAcknowledged) {
    query += ` WHERE acknowledged = false`;
  }

  query += ` ORDER BY created_at DESC LIMIT $1`;

  const result = await pool.query<Alert>(query, [limit]);
  return result.rows;
}

export async function acknowledgeAlert(alertId: number): Promise<Alert | null> {
  const result = await pool.query<Alert>(
    `UPDATE alerts
     SET acknowledged = true, acknowledged_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [alertId]
  );

  return result.rows[0] || null;
}

export async function checkThresholds(
  instanceId: string,
  cpu: number,
  memory: number,
  responseTime: number,
  thresholds: AlertThresholds = DEFAULT_THRESHOLDS
): Promise<Alert[]> {
  const alerts: Alert[] = [];

  // CPU checks
  if (cpu >= thresholds.cpu_critical) {
    const alert = await createAlert({
      instance_id: instanceId,
      type: 'cpu',
      severity: 'critical',
      message: `CPU usage critical: ${cpu.toFixed(1)}%`,
      metric_value: cpu,
      threshold: thresholds.cpu_critical,
    });
    alerts.push(alert);
  } else if (cpu >= thresholds.cpu_warning) {
    const alert = await createAlert({
      instance_id: instanceId,
      type: 'cpu',
      severity: 'warning',
      message: `CPU usage warning: ${cpu.toFixed(1)}%`,
      metric_value: cpu,
      threshold: thresholds.cpu_warning,
    });
    alerts.push(alert);
  }

  // Memory checks
  if (memory >= thresholds.memory_critical) {
    const alert = await createAlert({
      instance_id: instanceId,
      type: 'memory',
      severity: 'critical',
      message: `Memory usage critical: ${memory.toFixed(1)}%`,
      metric_value: memory,
      threshold: thresholds.memory_critical,
    });
    alerts.push(alert);
  } else if (memory >= thresholds.memory_warning) {
    const alert = await createAlert({
      instance_id: instanceId,
      type: 'memory',
      severity: 'warning',
      message: `Memory usage warning: ${memory.toFixed(1)}%`,
      metric_value: memory,
      threshold: thresholds.memory_warning,
    });
    alerts.push(alert);
  }

  // Response time checks
  if (responseTime >= thresholds.response_time_critical) {
    const alert = await createAlert({
      instance_id: instanceId,
      type: 'response_time',
      severity: 'critical',
      message: `Response time critical: ${responseTime.toFixed(0)}ms`,
      metric_value: responseTime,
      threshold: thresholds.response_time_critical,
    });
    alerts.push(alert);
  } else if (responseTime >= thresholds.response_time_warning) {
    const alert = await createAlert({
      instance_id: instanceId,
      type: 'response_time',
      severity: 'warning',
      message: `Response time warning: ${responseTime.toFixed(0)}ms`,
      metric_value: responseTime,
      threshold: thresholds.response_time_warning,
    });
    alerts.push(alert);
  }

  return alerts;
}
