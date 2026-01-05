#!/bin/bash
set -e

# Log output to file for debugging
exec > >(tee /var/log/user-data.log) 2>&1
echo "Starting user data script at $(date)"

# Update system
dnf update -y

# Install Node.js 20 and dependencies
dnf install -y nodejs20 npm git

# Install PM2 globally
npm install -g pm2

# Create app directory
mkdir -p /opt/cloudmetrics
cd /opt/cloudmetrics

# Clone the application repository
echo "Cloning CloudMetrics repository..."
git clone https://github.com/GoForUDream/Cloud-Metrics-Monitoring-Dashboard.git .

# Create environment file for server
cat > /opt/cloudmetrics/server/.env << EOF
PORT=${app_port}
DATABASE_URL=${database_url}
REDIS_URL=${redis_url}
CORS_ORIGIN=${cors_origin}
NODE_ENV=${node_env}
METRICS_INTERVAL_MS=30000
EOF

# Set permissions
chown -R ec2-user:ec2-user /opt/cloudmetrics

# Install dependencies and build
echo "Installing dependencies..."
cd /opt/cloudmetrics
sudo -u ec2-user npm install

echo "Building client..."
cd /opt/cloudmetrics/client
sudo -u ec2-user npm run build

echo "Building server..."
cd /opt/cloudmetrics/server
sudo -u ec2-user npm run build

# Copy client build to server for serving static files
# The compiled server code expects static files at dist/public/
mkdir -p /opt/cloudmetrics/server/dist/public
cp -r /opt/cloudmetrics/client/dist/* /opt/cloudmetrics/server/dist/public/

# Wait for RDS to be ready (it might take a few minutes)
echo "Waiting for database to be ready..."
sleep 30

# Export environment variables for seed script
export DATABASE_URL="${database_url}"
export REDIS_URL="${redis_url}"

# Run database seed (creates tables and initial data)
echo "Seeding database..."
cd /opt/cloudmetrics
sudo -E -u ec2-user npm run db:seed || echo "Seed failed or already seeded, continuing..."

# Start the server with PM2 (dotenv loads .env automatically)
echo "Starting CloudMetrics server..."
cd /opt/cloudmetrics/server
sudo -u ec2-user pm2 start dist/src/index.js --name cloudmetrics

# Save PM2 configuration and setup startup
sudo -u ec2-user pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ec2-user --hp /home/ec2-user

echo "==================================="
echo "CloudMetrics Deployment Complete!"
echo "==================================="
echo "Application running on port ${app_port}"
echo "Environment: ${node_env}"
echo "==================================="
echo "User data script completed at $(date)"
