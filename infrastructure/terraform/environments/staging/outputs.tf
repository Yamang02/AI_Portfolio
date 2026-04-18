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

output "cloud_run_service_url" {
  description = "Cloud Run 서비스 URL (status.url — 리비전 배포 후에도 동일 호스트)"
  value       = module.backend.service_status_url
}

output "cloud_run_service_name" {
  description = "Cloud Run 서비스 리소스 이름"
  value       = module.backend.service_name
}
