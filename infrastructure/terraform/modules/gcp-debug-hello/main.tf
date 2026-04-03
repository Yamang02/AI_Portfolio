resource "google_cloud_run_service" "hello" {
  name     = var.service_name
  location = var.region
  project  = var.project_id

  metadata {
    annotations = {
      "run.googleapis.com/ingress" = "all"
    }
  }

  template {
    metadata {
      annotations = {
        "autoscaling.knative.dev/minScale"     = "0"
        "autoscaling.knative.dev/maxScale"     = "1"
        "run.googleapis.com/startup-cpu-boost" = "true"
      }
    }

    spec {
      service_account_name = var.service_account_email

      containers {
        image = "gcr.io/cloudrun/hello"

        ports {
          container_port = 8080
        }
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}

resource "google_cloud_run_service_iam_member" "public_invoker" {
  project  = var.project_id
  location = var.region
  service  = google_cloud_run_service.hello.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
