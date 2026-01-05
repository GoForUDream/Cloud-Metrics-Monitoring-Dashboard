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
  description = "List of public subnet IDs for the ALB"
  type        = list(string)
}

variable "app_port" {
  description = "Application port"
  type        = number
}
