import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format } from 'date-fns';
import type { RealtimeMetric } from '../../types';

interface RealtimeChartProps {
  metrics: RealtimeMetric[];
  dataKey: 'cpu' | 'memory' | 'requests' | 'responseTime';
  title: string;
  unit?: string;
  maxPoints?: number;
}

// Colors for each instance
const INSTANCE_COLORS: Record<string, string> = {
  'i-server-01': '#3b82f6', // blue
  'i-server-02': '#10b981', // green
  'i-server-03': '#f59e0b', // orange
};

const INSTANCE_NAMES: Record<string, string> = {
  'i-server-01': 'Server 1',
  'i-server-02': 'Server 2',
  'i-server-03': 'Server 3',
};

export default function RealtimeChart({
  metrics,
  dataKey,
  title,
  unit = '',
  maxPoints = 20,
}: RealtimeChartProps) {
  const { chartData, instanceIds } = useMemo(() => {
    // Group by timestamp (rounded to seconds), with each instance as a separate field
    const grouped: Record<string, Record<string, number | string>> = {};
    const instances = new Set<string>();

    metrics.forEach((m) => {
      instances.add(m.instanceId);
      // Round timestamp to seconds to group metrics from the same broadcast
      const ts = new Date(m.timestamp);
      ts.setMilliseconds(0);
      const key = ts.toISOString();

      if (!grouped[key]) {
        grouped[key] = { timestamp: key };
      }
      grouped[key][m.instanceId] = m[dataKey];
    });

    const data = Object.values(grouped)
      .sort((a, b) => new Date(a.timestamp as string).getTime() - new Date(b.timestamp as string).getTime())
      .slice(-maxPoints);

    return { chartData: data, instanceIds: Array.from(instances).sort() };
  }, [metrics, dataKey, maxPoints]);

  if (chartData.length === 0) {
    return (
      <div className="card p-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{title}</h4>
        <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
          Waiting for data...
        </div>
      </div>
    );
  }

  return (
    <div className="card p-4">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{title}</h4>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" vertical={false} />
            <XAxis
              dataKey="timestamp"
              tick={{ fontSize: 10 }}
              className="text-gray-500"
              tickFormatter={(value) => format(new Date(value), 'HH:mm:ss')}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 10 }}
              className="text-gray-500"
              width={40}
              tickFormatter={(value) => `${value}${unit}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '12px',
              }}
              labelFormatter={(value) => format(new Date(value), 'HH:mm:ss')}
              formatter={(value: number, name: string) => [
                `${value.toFixed(2)}${unit}`,
                INSTANCE_NAMES[name] || name,
              ]}
            />
            <Legend
              formatter={(value) => INSTANCE_NAMES[value] || value}
              wrapperStyle={{ fontSize: '11px' }}
            />
            {instanceIds.map((instanceId) => (
              <Line
                key={instanceId}
                type="monotone"
                dataKey={instanceId}
                name={instanceId}
                stroke={INSTANCE_COLORS[instanceId] || '#888'}
                strokeWidth={2}
                dot={{ r: 2 }}
                activeDot={{ r: 4 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
