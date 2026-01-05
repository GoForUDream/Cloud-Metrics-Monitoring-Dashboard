# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CloudMetrics is a full-stack real-time infrastructure monitoring dashboard. It displays system metrics (CPU, Memory, Request count, Response time) from multiple server instances with live WebSocket updates.

## Tech Stack

- **Frontend**: React 18.3 + TypeScript + Vite 5.4 + Tailwind CSS 3.4 + Recharts
- **Backend**: Node.js 20 + Express 4.21 + TypeScript + Socket.io
- **Database**: PostgreSQL 16 (metrics storage) + Redis 7.4 (caching)
- **Infrastructure**: Docker Compose for local development

## Common Commands

```bash
# Install all dependencies (from root)
npm install

# Start Docker containers (PostgreSQL + Redis)
npm run db:up

# Seed database with demo data
npm run db:seed

# Run development servers (both frontend and backend)
npm run dev

# Run frontend only (port 5173)
npm run dev:client

# Run backend only (port 3001)
npm run dev:server

# Stop Docker containers
npm run db:down

# Type check both projects
npm run typecheck

# Build for production
npm run build
```

## Architecture

### Monorepo Structure
Uses npm workspaces with two packages:
- `client/` - React SPA
- `server/` - Express API + WebSocket server

### Backend Flow
1. `src/index.ts` - Entry point, starts HTTP server and Socket.io
2. `src/services/metricsGenerator.ts` - Simulates metrics from 3 server instances every 5 seconds
3. Metrics saved to PostgreSQL, cached in Redis
4. Real-time broadcasts via Socket.io (`metrics:update`, `alerts:new` events)
5. Alert thresholds checked on each metric update (CPU > 70/90%, Memory > 75/95%, Response time > 500/1000ms)

### Frontend Flow
1. `src/App.tsx` - React Router with 3 pages: Dashboard, History, Alerts
2. `src/hooks/useSocket.ts` - Manages Socket.io connection and event listeners
3. `src/hooks/useMetrics.ts` - React Query hooks for API calls
4. Real-time charts accumulate WebSocket data in component state

### API Endpoints
- `GET /api/metrics/current` - Latest metrics per instance (cached in Redis)
- `GET /api/metrics/history?start=&end=&instance_id=` - Historical data
- `GET /api/metrics/stats?start=&end=` - Aggregated statistics
- `GET /api/alerts?limit=&include_acknowledged=` - Alert list
- `PATCH /api/alerts/:id/acknowledge` - Mark alert as acknowledged
- `GET /api/health` - Health check

### WebSocket Events
- `metrics:update` - Broadcast every 5 seconds with all instance metrics
- `alerts:new` - Broadcast when threshold exceeded

### Database Schema
- `metrics` - Time-series data (instance_id, cpu_usage, memory_usage, request_count, response_time, timestamp)
- `alerts` - Threshold violations (type, severity, message, acknowledged)
- `instances` - Server instance registry

## Environment Variables

Backend defaults (can be overridden):
```
PORT=3001
DATABASE_URL=postgresql://cloudmetrics:cloudmetrics_dev@localhost:5432/cloudmetrics
REDIS_URL=redis://localhost:6379
CORS_ORIGIN=http://localhost:5173
METRICS_INTERVAL_MS=5000
```

## Key Files

- `docker/docker-compose.yml` - PostgreSQL + Redis containers
- `docker/init.sql` - Database schema
- `server/scripts/seed.ts` - Generates 7 days of historical data
- `server/src/services/metricsGenerator.ts` - Simulated metrics with realistic patterns
- `client/src/components/charts/RealtimeChart.tsx` - Live updating area charts
- `client/src/pages/Dashboard.tsx` - Main monitoring view
