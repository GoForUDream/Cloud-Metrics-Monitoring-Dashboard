output "endpoint" {
  description = "RDS instance endpoint"
  value       = aws_db_instance.main.address
}

output "port" {
  description = "RDS instance port"
  value       = aws_db_instance.main.port
}

output "instance_id" {
  description = "RDS instance identifier"
  value       = aws_db_instance.main.identifier
}

output "arn" {
  description = "ARN of the RDS instance"
  value       = aws_db_instance.main.arn
}

output "security_group_id" {
  description = "Security group ID of the RDS instance"
  value       = aws_security_group.rds.id
}
