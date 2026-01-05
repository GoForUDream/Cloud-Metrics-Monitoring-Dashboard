import { useMemo } from 'react';
import { useCurrentMetrics, useMetricStats } from '../hooks/useMetrics';
import { useMetricsHistory } from '../context/MetricsContext';
import MetricCard from '../components/dashboard/MetricCard';
import RealtimeChart from '../components/charts/RealtimeChart';

function CpuIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5M4.5 15.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z" />
    </svg>
  );
}

function MemoryIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" />
    </svg>
  );
}

function RequestIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
    </svg>
  );
}

function ResponseIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

export default function Dashboard() {
  const { data: currentMetrics } = useCurrentMetrics();
  const { data: stats } = useMetricStats();
  const { metricsHistory } = useMetricsHistory();

  // Calculate aggregated current values from all instances
  const aggregatedMetrics = useMemo(() => {
    if (!currentMetrics) return null;

    const instances = Object.values(currentMetrics);
    if (instances.length === 0) return null;

    const avgCpu = instances.reduce((sum, m) => sum + m.cpu_usage, 0) / instances.length;
    const avgMemory = instances.reduce((sum, m) => sum + m.memory_usage, 0) / instances.length;
    const totalRequests = instances.reduce((sum, m) => sum + m.request_count, 0);
    const avgResponseTime = instances.reduce((sum, m) => sum + m.response_time, 0) / instances.length;

    return {
      cpu: avgCpu,
      memory: avgMemory,
      requests: totalRequests,
      responseTime: avgResponseTime,
    };
  }, [currentMetrics]);

  // Calculate trend (difference from stats average)
  const trends = useMemo(() => {
    if (!aggregatedMetrics || !stats) return {};

    return {
      cpu: aggregatedMetrics.cpu - (stats.avg_cpu || 0),
      memory: aggregatedMetrics.memory - (stats.avg_memory || 0),
      responseTime: aggregatedMetrics.responseTime - (stats.avg_response_time || 0),
    };
  }, [aggregatedMetrics, stats]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Real-time infrastructure monitoring across {currentMetrics ? Object.keys(currentMetrics).length : 0} instances
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="CPU Usage"
          value={aggregatedMetrics?.cpu.toFixed(1) || '—'}
          unit="%"
          icon={<CpuIcon />}
          trend={trends.cpu}
          color="blue"
        />
        <MetricCard
          title="Memory Usage"
          value={aggregatedMetrics?.memory.toFixed(1) || '—'}
          unit="%"
          icon={<MemoryIcon />}
          trend={trends.memory}
          color="green"
        />
        <MetricCard
          title="Requests"
          value={aggregatedMetrics?.requests || '—'}
          unit="/min"
          icon={<RequestIcon />}
          color="yellow"
        />
        <MetricCard
          title="Response Time"
          value={aggregatedMetrics?.responseTime.toFixed(0) || '—'}
          unit="ms"
          icon={<ResponseIcon />}
          trend={trends.responseTime}
          color="purple"
        />
      </div>

      {/* Real-time Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RealtimeChart
          metrics={metricsHistory}
          dataKey="cpu"
          title="CPU Usage"
          unit="%"
        />
        <RealtimeChart
          metrics={metricsHistory}
          dataKey="memory"
          title="Memory Usage"
          unit="%"
        />
        <RealtimeChart
          metrics={metricsHistory}
          dataKey="requests"
          title="Request Count"
        />
        <RealtimeChart
          metrics={metricsHistory}
          dataKey="responseTime"
          title="Response Time"
          unit="ms"
        />
      </div>

      {/* Instance Details */}
      {currentMetrics && Object.keys(currentMetrics).length > 0 && (
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Instance Details</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Instance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    CPU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Memory
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Requests
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Response Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {Object.entries(currentMetrics).map(([instanceId, metrics]) => (
                  <tr key={instanceId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {instanceId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {metrics.cpu_usage.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {metrics.memory_usage.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {metrics.request_count.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {metrics.response_time.toFixed(0)} ms
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
