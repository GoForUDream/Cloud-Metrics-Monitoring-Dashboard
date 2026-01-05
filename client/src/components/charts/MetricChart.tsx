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

interface DataPoint {
  timestamp: string;
  [key: string]: string | number;
}

interface MetricChartProps {
  data: DataPoint[];
  lines: {
    dataKey: string;
    name: string;
    color: string;
  }[];
  title: string;
  yAxisLabel?: string;
  yAxisDomain?: [number, number];
}

export default function MetricChart({
  data,
  lines,
  title,
  yAxisLabel,
  yAxisDomain,
}: MetricChartProps) {
  return (
    <div className="card p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            <XAxis
              dataKey="timestamp"
              tick={{ fontSize: 12 }}
              className="text-gray-600 dark:text-gray-400"
              tickFormatter={(value) => format(new Date(value), 'HH:mm')}
            />
            <YAxis
              domain={yAxisDomain || ['auto', 'auto']}
              tick={{ fontSize: 12 }}
              className="text-gray-600 dark:text-gray-400"
              label={
                yAxisLabel
                  ? {
                      value: yAxisLabel,
                      angle: -90,
                      position: 'insideLeft',
                      style: { textAnchor: 'middle', fontSize: 12 },
                    }
                  : undefined
              }
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
              labelFormatter={(value) => format(new Date(value), 'MMM d, HH:mm:ss')}
            />
            <Legend />
            {lines.map((line) => (
              <Line
                key={line.dataKey}
                type="monotone"
                dataKey={line.dataKey}
                name={line.name}
                stroke={line.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
