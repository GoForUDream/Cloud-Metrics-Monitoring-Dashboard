import { useEffect, useState, useCallback } from 'react';
import { socketService } from '../services/socket';
import type { RealtimeMetric, Alert } from '../types';

export function useSocket() {
  const [isConnected, setIsConnected] = useState(socketService.isConnected());

  useEffect(() => {
    socketService.connect();

    const unsubscribe = socketService.onConnectionChange(setIsConnected);

    return () => {
      unsubscribe();
    };
  }, []);

  return { isConnected };
}

export function useRealtimeMetrics() {
  const [metrics, setMetrics] = useState<RealtimeMetric[]>([]);

  useEffect(() => {
    const unsubscribe = socketService.onMetricsUpdate((newMetrics) => {
      setMetrics(newMetrics);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return metrics;
}

export function useRealtimeAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  useEffect(() => {
    const unsubscribe = socketService.onAlertsUpdate((newAlerts) => {
      setAlerts((prev) => [...newAlerts, ...prev].slice(0, 50));
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return { alerts, clearAlerts };
}
