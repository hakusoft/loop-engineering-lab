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

variable "github_repository" {
  description = "デプロイを許可する GitHub リポジトリ（owner/repo）"
  type        = string
  default     = "hakusoft/loop-engineering-lab"
}

variable "github_sub_claim_prefix" {
  description = <<-EOT
    OIDC トークンの sub の接頭辞。owner/repo の数値 ID を含む。
    リポジトリ名を変えても壊れないよう GitHub が ID を埋めるため、
    名前だけで書くと信頼ポリシーが一致しない。
    確認: gh api repos/<owner>/<repo>/actions/oidc/customization/sub
  EOT
  type        = string
  default     = "repo:hakusoft@261719523/loop-engineering-lab@1307073366"
}
