output "instance_name" {
  description = "Cloud SQL 인스턴스 ID"
  value       = google_sql_database_instance.main.name
}

output "instance_connection_name" {
  description = "Cloud Run / 커넥터용 connection name (PROJECT:REGION:INSTANCE)"
  value       = google_sql_database_instance.main.connection_name
}

output "private_ip_address" {
  description = "프라이빗 IP (설정된 경우)"
  value       = google_sql_database_instance.main.private_ip_address
}

output "public_ip_address" {
  description = "퍼블릭 IP (ipv4_enabled인 경우)"
  value       = google_sql_database_instance.main.public_ip_address
}

output "database_name" {
  description = "Terraform으로 만든 논리 DB 이름(create_database가 false면 null)"
  value       = var.create_database ? google_sql_database.app[0].name : null
}
