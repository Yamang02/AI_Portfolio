output "service_name" {
  description = "Cloud Run service name"
  value       = google_cloud_run_service.main.name
}

output "service_status_url" {
  description = "Cloud Run URL"
  value       = google_cloud_run_service.main.status[0].url
}

