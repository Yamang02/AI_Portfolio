locals {
  grant_cloudsql_client = trimspace(var.cloudsql_client_service_account_email) != ""
  grant_cloudsql_admin  = trimspace(var.cloudsql_admin_member) != ""
}

# Cloud Run 등이 Cloud SQL Auth Proxy / Unix 소켓으로 연결할 때 필요
resource "google_project_iam_member" "cloudsql_client" {
  count = local.grant_cloudsql_client ? 1 : 0

  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${trimspace(var.cloudsql_client_service_account_email)}"
}

# 인스턴스·사용자·백업 등 Cloud SQL 전체 관리(사람 계정·운영 SA용). 권한이 넓다.
resource "google_project_iam_member" "cloudsql_admin" {
  count = local.grant_cloudsql_admin ? 1 : 0

  project = var.project_id
  role    = "roles/cloudsql.admin"
  member  = trimspace(var.cloudsql_admin_member)
}
