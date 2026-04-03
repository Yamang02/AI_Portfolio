output "repository_name" {
  description = "Artifact Registry repository resource name"
  value       = google_artifact_registry_repository.gcr.name
}

