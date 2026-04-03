resource "google_cloud_run_service" "main" {
  name     = var.service_name
  location = var.region
  project  = var.project_id

  metadata {
    annotations = {
      "run.googleapis.com/ingress" = "all"
    }
  }

  template {
    spec {
      container_concurrency = 80
      timeout_seconds       = 600
      service_account_name  = var.service_account_email

      containers {
        image = var.container_image
      }
    }
  }

  autogenerate_revision_name = false

  # Existing services are already tuned in console/CI; avoid drift from non-IaC history.
  lifecycle {
    ignore_changes = [
      metadata[0].annotations,
      template,
      traffic,
    ]
  }
}

