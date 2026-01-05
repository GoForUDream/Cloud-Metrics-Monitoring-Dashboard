import pg from 'pg';

const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL ||
  'postgresql://cloudmetrics:cloudmetrics_dev@localhost:5432/cloudmetrics';

const pool = new Pool({ connectionString: DATABASE_URL });

const INSTANCES = [
  { id: 'i-server-01', name: 'Web Server 1', region: 'us-east-1', ip: '10.0.1.10' },
  { id: 'i-server-02', name: 'Web Server 2', region: 'us-east-1', ip: '10.0.1.11' },
  { id: 'i-server-03', name: 'Web Server 3', region: 'us-west-2', ip: '10.0.2.10' },
];

function generateMetricValue(
  base: number,
  variance: number,
  min: number,
  max: number,
  hourOfDay: number
): number {
  // Simulate daily patterns - higher during business hours
  const hourFactor = Math.sin((hourOfDay - 6) * Math.PI / 12) * 0.3;
  const noise = (Math.random() - 0.5) * variance;
  const value = base + hourFactor * base + noise;
  return Math.max(min, Math.min(max, value));
}

async function seed(): Promise<void> {
  console.log('Starting database seed...');

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Clear existing data
    await client.query('DELETE FROM alerts');
    await client.query('DELETE FROM metrics');
    await client.query('DELETE FROM instances');

    // Insert instances
    for (const instance of INSTANCES) {
      await client.query(
        `INSERT INTO instances (id, name, ip_address, region, status)
         VALUES ($1, $2, $3, $4, 'active')`,
        [instance.id, instance.name, instance.ip, instance.region]
      );
    }
    console.log(`Inserted ${INSTANCES.length} instances`);

    // Generate 7 days of historical metrics
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const intervalMinutes = 5;
    let metricsCount = 0;

    const instanceState: Record<string, { baseCpu: number; baseMemory: number; baseRequests: number; baseResponseTime: number }> = {};

    for (const instance of INSTANCES) {
      instanceState[instance.id] = {
        baseCpu: 30 + Math.random() * 20,
        baseMemory: 45 + Math.random() * 15,
        baseRequests: 150 + Math.floor(Math.random() * 100),
        baseResponseTime: 80 + Math.random() * 40,
      };
    }

    for (
      let time = sevenDaysAgo.getTime();
      time <= now.getTime();
      time += intervalMinutes * 60 * 1000
    ) {
      const timestamp = new Date(time);
      const hourOfDay = timestamp.getHours();

      for (const instance of INSTANCES) {
        const state = instanceState[instance.id];

        // Slowly drift base values
        state.baseCpu += (Math.random() - 0.5) * 2;
        state.baseCpu = Math.max(25, Math.min(70, state.baseCpu));
        state.baseMemory += (Math.random() - 0.5) * 1;
        state.baseMemory = Math.max(35, Math.min(75, state.baseMemory));

        const cpu = generateMetricValue(state.baseCpu, 15, 5, 98, hourOfDay);
        const memory = generateMetricValue(state.baseMemory, 10, 20, 95, hourOfDay);
        const requests = Math.floor(
          generateMetricValue(state.baseRequests, 80, 10, 2000, hourOfDay)
        );
        const responseTime = generateMetricValue(
          state.baseResponseTime,
          40,
          20,
          800,
          hourOfDay
        );

        await client.query(
          `INSERT INTO metrics (instance_id, cpu_usage, memory_usage, request_count, response_time, timestamp)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            instance.id,
            parseFloat(cpu.toFixed(2)),
            parseFloat(memory.toFixed(2)),
            requests,
            parseFloat(responseTime.toFixed(2)),
            timestamp,
          ]
        );
        metricsCount++;
      }
    }
    console.log(`Inserted ${metricsCount} metrics records`);

    // Generate sample alerts
    const alertTypes = [
      { type: 'cpu', severity: 'warning', message: 'CPU usage elevated', value: 75, threshold: 70 },
      { type: 'cpu', severity: 'critical', message: 'CPU usage critical', value: 92, threshold: 90 },
      { type: 'memory', severity: 'warning', message: 'Memory usage high', value: 78, threshold: 75 },
      { type: 'memory', severity: 'critical', message: 'Memory usage critical', value: 96, threshold: 95 },
      { type: 'response_time', severity: 'warning', message: 'Response time slow', value: 650, threshold: 500 },
      { type: 'response_time', severity: 'critical', message: 'Response time critical', value: 1200, threshold: 1000 },
    ];

    let alertsCount = 0;
    for (let i = 0; i < 20; i++) {
      const alert = alertTypes[Math.floor(Math.random() * alertTypes.length)];
      const instance = INSTANCES[Math.floor(Math.random() * INSTANCES.length)];
      const createdAt = new Date(
        now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000
      );
      const acknowledged = Math.random() > 0.6;

      await client.query(
        `INSERT INTO alerts (instance_id, type, severity, message, metric_value, threshold, acknowledged, acknowledged_at, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          instance.id,
          alert.type,
          alert.severity,
          `${alert.message} on ${instance.name}`,
          alert.value + (Math.random() - 0.5) * 10,
          alert.threshold,
          acknowledged,
          acknowledged ? new Date(createdAt.getTime() + Math.random() * 60 * 60 * 1000) : null,
          createdAt,
        ]
      );
      alertsCount++;
    }
    console.log(`Inserted ${alertsCount} alerts`);

    await client.query('COMMIT');
    console.log('Database seed completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
