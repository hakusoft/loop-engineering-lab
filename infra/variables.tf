variable "region" {
  description = "デプロイ先リージョン"
  type        = string
  default     = "ap-northeast-1"
}

variable "sentry_dsn" {
  description = "Sentry の DSN。空なら Sentry を初期化しない（app 側でそう分岐している）"
  type        = string
  default     = ""
  sensitive   = true
}

variable "sentry_environment" {
  description = "Sentry 上の環境名。手元の検証(local)と分けるため"
  type        = string
  default     = "production"
}

variable "log_retention_days" {
  description = "CloudWatch Logs の保持期間。無期限だと無料枠を食い潰すので短く切る"
  type        = number
  default     = 14
}
