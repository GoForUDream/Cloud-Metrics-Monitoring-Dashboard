# CloudMetrics

A real-time infrastructure monitoring dashboard built for learning cloud-native application development. Monitor CPU, memory, request counts, and response times across multiple server instances with live WebSocket updates.

![Dashboard Preview](https://via.placeholder.com/800x400?text=CloudMetrics+Dashboard)

## Features

- **Real-time Monitoring** - Live metrics updates every 5 seconds via WebSocket
- **Multi-instance Support** - Track metrics across multiple server instances
- **Interactive Charts** - Visualize trends with Recharts-powered graphs
- **Historical Analysis** - View and analyze data from the past 7 days
- **Alert System** - Automatic threshold-based alerts with severity levels
- **Responsive Design** - Works on desktop and mobile devices

## Tech Stack

### Frontend

| Technology       | Version | Purpose           |
| ---------------- | ------- | ----------------- |
| React            | 18.3    | UI framework      |
| TypeScript       | 5.6     | Type safety       |
| Vite             | 5.4     | Build tool        |
| Tailwind CSS     | 3.4     | Styling           |
| Recharts         | 2.14    | Charts & graphs   |
| TanStack Query   | 5.60    | Data fetching     |
| Socket.io Client | 4.8     | Real-time updates |

### Backend

| Technology | Version | Purpose          |
| ---------- | ------- | ---------------- |
| Node.js    | 20.x    | Runtime          |
| Express    | 4.21    | API framework    |
| TypeScript | 5.6     | Type safety      |
| Socket.io  | 4.8     | WebSocket server |
| PostgreSQL | 16      | Data persistence |
| Redis      | 7.4     | Caching layer    |
| Winston    | 3.17    | Logging          |

### Infrastructure (AWS)

| Service            | Purpose                                       |
| ------------------ | --------------------------------------------- |
| VPC                | Network isolation with public/private subnets |
| EC2 + Auto Scaling | Application servers with automatic scaling    |
| ALB                | Load balancing and health checks              |
| RDS PostgreSQL     | Managed database                              |
| ElastiCache Redis  | Managed caching                               |
| CloudWatch         | Monitoring and logging                        |
| Terraform          | Infrastructure as Code                        |

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  Dashboard  │  │   History   │  │   Alerts    │              │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
│         │                │                │                      │
│         └────────────────┼────────────────┘                      │
│                          │                                       │
│              ┌───────────┴───────────┐                          │
│              │    React Query +      │                          │
│              │    Socket.io Client   │                          │
│              └───────────┬───────────┘                          │
└──────────────────────────┼──────────────────────────────────────┘
                           │
                    HTTP + WebSocket
                           │
┌──────────────────────────┼──────────────────────────────────────┐
│                          │           Backend (Node.js)          │
│              ┌───────────┴───────────┐                          │
│              │   Express + Socket.io │                          │
│              └───────────┬───────────┘                          │
│                          │                                       │
│         ┌────────────────┼────────────────┐                     │
│         │                │                │                      │
│  ┌──────┴──────┐  ┌──────┴──────┐  ┌─────┴──────┐              │
│  │   Metrics   │  │   Alerts    │  │   Health   │              │
│  │   Service   │  │   Service   │  │   Check    │              │
│  └──────┬──────┘  └──────┬──────┘  └────────────┘              │
│         │                │                                       │
│         └────────┬───────┘                                      │
│                  │                                               │
│    ┌─────────────┴─────────────┐                                │
│    │                           │                                 │
│    ▼                           ▼                                 │
│ ┌──────────┐            ┌──────────┐                            │
│ │PostgreSQL│            │  Redis   │                            │
│ │(Storage) │            │ (Cache)  │                            │
│ └──────────┘            └──────────┘                            │
└─────────────────────────────────────────────────────────────────┘
```

For detailed AWS infrastructure documentation including architecture diagrams, security groups, deployment flow, and cost estimates, see [docs/INFRASTRUCTURE.md](docs/INFRASTRUCTURE.md).

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- Docker and Docker Compose
- npm 10.x or higher

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd CloudMetrics
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the databases**

   ```bash
   npm run db:up
   ```

4. **Seed the database** (creates 7 days of demo data)

   ```bash
   npm run db:seed
   ```

5. **Start the development servers**

   ```bash
   npm run dev
   ```

6. **Open the application**

   Navigate to [http://localhost:5173](http://localhost:5173)

## AWS Deployment

Deploy to AWS using Terraform. Requires AWS CLI and Terraform 1.0+ installed.

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars  # Edit with your values
terraform init
terraform apply
terraform output app_url  # Get application URL
```

To destroy all resources: `terraform destroy`

See [docs/INFRASTRUCTURE.md](docs/INFRASTRUCTURE.md) for detailed architecture, security configuration, and cost breakdown.

## Available Scripts

| Command              | Description                                         |
| -------------------- | --------------------------------------------------- |
| `npm run dev`        | Start both frontend and backend in development mode |
| `npm run dev:client` | Start frontend only (port 5173)                     |
| `npm run dev:server` | Start backend only (port 3001)                      |
| `npm run build`      | Build both packages for production                  |
| `npm run db:up`      | Start PostgreSQL and Redis containers               |
| `npm run db:down`    | Stop database containers                            |
| `npm run db:seed`    | Populate database with demo data                    |
| `npm run typecheck`  | Run TypeScript type checking                        |
| `npm run lint`       | Run ESLint                                          |

## API Reference

### Metrics

| Endpoint                 | Method | Description                            |
| ------------------------ | ------ | -------------------------------------- |
| `/api/metrics/current`   | GET    | Get current metrics for all instances  |
| `/api/metrics/history`   | GET    | Get historical metrics with time range |
| `/api/metrics/stats`     | GET    | Get aggregated statistics              |
| `/api/metrics/instances` | GET    | List monitored instances               |

#### Query Parameters

**GET /api/metrics/history**

- `start` (required) - ISO 8601 start timestamp
- `end` (required) - ISO 8601 end timestamp
- `instance_id` (optional) - Filter by specific instance

**GET /api/metrics/stats**

- `start` (optional) - ISO 8601 start timestamp (default: 24h ago)
- `end` (optional) - ISO 8601 end timestamp (default: now)

### Alerts

| Endpoint                      | Method | Description          |
| ----------------------------- | ------ | -------------------- |
| `/api/alerts`                 | GET    | Get all alerts       |
| `/api/alerts/:id/acknowledge` | PATCH  | Acknowledge an alert |

#### Query Parameters

**GET /api/alerts**

- `limit` (optional) - Number of alerts to return (default: 50)
- `include_acknowledged` (optional) - Include acknowledged alerts (default: false)

### WebSocket Events

| Event            | Direction       | Description                 |
| ---------------- | --------------- | --------------------------- |
| `metrics:update` | Server → Client | Real-time metrics broadcast |
| `alerts:new`     | Server → Client | New alert notifications     |

## Project Structure

```
CloudMetrics/
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── charts/         # Recharts visualizations
│   │   │   ├── dashboard/      # Dashboard-specific components
│   │   │   └── layout/         # App layout (sidebar, header)
│   │   ├── hooks/              # Custom React hooks
│   │   ├── pages/              # Route pages
│   │   ├── services/           # API and WebSocket clients
│   │   └── types/              # TypeScript type definitions
│   ├── package.json
│   └── vite.config.ts
├── server/                     # Express backend
│   ├── src/
│   │   ├── config/             # Configuration and connections
│   │   ├── controllers/        # Route handlers
│   │   ├── middleware/         # Express middleware
│   │   ├── routes/             # API route definitions
│   │   ├── services/           # Business logic
│   │   ├── socket/             # WebSocket handlers
│   │   └── utils/              # Utility functions
│   ├── scripts/
│   │   └── seed.ts             # Database seeding script
│   └── package.json
├── docker/
│   ├── docker-compose.yml      # Container definitions
│   └── init.sql                # Database schema
├── terraform/                  # AWS Infrastructure as Code
│   ├── main.tf                 # Root module configuration
│   ├── variables.tf            # Input variables
│   ├── outputs.tf              # Output values
│   ├── terraform.tfvars.example # Example configuration
│   └── modules/
│       ├── vpc/                # VPC and subnets
│       ├── ec2/                # Launch template and security groups
│       ├── rds/                # PostgreSQL database
│       ├── elasticache/        # Redis cache
│       ├── alb/                # Load balancer
│       ├── autoscaling/        # Auto Scaling Group
│       └── cloudwatch/         # Monitoring and alarms
├── docs/
│   └── INFRASTRUCTURE.md       # Detailed infrastructure documentation
└── package.json                # Root workspace configuration
```

## Alert Thresholds

The system automatically generates alerts when metrics exceed these thresholds:

| Metric        | Warning | Critical |
| ------------- | ------- | -------- |
| CPU Usage     | > 70%   | > 90%    |
| Memory Usage  | > 75%   | > 95%    |
| Response Time | > 500ms | > 1000ms |

## Environment Variables

Create a `.env` file in the `server/` directory to override defaults:

```env
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL=postgresql://cloudmetrics:cloudmetrics_dev@localhost:5432/cloudmetrics

# Redis
REDIS_URL=redis://localhost:6379

# CORS
CORS_ORIGIN=http://localhost:5173

# Metrics
METRICS_INTERVAL_MS=5000
```

## License

Khang Nguyen
