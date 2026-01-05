# CloudWatch Log Group for application logs
resource "aws_cloudwatch_log_group" "app" {
  name              = "/aws/ec2/${var.project_name}-${var.environment}"
  retention_in_days = 7

  tags = {
    Name = "${var.project_name}-${var.environment}-logs"
  }
}

# CloudWatch Dashboard
resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "${var.project_name}-${var.environment}-dashboard"

  dashboard_body = jsonencode({
    widgets = [
      # EC2 CPU Utilization
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6
        properties = {
          title   = "EC2 CPU Utilization"
          region  = data.aws_region.current.name
          metrics = [
            ["AWS/EC2", "CPUUtilization", "AutoScalingGroupName", var.asg_name, { stat = "Average" }]
          ]
          period = 60
          view   = "timeSeries"
        }
      },
      # ALB Request Count
      {
        type   = "metric"
        x      = 12
        y      = 0
        width  = 12
        height = 6
        properties = {
          title   = "ALB Request Count"
          region  = data.aws_region.current.name
          metrics = [
            ["AWS/ApplicationELB", "RequestCount", "LoadBalancer", var.alb_arn_suffix, { stat = "Sum" }]
          ]
          period = 60
          view   = "timeSeries"
        }
      },
      # ALB Response Time
      {
        type   = "metric"
        x      = 0
        y      = 6
        width  = 12
        height = 6
        properties = {
          title   = "ALB Target Response Time"
          region  = data.aws_region.current.name
          metrics = [
            ["AWS/ApplicationELB", "TargetResponseTime", "LoadBalancer", var.alb_arn_suffix, { stat = "Average" }]
          ]
          period = 60
          view   = "timeSeries"
        }
      },
      # ALB HTTP 5XX Errors
      {
        type   = "metric"
        x      = 12
        y      = 6
        width  = 12
        height = 6
        properties = {
          title   = "ALB HTTP 5XX Errors"
          region  = data.aws_region.current.name
          metrics = [
            ["AWS/ApplicationELB", "HTTPCode_Target_5XX_Count", "LoadBalancer", var.alb_arn_suffix, { stat = "Sum" }]
          ]
          period = 60
          view   = "timeSeries"
        }
      },
      # RDS CPU Utilization
      {
        type   = "metric"
        x      = 0
        y      = 12
        width  = 8
        height = 6
        properties = {
          title   = "RDS CPU Utilization"
          region  = data.aws_region.current.name
          metrics = [
            ["AWS/RDS", "CPUUtilization", "DBInstanceIdentifier", var.rds_instance_id, { stat = "Average" }]
          ]
          period = 60
          view   = "timeSeries"
        }
      },
      # RDS Database Connections
      {
        type   = "metric"
        x      = 8
        y      = 12
        width  = 8
        height = 6
        properties = {
          title   = "RDS Database Connections"
          region  = data.aws_region.current.name
          metrics = [
            ["AWS/RDS", "DatabaseConnections", "DBInstanceIdentifier", var.rds_instance_id, { stat = "Average" }]
          ]
          period = 60
          view   = "timeSeries"
        }
      },
      # RDS Free Storage Space
      {
        type   = "metric"
        x      = 16
        y      = 12
        width  = 8
        height = 6
        properties = {
          title   = "RDS Free Storage (GB)"
          region  = data.aws_region.current.name
          metrics = [
            ["AWS/RDS", "FreeStorageSpace", "DBInstanceIdentifier", var.rds_instance_id, { stat = "Average" }]
          ]
          period = 60
          view   = "timeSeries"
          yAxis = {
            left = {
              label = "Bytes"
            }
          }
        }
      }
    ]
  })
}

# Data source for current region
data "aws_region" "current" {}

# ALB 5XX Error Alarm
resource "aws_cloudwatch_metric_alarm" "alb_5xx" {
  alarm_name          = "${var.project_name}-${var.environment}-alb-5xx"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "HTTPCode_Target_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  statistic           = "Sum"
  threshold           = 10
  alarm_description   = "ALB is returning too many 5XX errors"
  treat_missing_data  = "notBreaching"

  dimensions = {
    LoadBalancer = var.alb_arn_suffix
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-alb-5xx"
  }
}

# RDS High CPU Alarm
resource "aws_cloudwatch_metric_alarm" "rds_cpu" {
  alarm_name          = "${var.project_name}-${var.environment}-rds-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = 60
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "RDS CPU utilization is high"

  dimensions = {
    DBInstanceIdentifier = var.rds_instance_id
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-rds-cpu"
  }
}

# RDS Low Storage Alarm
resource "aws_cloudwatch_metric_alarm" "rds_storage" {
  alarm_name          = "${var.project_name}-${var.environment}-rds-storage"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 1
  metric_name         = "FreeStorageSpace"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 2147483648  # 2 GB in bytes
  alarm_description   = "RDS free storage is below 2GB"

  dimensions = {
    DBInstanceIdentifier = var.rds_instance_id
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-rds-storage"
  }
}
