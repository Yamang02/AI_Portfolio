output "github_actions_email" {
  description = "GitHub Actions service account email"
  value       = google_service_account.github_actions.email
}

