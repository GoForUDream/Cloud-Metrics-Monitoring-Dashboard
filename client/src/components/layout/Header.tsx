import { useSocket } from '../../hooks/useSocket';
import { clsx } from 'clsx';

export default function Header() {
  const { isConnected } = useSocket();

  return (
    <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between h-16 px-4 lg:px-8">
        <div className="flex items-center lg:hidden">
          <span className="text-lg font-semibold text-gray-900 dark:text-white">CloudMetrics</span>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className={clsx(
                'w-2 h-2 rounded-full',
                isConnected ? 'bg-green-500 animate-pulse-slow' : 'bg-red-500'
              )}
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {isConnected ? 'Live' : 'Disconnected'}
            </span>
          </div>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </div>
        </div>
      </div>
    </header>
  );
}
