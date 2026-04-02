variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "account_id" {
  description = "Service account id (without domain)"
  type        = string
  default     = "github-actions"
}

variable "display_name" {
  description = "Service account display name"
  type        = string
  default     = "github-actions"
}

variable "description" {
  description = "Service account description"
  type        = string
  default     = "GitHub Actions service account"
}

