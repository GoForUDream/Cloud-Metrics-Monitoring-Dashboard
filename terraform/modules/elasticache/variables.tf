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

variable "subnet_ids" {
  description = "List of subnet IDs for the ElastiCache subnet group"
  type        = list(string)
}

variable "node_type" {
  description = "ElastiCache node type"
  type        = string
}

variable "ec2_sg_id" {
  description = "Security group ID of EC2 instances"
  type        = string
}
