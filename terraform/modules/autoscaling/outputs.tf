output "asg_id" {
  description = "ID of the Auto Scaling Group"
  value       = aws_autoscaling_group.main.id
}

output "asg_arn" {
  description = "ARN of the Auto Scaling Group"
  value       = aws_autoscaling_group.main.arn
}

output "asg_name" {
  description = "Name of the Auto Scaling Group"
  value       = aws_autoscaling_group.main.name
}

output "scale_up_policy_arn" {
  description = "ARN of the scale up policy"
  value       = aws_autoscaling_policy.scale_up.arn
}

output "scale_down_policy_arn" {
  description = "ARN of the scale down policy"
  value       = aws_autoscaling_policy.scale_down.arn
}
