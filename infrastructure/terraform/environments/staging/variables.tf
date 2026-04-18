variable "environment" {
  description = "Environment name"
  type        = string
  default     = "staging"
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-northeast-2"
}

variable "gcp_project_id" {
  description = "GCP project ID"
  type        = string
}

variable "gcp_region" {
  description = "GCP region"
  type        = string
  default     = "asia-northeast3"
}

variable "frontend_bucket_name" {
  description = "Staging frontend S3 bucket name"
  type        = string
  default     = "ai-portfolio-fe-staging"
}

variable "acm_certificate_arn" {
  description = "ACM certificate ARN for staging.admin.yamang02.com (82cf62f2, us-east-1)"
  type        = string
}

variable "cloudfront_origin_id" {
  description = "CloudFront origin ID for staging distribution"
  type        = string
}

variable "cloudfront_price_class" {
  description = "CloudFront price class"
  type        = string
  default     = "PriceClass_All"
}

variable "cloudfront_comment" {
  description = "CloudFront distribution comment"
  type        = string
  default     = "ai - portfolio aws 정적 웹사이트 staging 배포"
}

variable "shared_origin_access_control_id" {
  description = "OAC id shared with production (managed in production workspace)"
  type        = string
  default     = "E59C8O4WOR60O"
}

variable "cloud_run_service_account_email" {
  description = "Runtime service account used by Cloud Run"
  type        = string
}

variable "cloud_run_container_image" {
  description = "Current staging container image"
  type        = string
}

variable "gcp_cloudsql_admin_member" {
  description = "IAM member 전체 문자열에 roles/cloudsql.admin 부여. 예: user:you@gmail.com. 비우면 Terraform에서 미부여."
  type        = string
  default     = ""
}

variable "github_actions_deployer_service_account_email" {
  description = "GitHub Actions(gcloud run deploy)에 쓰는 GCP 서비스 계정. Cloud Run 런타임 SA에 roles/iam.serviceAccountUser(actAs) 부여 대상."
  type        = string
  default     = "github-actions@yamang02-ai-portfolio.iam.gserviceaccount.com"
}
