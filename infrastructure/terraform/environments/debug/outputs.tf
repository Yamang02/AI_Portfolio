output "environment" {
  value = var.environment
}

output "debug_url" {
  description = "HTTPS URL on your domain (after DNS propagates)"
  value       = "https://${local.fqdn}/"
}

output "cloudfront_domain" {
  value = module.frontend.cloudfront_domain_name
}

output "s3_bucket" {
  value = module.frontend.bucket_id
}

output "cloud_run_url" {
  value = module.debug_run.service_url
}
