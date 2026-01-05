import axios from 'axios';
import type {
  ApiResponse,
  CurrentMetrics,
  Metric,
  MetricStats,
  Alert,
  Instance,
} from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function getCurrentMetrics(): Promise<CurrentMetrics> {
  const { data } = await api.get<ApiResponse<CurrentMetrics>>('/metrics/current');
  return data.data;
}

export async function getHistoricalMetrics(
  start: Date,
  end: Date,
  instanceId?: string
): Promise<Metric[]> {
  const params = new URLSearchParams({
    start: start.toISOString(),
    end: end.toISOString(),
  });

  if (instanceId) {
    params.set('instance_id', instanceId);
  }

  const { data } = await api.get<ApiResponse<Metric[]>>(
    `/metrics/history?${params.toString()}`
  );
  return data.data;
}

export async function getMetricStats(start?: Date, end?: Date): Promise<MetricStats> {
  const params = new URLSearchParams();

  if (start) params.set('start', start.toISOString());
  if (end) params.set('end', end.toISOString());

  const { data } = await api.get<ApiResponse<MetricStats>>(
    `/metrics/stats?${params.toString()}`
  );
  return data.data;
}

export async function getInstances(): Promise<Instance[]> {
  const { data } = await api.get<ApiResponse<Instance[]>>('/metrics/instances');
  return data.data;
}

export async function getAlerts(
  limit = 50,
  includeAcknowledged = false
): Promise<Alert[]> {
  const params = new URLSearchParams({
    limit: limit.toString(),
    include_acknowledged: includeAcknowledged.toString(),
  });

  const { data } = await api.get<ApiResponse<Alert[]>>(`/alerts?${params.toString()}`);
  return data.data;
}

export async function acknowledgeAlert(alertId: number): Promise<Alert> {
  const { data } = await api.patch<ApiResponse<Alert>>(
    `/alerts/${alertId}/acknowledge`
  );
  return data.data;
}

export default api;
