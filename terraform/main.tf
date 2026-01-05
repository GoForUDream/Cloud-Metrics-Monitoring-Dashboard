terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "CloudMetrics"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# Data source for availability zones
data "aws_availability_zones" "available" {
  state = "available"
}

# VPC Module
module "vpc" {
  source = "./modules/vpc"

  project_name       = var.project_name
  environment        = var.environment
  vpc_cidr           = var.vpc_cidr
  availability_zones = slice(data.aws_availability_zones.available.names, 0, 2)
}

# EC2 Module (Launch Template and Security Group)
module "ec2" {
  source = "./modules/ec2"

  project_name      = var.project_name
  environment       = var.environment
  vpc_id            = module.vpc.vpc_id
  instance_type     = var.ec2_instance_type
  key_name          = var.key_name
  alb_sg_id         = module.alb.alb_sg_id
  database_endpoint = module.rds.endpoint
  database_name     = var.db_name
  database_username = var.db_username
  database_password = var.db_password
  redis_endpoint    = module.elasticache.endpoint
  alb_dns_name      = module.alb.dns_name
  app_port          = var.app_port
}

# RDS Module
module "rds" {
  source = "./modules/rds"

  project_name       = var.project_name
  environment        = var.environment
  vpc_id             = module.vpc.vpc_id
  subnet_ids         = module.vpc.private_subnet_ids
  instance_class     = var.rds_instance_class
  allocated_storage  = var.rds_allocated_storage
  database_name      = var.db_name
  database_username  = var.db_username
  database_password  = var.db_password
  ec2_sg_id          = module.ec2.security_group_id
}

# ElastiCache Module
module "elasticache" {
  source = "./modules/elasticache"

  project_name   = var.project_name
  environment    = var.environment
  vpc_id         = module.vpc.vpc_id
  subnet_ids     = module.vpc.private_subnet_ids
  node_type      = var.redis_node_type
  ec2_sg_id      = module.ec2.security_group_id
}

# ALB Module
module "alb" {
  source = "./modules/alb"

  project_name = var.project_name
  environment  = var.environment
  vpc_id       = module.vpc.vpc_id
  subnet_ids   = module.vpc.public_subnet_ids
  app_port     = var.app_port
}

# Auto Scaling Module
module "autoscaling" {
  source = "./modules/autoscaling"

  project_name         = var.project_name
  environment          = var.environment
  launch_template_id   = module.ec2.launch_template_id
  launch_template_version = module.ec2.launch_template_version
  subnet_ids           = module.vpc.public_subnet_ids
  target_group_arn     = module.alb.target_group_arn
  min_size             = var.asg_min_size
  max_size             = var.asg_max_size
  desired_capacity     = var.asg_desired_capacity
}

# CloudWatch Module
module "cloudwatch" {
  source = "./modules/cloudwatch"

  project_name         = var.project_name
  environment          = var.environment
  asg_name             = module.autoscaling.asg_name
  alb_arn_suffix       = module.alb.alb_arn_suffix
  target_group_arn_suffix = module.alb.target_group_arn_suffix
  rds_instance_id      = module.rds.instance_id
}
