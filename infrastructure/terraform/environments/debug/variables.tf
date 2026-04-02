variable "environment" {
  description = "Unique debug id, e.g. debug-20260402-143022 (used in bucket name and DNS)"
  type        = string
}

variable "domain_name" {
  description = "Root domain (Route53 hosted zone)"
  type        = string
}

variable "aws_region" {
  description = "AWS region for S3"
  type        = string
  default     = "ap-northeast-2"
}

variable "gcp_project_id" {
  description = "GCP project ID"
  type        = string
}

variable "gcp_region" {
  description = "Cloud Run region"
  type        = string
  default     = "asia-northeast3"
}

variable "acm_certificate_arn" {
  description = "ACM cert in us-east-1 for CloudFront (wildcard *.domain recommended)"
  type        = string
}

variable "shared_origin_access_control_id" {
  description = "Shared CloudFront OAC id (same as prod/staging)"
  type        = string
  default     = "E59C8O4WOR60O"
}

variable "cloud_run_service_account_email" {
  description = "Runtime GCP service account for Cloud Run"
  type        = string
}

variable "cloudfront_price_class" {
  description = "CloudFront price class (debug often uses PriceClass_100 to save cost)"
  type        = string
  default     = "PriceClass_100"
}
