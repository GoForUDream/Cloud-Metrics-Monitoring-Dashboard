#!/bin/bash
set -e

# Log output to file for debugging
exec > >(tee /var/log/user-data.log) 2>&1
echo "Starting user data script at $(date)"

# Update system
dnf update -y

# Install Node.js 20
dnf install -y nodejs20 npm git

# Install PM2 globally
npm install -g pm2

# Create app directory
mkdir -p /opt/cloudmetrics
cd /opt/cloudmetrics

# Clone the application (replace with your repo URL)
# For demo, we'll create a simple placeholder
cat > package.json << 'PACKAGEEOF'
{
  "name": "cloudmetrics-server",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node dist/index.js"
  }
}
PACKAGEEOF

# Create environment file
cat > /opt/cloudmetrics/.env << EOF
PORT=${app_port}
DATABASE_URL=${database_url}
REDIS_URL=${redis_url}
CORS_ORIGIN=${cors_origin}
NODE_ENV=${node_env}
METRICS_INTERVAL_MS=30000
EOF

# Set permissions
chown -R ec2-user:ec2-user /opt/cloudmetrics

# For a real deployment, you would:
# 1. Clone your repository
# 2. Run npm install
# 3. Build the application
# 4. Run database migrations
# 5. Start with PM2

echo "==================================="
echo "CloudMetrics EC2 Setup Complete"
echo "==================================="
echo "Environment variables configured at /opt/cloudmetrics/.env"
echo ""
echo "To deploy the actual application:"
echo "1. SSH into this instance or use SSM Session Manager"
echo "2. Clone your repository to /opt/cloudmetrics"
echo "3. Run: npm install && npm run build"
echo "4. Run: npm run db:migrate (if you have migrations)"
echo "5. Run: pm2 start npm --name cloudmetrics -- start"
echo "==================================="

# Create a simple health check server for ALB
cat > /opt/cloudmetrics/health.js << 'HEALTHEOF'
import http from 'http';

const PORT = process.env.PORT || 3001;

const server = http.createServer((req, res) => {
  if (req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }));
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head><title>CloudMetrics</title></head>
      <body style="font-family: system-ui; padding: 40px; background: #1a1a2e; color: #eee;">
        <h1>CloudMetrics Server</h1>
        <p>EC2 instance is running. Deploy the full application to enable all features.</p>
        <p>Health check: <a href="/api/health" style="color: #4ade80;">/api/health</a></p>
        <hr style="border-color: #333;">
        <p style="color: #888;">Instance ready at $(date)</p>
      </body>
      </html>
    `);
  }
});

server.listen(PORT, () => {
  console.log('Health check server running on port ' + PORT);
});
HEALTHEOF

# Start the health check server with PM2
cd /opt/cloudmetrics
sudo -u ec2-user pm2 start health.js --name cloudmetrics-health
sudo -u ec2-user pm2 save
sudo -u ec2-user pm2 startup systemd -u ec2-user --hp /home/ec2-user

echo "User data script completed at $(date)"
