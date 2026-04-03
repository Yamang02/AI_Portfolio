variable "environment" {
  description = "Environment name"
  type        = string
}

variable "bucket_name" {
  description = "Frontend S3 bucket name"
  type        = string
}

variable "certificate_arn" {
  description = "ACM certificate ARN in us-east-1 for CloudFront"
  type        = string
}

variable "aliases" {
  description = "CloudFront aliases"
  type        = list(string)
  default     = []
}

variable "origin_id" {
  description = "CloudFront origin ID"
  type        = string
}

variable "distribution_comment" {
  description = "CloudFront distribution comment"
  type        = string
  default     = ""
}

variable "price_class" {
  description = "CloudFront price class"
  type        = string
  default     = "PriceClass_All"
}

variable "default_ttl" {
  description = "Default TTL seconds"
  type        = number
  default     = 3600
}

variable "max_ttl" {
  description = "Max TTL seconds"
  type        = number
  default     = 86400
}

variable "origin_access_control_name" {
  description = "Name of cloudfront OAC"
  type        = string
  default     = "ai-portfolio"
}

variable "create_origin_access_control" {
  description = "If false, use existing_origin_access_control_id (shared OAC managed elsewhere)"
  type        = bool
  default     = true
}

variable "existing_origin_access_control_id" {
  description = "OAC id when create_origin_access_control is false"
  type        = string
  default     = ""
}

variable "default_root_object" {
  description = "CloudFront default root object (empty string allowed)"
  type        = string
  default     = "index.html"
}

variable "enable_index_html_cache_behavior" {
  description = "Whether to add ordered cache behavior for index.html with CachingDisabled (edge에서 HTML 장기 캐시 방지)"
  type        = bool
  default     = true
}

variable "extra_edge_no_cache_path_patterns" {
  description = "추가 경로(예: admin.html)에 동일 CachingDisabled 정책 적용. SPA 엔트리 HTML은 기본 캐시 정책보다 우선한다."
  type        = list(string)
  default     = []
}

variable "custom_error_responses" {
  description = "Custom error response blocks"
  type = list(object({
    error_code            = number
    response_page_path    = string
    response_code         = string
    error_caching_min_ttl = number
  }))
  default = [
    {
      error_code            = 403
      response_page_path    = "/index.html"
      response_code         = "200"
      error_caching_min_ttl = 0
    },
    {
      error_code            = 404
      response_page_path    = "/index.html"
      response_code         = "200"
      error_caching_min_ttl = 0
    }
  ]
}

variable "distribution_name_tag" {
  description = "Value for Name tag on CloudFront distribution"
  type        = string
  default     = "ai-portfolio-frontend-prod"
}

variable "admin_html_rewrite_hostnames" {
  description = "If non-empty, attach a viewer-request function so these Host values serve /admin.html for HTML routes (MPA)."
  type        = list(string)
  default     = []
}

variable "cloudfront_admin_function_name" {
  description = "CloudFront Function name for admin HTML rewrite. Empty uses legacy {distribution_name_tag}-admin-html."
  type        = string
  default     = ""
}
