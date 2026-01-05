variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "vpc_id" {
  description = "ID of the VPC"
  type        = string
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
}

variable "key_name" {
  description = "Name of the SSH key pair"
  type        = string
  default     = null
}

variable "alb_sg_id" {
  description = "Security group ID of the ALB"
  type        = string
}

variable "database_endpoint" {
  description = "RDS database endpoint"
  type        = string
}

variable "database_name" {
  description = "Database name"
  type        = string
}

variable "database_username" {
  description = "Database username"
  type        = string
}

variable "database_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "redis_endpoint" {
  description = "ElastiCache Redis endpoint"
  type        = string
}

variable "alb_dns_name" {
  description = "DNS name of the ALB"
  type        = string
}

variable "app_port" {
  description = "Application port"
  type        = number
}
