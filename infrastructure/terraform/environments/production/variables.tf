variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
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

variable "domain_name" {
  description = "Root domain name"
  type        = string
  default     = "yamang02.com"
}

variable "route53_zone_comment" {
  description = "Existing Route53 hosted zone comment"
  type        = string
  default     = "AI 챗봇 포트폴리오 사이트 정적파일 서빙"
}

variable "frontend_bucket_name" {
  description = "Production AI Portfolio app S3 bucket name"
  type        = string
}

variable "profile_bucket_name" {
  description = "Production profile site S3 bucket name"
  type        = string
  default     = "ai-portfolio-profile-production"
}

variable "profile_cloudfront_origin_id" {
  description = "CloudFront origin ID for profile production distribution (E22O2QL7DWQJDY)"
  type        = string
  default     = "profile-production-s3"
}

variable "cloudfront_origin_id" {
  description = "Existing CloudFront origin ID"
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
  default     = "ai - portfolio aws 정적 웹사이트 배포"
}

variable "cloudfront_oac_name" {
  description = "Existing OAC name"
  type        = string
  default     = "ai-portfolio"
}

variable "s3_policy_name" {
  description = "S3 IAM policy name"
  type        = string
  default     = "AI-Portfolio-S3-Policy"
}

variable "cloudfront_policy_name" {
  description = "CloudFront IAM policy name"
  type        = string
  default     = "AI-Portfolio-CloudFront-Policy"
}

variable "github_actions_user_name" {
  description = "GitHub Actions IAM user name"
  type        = string
  default     = "github-actions-ai-portfolio"
}

variable "extra_iam_bucket_arns" {
  description = "Additional bucket ARNs to keep existing IAM policy compatibility"
  type        = list(string)
  default     = ["arn:aws:s3:::ai-portfolio-fe-staging"]
}

variable "cloud_run_service_account_email" {
  description = "Runtime service account used by Cloud Run"
  type        = string
}

variable "cloud_run_container_image" {
  description = "Current production container image"
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
