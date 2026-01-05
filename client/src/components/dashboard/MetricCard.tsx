import { clsx } from 'clsx';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  trend?: number;
  color: 'blue' | 'green' | 'yellow' | 'purple';
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    icon: 'text-blue-600 dark:text-blue-400',
    text: 'text-blue-600 dark:text-blue-400',
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    icon: 'text-green-600 dark:text-green-400',
    text: 'text-green-600 dark:text-green-400',
  },
  yellow: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    icon: 'text-yellow-600 dark:text-yellow-400',
    text: 'text-yellow-600 dark:text-yellow-400',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    icon: 'text-purple-600 dark:text-purple-400',
    text: 'text-purple-600 dark:text-purple-400',
  },
};

export default function MetricCard({
  title,
  value,
  unit,
  icon,
  trend,
  color,
}: MetricCardProps) {
  const colors = colorClasses[color];

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <div className={clsx('p-3 rounded-lg', colors.bg)}>
          <div className={clsx('w-6 h-6', colors.icon)}>{icon}</div>
        </div>
        {trend !== undefined && (
          <div
            className={clsx(
              'flex items-center text-sm font-medium',
              trend >= 0 ? 'text-green-600' : 'text-red-600'
            )}
          >
            {trend >= 0 ? (
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
              </svg>
            ) : (
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            )}
            {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
          {typeof value === 'number' ? value.toLocaleString() : value}
          {unit && <span className="ml-1 text-lg text-gray-500 dark:text-gray-400">{unit}</span>}
        </p>
      </div>
    </div>
  );
}
