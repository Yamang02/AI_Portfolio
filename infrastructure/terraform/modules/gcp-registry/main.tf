resource "google_artifact_registry_repository" "gcr" {
  project       = var.project_id
  location      = var.location
  repository_id = var.repository_id
  description   = var.description
  format        = "DOCKER"

  lifecycle {
    ignore_changes = [
      cleanup_policy_dry_run,
      docker_config,
    ]
  }
}

