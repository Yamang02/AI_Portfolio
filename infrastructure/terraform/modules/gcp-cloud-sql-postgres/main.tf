resource "google_project_service" "sqladmin" {
  project            = var.project_id
  service            = "sqladmin.googleapis.com"
  disable_on_destroy = false
}

resource "google_sql_database_instance" "main" {
  name             = var.instance_name
  database_version = var.database_version
  region           = var.region
  project          = var.project_id

  deletion_protection = var.deletion_protection

  settings {
    tier              = var.tier
    disk_size         = var.disk_size_gb
    disk_type         = var.disk_type
    availability_type = var.availability_type

    backup_configuration {
      enabled                        = var.backup_enabled
      point_in_time_recovery_enabled = var.point_in_time_recovery_enabled
      dynamic "backup_retention_settings" {
        for_each = var.backup_enabled ? [1] : []
        content {
          retained_backups = var.retained_backups
          retention_unit   = "COUNT"
        }
      }
    }

    ip_configuration {
      ipv4_enabled = var.ipv4_enabled
      ssl_mode     = var.ssl_mode
    }

    maintenance_window {
      day          = var.maintenance_window_day
      hour         = var.maintenance_window_hour
      update_track = var.maintenance_update_track
    }

    # Cloud SQL user_labels: 키는 소문자·숫자·밑줄·하이픈만 (대문자 불가)
    user_labels = merge(
      {
        managed_by  = "terraform"
        environment = var.environment_label
      },
      var.extra_user_labels
    )

    dynamic "insights_config" {
      for_each = var.query_insights_enabled ? [1] : []
      content {
        query_insights_enabled  = true
        query_string_length     = 1024
        record_application_tags = true
        record_client_address   = true
      }
    }
  }

  depends_on = [google_project_service.sqladmin]

  timeouts {
    create = "45m"
    update = "45m"
    delete = "45m"
  }
}

resource "google_sql_database" "app" {
  count = var.create_database ? 1 : 0

  name     = var.database_name
  instance = google_sql_database_instance.main.name
  project  = var.project_id
}
