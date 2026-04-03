variable "environment" {
  description = "Environment name"
  type        = string
}

variable "s3_bucket_arn" {
  description = "Target S3 bucket ARN"
  type        = string
}

variable "extra_bucket_arns" {
  description = "Additional S3 bucket ARNs"
  type        = list(string)
  default     = []
}

variable "cloudfront_arn" {
  description = "Target CloudFront distribution ARN"
  type        = string
}

variable "s3_policy_name" {
  description = "IAM policy name for S3 access"
  type        = string
  default     = "AI-Portfolio-S3-Policy"
}

variable "cloudfront_policy_name" {
  description = "IAM policy name for CloudFront access"
  type        = string
  default     = "AI-Portfolio-CloudFront-Policy"
}

variable "github_actions_user_name" {
  description = "IAM user name for GitHub Actions"
  type        = string
  default     = "github-actions-ai-portfolio"
}
