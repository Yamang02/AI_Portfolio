output "service_url" {
  description = "Public HTTPS URL for the debug Cloud Run service"
  value       = google_cloud_run_service.hello.status[0].url
}
