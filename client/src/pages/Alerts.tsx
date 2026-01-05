import { useState } from 'react';
import { useAlerts, useAcknowledgeAlert } from '../hooks/useAlerts';
import { useRealtimeAlerts } from '../hooks/useSocket';
import { format } from 'date-fns';
import { clsx } from 'clsx';
import type { Alert } from '../types';

const severityColors = {
  info: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-800 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
  },
  warning: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    text: 'text-yellow-800 dark:text-yellow-300',
    border: 'border-yellow-200 dark:border-yellow-800',
  },
  critical: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-800 dark:text-red-300',
    border: 'border-red-200 dark:border-red-800',
  },
};

function AlertIcon({ severity }: { severity: Alert['severity'] }) {
  if (severity === 'critical') {
    return (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    );
  }
  if (severity === 'warning') {
    return (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
    );
  }
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
  );
}

export default function Alerts() {
  const [showAcknowledged, setShowAcknowledged] = useState(false);
  const { data: alerts, isLoading } = useAlerts(100, showAcknowledged);
  const { alerts: realtimeAlerts } = useRealtimeAlerts();
  const { mutate: acknowledgeAlert, isPending } = useAcknowledgeAlert();

  // Combine realtime alerts with fetched alerts
  const allAlerts = [
    ...realtimeAlerts.filter((a) => !alerts?.some((existing) => existing.id === a.id)),
    ...(alerts || []),
  ];

  const unacknowledgedCount = allAlerts.filter((a) => !a.acknowledged).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Alerts</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {unacknowledgedCount} unacknowledged alert{unacknowledgedCount !== 1 ? 's' : ''}
          </p>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showAcknowledged}
            onChange={(e) => setShowAcknowledged(e.target.checked)}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">Show acknowledged</span>
        </label>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : allAlerts.length === 0 ? (
        <div className="card p-8 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No alerts</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            All systems are operating normally.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {allAlerts.map((alert) => {
            const colors = severityColors[alert.severity];
            return (
              <div
                key={alert.id}
                className={clsx(
                  'card p-4 border-l-4',
                  colors.border,
                  alert.acknowledged && 'opacity-60'
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={clsx('p-2 rounded-lg', colors.bg, colors.text)}>
                    <AlertIcon severity={alert.severity} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {alert.message}
                        </p>
                        <div className="mt-1 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                          <span>{format(new Date(alert.created_at), 'MMM d, yyyy HH:mm:ss')}</span>
                          {alert.instance_id && (
                            <>
                              <span className="text-gray-300 dark:text-gray-600">|</span>
                              <span>{alert.instance_id}</span>
                            </>
                          )}
                          <span className="text-gray-300 dark:text-gray-600">|</span>
                          <span
                            className={clsx(
                              'px-1.5 py-0.5 rounded text-xs font-medium uppercase',
                              colors.bg,
                              colors.text
                            )}
                          >
                            {alert.severity}
                          </span>
                        </div>
                      </div>
                      {!alert.acknowledged && (
                        <button
                          onClick={() => acknowledgeAlert(alert.id)}
                          disabled={isPending}
                          className="btn btn-secondary text-sm py-1.5"
                        >
                          Acknowledge
                        </button>
                      )}
                      {alert.acknowledged && (
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          Acknowledged
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
