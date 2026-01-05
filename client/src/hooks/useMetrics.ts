import { useQuery } from '@tanstack/react-query';
import * as api from '../services/api';

export function useCurrentMetrics() {
  return useQuery({
    queryKey: ['metrics', 'current'],
    queryFn: api.getCurrentMetrics,
    refetchInterval: 5000,
  });
}

export function useHistoricalMetrics(
  start: Date,
  end: Date,
  instanceId?: string
) {
  return useQuery({
    queryKey: ['metrics', 'history', start.toISOString(), end.toISOString(), instanceId],
    queryFn: () => api.getHistoricalMetrics(start, end, instanceId),
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useMetricStats(start?: Date, end?: Date) {
  return useQuery({
    queryKey: ['metrics', 'stats', start?.toISOString(), end?.toISOString()],
    queryFn: () => api.getMetricStats(start, end),
    refetchInterval: 30000,
  });
}

export function useInstances() {
  return useQuery({
    queryKey: ['instances'],
    queryFn: api.getInstances,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
