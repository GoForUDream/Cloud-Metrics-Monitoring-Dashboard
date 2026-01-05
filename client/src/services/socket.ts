import { io, Socket } from 'socket.io-client';
import type { RealtimeMetric, Alert } from '../types';

type MetricsUpdateCallback = (metrics: RealtimeMetric[]) => void;
type AlertsCallback = (alerts: Alert[]) => void;
type ConnectionCallback = (connected: boolean) => void;

class SocketService {
  private socket: Socket | null = null;
  private metricsCallbacks: Set<MetricsUpdateCallback> = new Set();
  private alertsCallbacks: Set<AlertsCallback> = new Set();
  private connectionCallbacks: Set<ConnectionCallback> = new Set();

  connect(): void {
    if (this.socket?.connected) return;

    this.socket = io({
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.connectionCallbacks.forEach((cb) => cb(true));
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.connectionCallbacks.forEach((cb) => cb(false));
    });

    this.socket.on('metrics:update', (metrics: RealtimeMetric[]) => {
      this.metricsCallbacks.forEach((cb) => cb(metrics));
    });

    this.socket.on('alerts:new', (alerts: Alert[]) => {
      this.alertsCallbacks.forEach((cb) => cb(alerts));
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  onMetricsUpdate(callback: MetricsUpdateCallback): () => void {
    this.metricsCallbacks.add(callback);
    return () => {
      this.metricsCallbacks.delete(callback);
    };
  }

  onAlertsUpdate(callback: AlertsCallback): () => void {
    this.alertsCallbacks.add(callback);
    return () => {
      this.alertsCallbacks.delete(callback);
    };
  }

  onConnectionChange(callback: ConnectionCallback): () => void {
    this.connectionCallbacks.add(callback);
    return () => {
      this.connectionCallbacks.delete(callback);
    };
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const socketService = new SocketService();
