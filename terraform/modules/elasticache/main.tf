# ElastiCache Subnet Group
resource "aws_elasticache_subnet_group" "main" {
  name        = "${var.project_name}-${var.environment}-redis-subnet"
  description = "Redis subnet group for ${var.project_name}"
  subnet_ids  = var.subnet_ids

  tags = {
    Name = "${var.project_name}-${var.environment}-redis-subnet"
  }
}

# ElastiCache Security Group
resource "aws_security_group" "redis" {
  name        = "${var.project_name}-${var.environment}-redis-sg"
  description = "Security group for ElastiCache Redis"
  vpc_id      = var.vpc_id

  # Allow Redis from EC2 security group
  ingress {
    description     = "Redis from EC2"
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [var.ec2_sg_id]
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-redis-sg"
  }
}

# ElastiCache Redis Cluster
resource "aws_elasticache_cluster" "main" {
  cluster_id           = "${var.project_name}-${var.environment}-redis"
  engine               = "redis"
  engine_version       = "7.1"
  node_type            = var.node_type
  num_cache_nodes      = 1
  port                 = 6379
  parameter_group_name = "default.redis7"

  subnet_group_name  = aws_elasticache_subnet_group.main.name
  security_group_ids = [aws_security_group.redis.id]

  # Maintenance
  maintenance_window = "sun:05:00-sun:06:00"

  # Snapshots (disabled for cost savings in dev)
  snapshot_retention_limit = 0

  tags = {
    Name = "${var.project_name}-${var.environment}-redis"
  }
}
