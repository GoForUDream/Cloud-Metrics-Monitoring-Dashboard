export interface Metric {
  id: number;
  instance_id: string;
  cpu_usage: number;
  memory_usage: number;
  request_count: number;
  response_time: number;
  timestamp: string;
}

export interface CurrentMetrics {
  [instanceId: string]: {
    cpu_usage: number;
    memory_usage: number;
    request_count: number;
    response_time: number;
    timestamp: string;
  };
}

export interface MetricStats {
  avg_cpu: number;
  avg_memory: number;
  total_requests: number;
  avg_response_time: number;
  max_cpu: number;
  max_memory: number;
}

export interface Alert {
  id: number;
  instance_id: string | null;
  type: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  metric_value: number | null;
  threshold: number | null;
  acknowledged: boolean;
  acknowledged_at: string | null;
  created_at: string;
}

export interface Instance {
  id: string;
  name: string;
  status: string;
}

export interface RealtimeMetric {
  instanceId: string;
  cpu: number;
  memory: number;
  requests: number;
  responseTime: number;
  timestamp: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}
