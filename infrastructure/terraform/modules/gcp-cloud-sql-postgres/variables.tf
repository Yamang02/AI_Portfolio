variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  description = "Cloud SQL region (same as Cloud Run 권장)"
  type        = string
}

variable "environment_label" {
  description = "user_labels.Environment 값"
  type        = string
}

variable "instance_name" {
  description = "Cloud SQL 인스턴스 ID (소문자·숫자·하이픈, 프로젝트 내 유일)"
  type        = string
}

variable "database_version" {
  description = "PostgreSQL 버전 식별자"
  type        = string
  default     = "POSTGRES_15"
}

variable "create_database" {
  description = "true이면 빈 애플리케이션 DB 리소스를 함께 만든다. DB명·SQL 사용자는 보통 마이그레이션/수동으로 두는 편이 안전하다."
  type        = bool
  default     = false
}

variable "database_name" {
  description = "create_database가 true일 때만 사용할 논리 DB 이름"
  type        = string
  default     = "app"
}

variable "tier" {
  description = "머신 타입 (예: db-f1-micro). Cloud SQL은 인스턴스 수정으로 상향·HA 전환이 가능하다."
  type        = string
}

variable "disk_size_gb" {
  description = "디스크 크기(GB)"
  type        = number
}

variable "disk_type" {
  description = "PD_SSD 또는 PD_HDD"
  type        = string
  default     = "PD_SSD"
}

variable "availability_type" {
  description = "ZONAL 또는 REGIONAL(HA) — REGIONAL은 비용·용량이 크게 늘 수 있다."
  type        = string
}

variable "deletion_protection" {
  description = "Terraform 삭제 방지 (프로덕션은 true 권장)"
  type        = bool
}

variable "backup_enabled" {
  description = "자동 백업 활성화"
  type        = bool
}

variable "point_in_time_recovery_enabled" {
  description = "PITR (WAL) — 백업이 켜져 있을 때 의미 있음"
  type        = bool
  default     = false
}

variable "retained_backups" {
  description = "보관할 온디맨드/자동 백업 개수"
  type        = number
  default     = 7
}

variable "ipv4_enabled" {
  description = "퍼블릭 IPv4 (Cloud Run 커넥터는 Unix 소켓으로도 연결 가능)"
  type        = bool
  default     = true
}

variable "ssl_mode" {
  description = "IP 연결 시 SSL 모드"
  type        = string
  default     = "ALLOW_UNENCRYPTED_AND_ENCRYPTED"
}

variable "maintenance_window_day" {
  description = "유지보수 요일 (1=월 … 7=일, 0=임의)"
  type        = number
  default     = 7
}

variable "maintenance_window_hour" {
  description = "유지보수 시작 시각 (UTC)"
  type        = number
  default     = 18
}

variable "maintenance_update_track" {
  description = "canary 또는 stable"
  type        = string
  default     = "stable"
}

variable "query_insights_enabled" {
  description = "Query Insights 활성화"
  type        = bool
  default     = false
}

variable "extra_user_labels" {
  description = "추가 user_labels"
  type        = map(string)
  default     = {}
}
