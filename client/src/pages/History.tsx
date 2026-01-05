import { useState, useMemo } from 'react';
import { useHistoricalMetrics, useInstances } from '../hooks/useMetrics';
import MetricChart from '../components/charts/MetricChart';
import { subHours, subDays, format } from 'date-fns';

type TimeRange = '1h' | '6h' | '24h' | '7d';

const timeRanges: { label: string; value: TimeRange }[] = [
  { label: '1 Hour', value: '1h' },
  { label: '6 Hours', value: '6h' },
  { label: '24 Hours', value: '24h' },
  { label: '7 Days', value: '7d' },
];

function getTimeRange(range: TimeRange): { start: Date; end: Date } {
  const end = new Date();
  let start: Date;

  switch (range) {
    case '1h':
      start = subHours(end, 1);
      break;
    case '6h':
      start = subHours(end, 6);
      break;
    case '24h':
      start = subDays(end, 1);
      break;
    case '7d':
      start = subDays(end, 7);
      break;
  }

  return { start, end };
}

export default function History() {
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [selectedInstance, setSelectedInstance] = useState<string>('');

  // Memoize time range to prevent infinite re-renders
  const { start, end } = useMemo(() => getTimeRange(timeRange), [timeRange]);

  const { data: instances } = useInstances();
  const { data: metrics, isLoading } = useHistoricalMetrics(
    start,
    end,
    selectedInstance || undefined
  );

  // Transform metrics for charts
  const chartData = useMemo(() => {
    if (!metrics) return [];

    // Aggregate by timestamp (average across instances if no filter)
    const grouped = metrics.reduce(
      (acc, m) => {
        const key = m.timestamp;
        if (!acc[key]) {
          acc[key] = {
            timestamp: m.timestamp,
            cpu: [],
            memory: [],
            requests: [],
            responseTime: [],
          };
        }
        acc[key].cpu.push(m.cpu_usage);
        acc[key].memory.push(m.memory_usage);
        acc[key].requests.push(m.request_count);
        acc[key].responseTime.push(m.response_time);
        return acc;
      },
      {} as Record<
        string,
        {
          timestamp: string;
          cpu: number[];
          memory: number[];
          requests: number[];
          responseTime: number[];
        }
      >
    );

    return Object.values(grouped)
      .map((g) => ({
        timestamp: g.timestamp,
        cpu: g.cpu.reduce((a, b) => a + b, 0) / g.cpu.length,
        memory: g.memory.reduce((a, b) => a + b, 0) / g.memory.length,
        requests: g.requests.reduce((a, b) => a + b, 0),
        responseTime: g.responseTime.reduce((a, b) => a + b, 0) / g.responseTime.length,
      }))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [metrics]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Historical Data</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            View metrics history from {format(start, 'MMM d, HH:mm')} to {format(end, 'MMM d, HH:mm')}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Instance Filter */}
          <select
            value={selectedInstance}
            onChange={(e) => setSelectedInstance(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Instances</option>
            {instances?.map((instance) => (
              <option key={instance.id} value={instance.id}>
                {instance.name}
              </option>
            ))}
          </select>

          {/* Time Range Selector */}
          <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
            {timeRanges.map((range) => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value)}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  timeRange === range.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : chartData.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">No data available for the selected time range.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MetricChart
            data={chartData}
            lines={[{ dataKey: 'cpu', name: 'CPU Usage', color: '#3b82f6' }]}
            title="CPU Usage"
            yAxisLabel="%"
            yAxisDomain={[0, 100]}
          />
          <MetricChart
            data={chartData}
            lines={[{ dataKey: 'memory', name: 'Memory Usage', color: '#10b981' }]}
            title="Memory Usage"
            yAxisLabel="%"
            yAxisDomain={[0, 100]}
          />
          <MetricChart
            data={chartData}
            lines={[{ dataKey: 'requests', name: 'Requests', color: '#f59e0b' }]}
            title="Request Count"
          />
          <MetricChart
            data={chartData}
            lines={[{ dataKey: 'responseTime', name: 'Response Time', color: '#8b5cf6' }]}
            title="Response Time"
            yAxisLabel="ms"
          />
        </div>
      )}
    </div>
  );
}
