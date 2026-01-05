# VPC Outputs
output "vpc_id" {
  description = "ID of the VPC"
  value       = module.vpc.vpc_id
}

output "public_subnet_ids" {
  description = "IDs of public subnets"
  value       = module.vpc.public_subnet_ids
}

output "private_subnet_ids" {
  description = "IDs of private subnets"
  value       = module.vpc.private_subnet_ids
}

# ALB Outputs
output "alb_dns_name" {
  description = "DNS name of the Application Load Balancer"
  value       = module.alb.dns_name
}

output "app_url" {
  description = "URL to access the application"
  value       = "http://${module.alb.dns_name}"
}

# RDS Outputs
output "rds_endpoint" {
  description = "RDS instance endpoint"
  value       = module.rds.endpoint
}

output "rds_port" {
  description = "RDS instance port"
  value       = module.rds.port
}

# ElastiCache Outputs
output "redis_endpoint" {
  description = "ElastiCache Redis endpoint"
  value       = module.elasticache.endpoint
}

# Auto Scaling Outputs
output "asg_name" {
  description = "Name of the Auto Scaling Group"
  value       = module.autoscaling.asg_name
}

# Connection Info
output "database_url" {
  description = "Database connection URL (without password)"
  value       = "postgresql://${var.db_username}:****@${module.rds.endpoint}:${module.rds.port}/${var.db_name}"
  sensitive   = true
}

output "redis_url" {
  description = "Redis connection URL"
  value       = "redis://${module.elasticache.endpoint}:6379"
}
