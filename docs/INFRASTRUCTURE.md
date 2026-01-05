# CloudMetrics Infrastructure

## Architecture Overview

```
                                    ┌─────────────────────────────────────────────────────────────┐
                                    │                         AWS Cloud                           │
                                    │                                                             │
    ┌──────────┐                    │  ┌─────────────────────────────────────────────────────┐   │
    │  Users   │                    │  │                    VPC (10.0.0.0/16)                │   │
    └────┬─────┘                    │  │                                                     │   │
         │                          │  │  ┌─────────────────────────────────────────────┐   │   │
         │ HTTPS                    │  │  │            Public Subnets (10.0.1.0/24)     │   │   │
         ▼                          │  │  │                                             │   │   │
┌─────────────────┐                 │  │  │  ┌─────────────────────────────────────┐   │   │   │
│ Application     │─────────────────┼──┼──┼─▶│      Application Load Balancer      │   │   │   │
│ Load Balancer   │                 │  │  │  │         (Internet-facing)           │   │   │   │
│ DNS Endpoint    │                 │  │  │  └──────────────────┬──────────────────┘   │   │   │
└─────────────────┘                 │  │  │                     │                       │   │   │
                                    │  │  │                     │ Port 80/443           │   │   │
                                    │  │  │                     ▼                       │   │   │
                                    │  │  │  ┌──────────────────────────────────────┐  │   │   │
                                    │  │  │  │         Auto Scaling Group           │  │   │   │
                                    │  │  │  │  ┌────────────┐    ┌────────────┐   │  │   │   │
                                    │  │  │  │  │EC2 (t3.micro)│  │EC2 (t3.micro)│  │  │   │   │
                                    │  │  │  │  │  - Node.js  │    │  - Node.js  │  │  │   │   │
                                    │  │  │  │  │  - React    │    │  - React    │  │  │   │   │
                                    │  │  │  │  └──────┬──────┘    └──────┬──────┘  │  │   │   │
                                    │  │  │  └─────────┼──────────────────┼─────────┘  │   │   │
                                    │  │  │            │                  │            │   │   │
                                    │  │  └────────────┼──────────────────┼────────────┘   │   │
                                    │  │               │                  │                │   │
                                    │  │  ┌────────────┼──────────────────┼────────────┐   │   │
                                    │  │  │            ▼                  ▼            │   │   │
                                    │  │  │  ┌─────────────────────────────────────┐  │   │   │
                                    │  │  │  │           RDS PostgreSQL            │  │   │   │
                                    │  │  │  │            (db.t3.micro)            │  │   │   │
                                    │  │  │  │         - Metrics storage           │  │   │   │
                                    │  │  │  │         - Alert history             │  │   │   │
                                    │  │  │  └─────────────────────────────────────┘  │   │   │
                                    │  │  │                                           │   │   │
                                    │  │  │  ┌─────────────────────────────────────┐  │   │   │
                                    │  │  │  │         ElastiCache Redis           │  │   │   │
                                    │  │  │  │          (cache.t3.micro)           │  │   │   │
                                    │  │  │  │         - Session cache             │  │   │   │
                                    │  │  │  │         - Real-time metrics         │  │   │   │
                                    │  │  │  └─────────────────────────────────────┘  │   │   │
                                    │  │  │                                           │   │   │
                                    │  │  │            Database Subnets               │   │   │
                                    │  │  │             (10.0.2.0/24)                 │   │   │
                                    │  │  └───────────────────────────────────────────┘   │   │
                                    │  │                                                   │   │
                                    │  └───────────────────────────────────────────────────┘   │
                                    │                                                          │
                                    │  ┌────────────────────────────────────────────────────┐  │
                                    │  │                    CloudWatch                      │  │
                                    │  │  - EC2 metrics (CPU, Memory, Network)              │  │
                                    │  │  - RDS metrics (Connections, IOPS)                 │  │
                                    │  │  - ALB metrics (Request count, Latency)            │  │
                                    │  │  - Application logs                                │  │
                                    │  └────────────────────────────────────────────────────┘  │
                                    │                                                          │
                                    └──────────────────────────────────────────────────────────┘
```

## AWS Services Used

### Networking

| Service | Purpose | Configuration |
|---------|---------|---------------|
| **VPC** | Isolated network environment | CIDR: 10.0.0.0/16 |
| **Public Subnets** | Host ALB and EC2 instances | 10.0.1.0/24, 10.0.3.0/24 (2 AZs) |
| **Private Subnets** | Host RDS and ElastiCache | 10.0.2.0/24, 10.0.4.0/24 (2 AZs) |
| **Internet Gateway** | Public internet access | Attached to VPC |
| **Security Groups** | Firewall rules | ALB, EC2, RDS, Redis |

### Compute

| Service | Purpose | Configuration |
|---------|---------|---------------|
| **EC2** | Application servers | t3.micro, Amazon Linux 2023 |
| **Auto Scaling Group** | Automatic scaling | Min: 1, Max: 2, Desired: 1 |
| **Application Load Balancer** | Traffic distribution | Internet-facing, HTTP/HTTPS |

### Database

| Service | Purpose | Configuration |
|---------|---------|---------------|
| **RDS PostgreSQL** | Metrics & alerts storage | db.t3.micro, 20GB gp2 |
| **ElastiCache Redis** | Caching layer | cache.t3.micro, single node |

### Monitoring

