output "security_group_id" {
  description = "ID of the EC2 security group"
  value       = aws_security_group.ec2.id
}

output "launch_template_id" {
  description = "ID of the launch template"
  value       = aws_launch_template.app.id
}

output "launch_template_version" {
  description = "Latest version of the launch template"
  value       = aws_launch_template.app.latest_version
}

output "iam_role_arn" {
  description = "ARN of the EC2 IAM role"
  value       = aws_iam_role.ec2.arn
}
