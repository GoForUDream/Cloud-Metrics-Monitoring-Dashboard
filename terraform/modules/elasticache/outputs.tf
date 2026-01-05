output "endpoint" {
  description = "ElastiCache Redis endpoint"
  value       = aws_elasticache_cluster.main.cache_nodes[0].address
}

output "port" {
  description = "ElastiCache Redis port"
  value       = aws_elasticache_cluster.main.cache_nodes[0].port
}

output "cluster_id" {
  description = "ElastiCache cluster ID"
  value       = aws_elasticache_cluster.main.cluster_id
}

output "security_group_id" {
  description = "Security group ID of the Redis cluster"
  value       = aws_security_group.redis.id
}