| Service | Purpose | Configuration |
|---------|---------|---------------|
| **CloudWatch** | Metrics & logging | Basic monitoring (free tier) |
| **CloudWatch Alarms** | Alert on thresholds | CPU > 80%, Memory > 80% |

## Security Architecture

### Security Groups

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Security Group Rules                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ALB Security Group (sg-alb)                                        │
│  ├── Inbound:  80/443 from 0.0.0.0/0 (Internet)                    │
│  └── Outbound: All traffic                                          │
│                                                                      │
│  EC2 Security Group (sg-ec2)                                        │
│  ├── Inbound:  3001 from sg-alb (ALB only)                         │
│  ├── Inbound:  22 from your IP (SSH access)                        │
│  └── Outbound: All traffic                                          │
│                                                                      │
│  RDS Security Group (sg-rds)                                        │
│  ├── Inbound:  5432 from sg-ec2 (EC2 only)                         │
│  └── Outbound: None                                                 │
│                                                                      │
│  Redis Security Group (sg-redis)                                    │
│  ├── Inbound:  6379 from sg-ec2 (EC2 only)                         │
│  └── Outbound: None                                                 │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### IAM Roles

- **EC2 Instance Role**: CloudWatch Logs write, SSM access
- **No public database access**: RDS and Redis only accessible from EC2

## Deployment Flow

```
1. Infrastructure Provisioning (Terraform)
   └── terraform apply
       ├── Creates VPC and networking
       ├── Provisions RDS PostgreSQL
       ├── Provisions ElastiCache Redis
       ├── Creates ALB and target groups
       └── Launches EC2 via Auto Scaling

2. Application Deployment (User Data Script)
   └── EC2 instance launch
       ├── Install Node.js 20
       ├── Clone application repository
       ├── Install dependencies
       ├── Build frontend (npm run build)
       ├── Run database migrations
       └── Start application with PM2

3. Traffic Flow
   └── User request
       ├── ALB receives request
       ├── Routes to healthy EC2 instance
       ├── Node.js serves React app + API
       ├── API queries RDS/Redis
       └── Response returned to user
```

## Cost Estimate (Minimal Setup)

| Service | Specification | Hourly Cost | Monthly (730 hrs) |
|---------|--------------|-------------|-------------------|
| EC2 | t3.micro x1 | $0.0104 | $7.59* |
| RDS | db.t3.micro | $0.017 | $12.41* |
| ElastiCache | cache.t3.micro | $0.017 | $12.41 |
| ALB | Fixed + LCU | ~$0.025 | ~$18.25 |
| Data Transfer | ~1GB out | - | ~$0.09 |
| **Total** | | | **~$50.75/mo** |

*Free tier eligible for first 12 months (750 hours each)

### For Quick Demo (Few Minutes)
- **Estimated cost: $0.50 - $1.00**
- Billed by the hour/second for most services
- Remember to run `terraform destroy` after testing

## Terraform Modules

```
terraform/
├── main.tf                 # Root module, provider config
├── variables.tf            # Input variables
├── outputs.tf              # Output values
├── terraform.tfvars        # Variable values (gitignored)
│
└── modules/
    ├── vpc/                # VPC, subnets, IGW, route tables
    │   ├── main.tf
    │   ├── variables.tf
    │   └── outputs.tf
    │
    ├── ec2/                # Launch template, user data
    │   ├── main.tf
    │   ├── variables.tf
    │   └── outputs.tf
    │
    ├── rds/                # PostgreSQL instance
    │   ├── main.tf
    │   ├── variables.tf
    │   └── outputs.tf
    │
    ├── elasticache/        # Redis cluster
    │   ├── main.tf
    │   ├── variables.tf
    │   └── outputs.tf
    │
    ├── alb/                # Load balancer, target groups
    │   ├── main.tf
    │   ├── variables.tf
    │   └── outputs.tf
    │
    ├── autoscaling/        # ASG, scaling policies
    │   ├── main.tf
    │   ├── variables.tf
    │   └── outputs.tf
    │
    └── cloudwatch/         # Alarms, dashboards
        ├── main.tf
        ├── variables.tf
        └── outputs.tf
```

## Quick Start

```bash
# 1. Navigate to terraform directory
cd terraform

# 2. Initialize Terraform
terraform init

# 3. Review the plan
terraform plan

# 4. Apply infrastructure
terraform apply

# 5. Get ALB DNS endpoint
terraform output alb_dns_name

# 6. Access application
open http://$(terraform output -raw alb_dns_name)

# 7. IMPORTANT: Destroy when done to avoid charges
terraform destroy
```

## Environment Variables (EC2)

The application expects these environment variables, configured via EC2 user data:

```bash
PORT=3001
DATABASE_URL=postgresql://user:pass@rds-endpoint:5432/cloudmetrics
REDIS_URL=redis://elasticache-endpoint:6379
CORS_ORIGIN=http://alb-dns-name
NODE_ENV=production
```

## Monitoring & Alerts

CloudWatch monitors:
- **EC2**: CPU utilization, network I/O, status checks
- **RDS**: CPU, connections, read/write IOPS, free storage
- **ALB**: Request count, target response time, HTTP 5xx errors
- **Application**: Custom metrics via CloudWatch agent (optional)

## Disaster Recovery

For this demo setup:
- **RDS**: Daily automated backups (7-day retention)
- **EC2**: Stateless, can be replaced by Auto Scaling
- **No multi-AZ**: Single AZ deployment to minimize costs

For production, consider:
- Multi-AZ RDS deployment
- Cross-region backups
- Route 53 health checks with failover
