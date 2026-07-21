# terraform.tfvars のひな形。
#
#   cp example.tfvars terraform.tfvars
#   # 値を埋めてから
#   terraform apply
#
# terraform.tfvars は .gitignore で除外されている（DSN を持つため）。
# このファイルだけは例外としてコミットする。

# Sentry の DSN。空のままなら Sentry を初期化しない。
# https://hakusoft.sentry.io/settings/projects/loop-engineering-lab/keys/
sentry_dsn = ""

# Sentry 上の環境名。手元の検証(local)と分けるため。
sentry_environment = "production"
