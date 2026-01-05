-- CloudMetrics Database Schema

-- Metrics table for storing time-series data
CREATE TABLE IF NOT EXISTS metrics (
    id SERIAL PRIMARY KEY,
    instance_id VARCHAR(50) NOT NULL,
    cpu_usage DECIMAL(5,2) NOT NULL,
    memory_usage DECIMAL(5,2) NOT NULL,
    request_count INTEGER NOT NULL DEFAULT 0,
    response_time DECIMAL(10,2) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for efficient time-range queries
CREATE INDEX idx_metrics_timestamp ON metrics(timestamp DESC);
CREATE INDEX idx_metrics_instance ON metrics(instance_id);
CREATE INDEX idx_metrics_instance_timestamp ON metrics(instance_id, timestamp DESC);

-- Alerts table for storing alert notifications
CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    instance_id VARCHAR(50),
    type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
    message TEXT NOT NULL,
    metric_value DECIMAL(10,2),
    threshold DECIMAL(10,2),
    acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
    acknowledged_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for alert queries
CREATE INDEX idx_alerts_created_at ON alerts(created_at DESC);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_acknowledged ON alerts(acknowledged);

-- Server instances table for tracking monitored instances
CREATE TABLE IF NOT EXISTS instances (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    ip_address VARCHAR(45),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
    region VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for instance queries
CREATE INDEX idx_instances_status ON instances(status);
