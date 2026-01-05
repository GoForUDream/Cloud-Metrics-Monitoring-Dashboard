import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { socketService } from '../services/socket';
import type { RealtimeMetric } from '../types';

interface MetricsContextValue {
  metricsHistory: RealtimeMetric[];
  latestMetrics: RealtimeMetric[];
}

const MetricsContext = createContext<MetricsContextValue | null>(null);

export function MetricsProvider({ children }: { children: ReactNode }) {
  const [metricsHistory, setMetricsHistory] = useState<RealtimeMetric[]>([]);
  const [latestMetrics, setLatestMetrics] = useState<RealtimeMetric[]>([]);

  useEffect(() => {
    // Connect socket if not already connected
    socketService.connect();

    const unsubscribe = socketService.onMetricsUpdate((newMetrics) => {
      setLatestMetrics(newMetrics);
      setMetricsHistory((prev) => {
        const combined = [...prev, ...newMetrics];
        // Keep last 200 data points (about 100 minutes at 30s intervals)
        return combined.slice(-200);
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <MetricsContext.Provider value={{ metricsHistory, latestMetrics }}>
      {children}
    </MetricsContext.Provider>
  );
}

export function useMetricsHistory() {
  const context = useContext(MetricsContext);
  if (!context) {
    throw new Error('useMetricsHistory must be used within MetricsProvider');
  }
  return context;
}
