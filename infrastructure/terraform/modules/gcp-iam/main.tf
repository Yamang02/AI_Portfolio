resource "google_service_account" "github_actions" {
  account_id   = var.account_id
  display_name = var.display_name
  description  = var.description
  project      = var.project_id

  lifecycle {
    ignore_changes = [
      display_name,
      description,
    ]
  }
}

