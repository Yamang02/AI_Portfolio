variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "location" {
  description = "Artifact Registry location"
  type        = string
  default     = "us"
}

variable "repository_id" {
  description = "Artifact Registry repository ID"
  type        = string
  default     = "gcr.io"
}

variable "description" {
  description = "Repository description"
  type        = string
  default     = "AI_portfolio"
}

