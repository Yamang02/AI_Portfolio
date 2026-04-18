output "environment" {
  description = "Current environment name"
  value       = var.environment
}

output "aws_region" {
  description = "AWS region in use"
  value       = var.aws_region
}

output "gcp_region" {
  description = "GCP region in use"
  value       = var.gcp_region
}

output "frontend_bucket_id" {
  description = "Frontend S3 bucket ID"
  value       = module.frontend.bucket_id
}

output "frontend_cloudfront_id" {
  description = "AI Portfolio app CloudFront distribution ID (admin.yamang02.com)"
  value       = module.frontend.cloudfront_id
}

output "profile_cloudfront_id" {
  description = "Profile site CloudFront distribution ID (www.yamang02.com)"
  value       = module.frontend_profile.cloudfront_id
}

output "github_actions_user_name" {
  description = "IAM user for deployment automation"
  value       = module.iam.github_actions_user_name
}

output "postgres_instance_connection_name" {
  description = "Cloud SQL Postgres — Cloud Run 연결용 connection name"
  value       = module.postgres.instance_connection_name
}
