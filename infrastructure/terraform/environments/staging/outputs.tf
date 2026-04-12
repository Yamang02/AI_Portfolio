output "environment" {
  description = "Current environment name"
  value       = var.environment
}

output "frontend_bucket_id" {
  description = "Frontend S3 bucket ID"
  value       = module.frontend.bucket_id
}

output "frontend_cloudfront_id" {
  description = "Frontend CloudFront distribution ID"
  value       = module.frontend.cloudfront_id
}

output "postgres_instance_connection_name" {
  description = "Cloud SQL Postgres — Cloud Run 연결용 connection name"
  value       = module.postgres.instance_connection_name
}
