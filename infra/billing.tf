# 請求アラート。
#
# 無料枠は「超えたら止まる」のではなく「課金される」。
# 気づかないまま積み上がるのを防ぐ。
#
# 想定は月 $0。$1 を超えたら何かおかしいので、そこで気づけるようにする。

# Budgets と請求メトリクスは us-east-1 にしか存在しない。
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = {
      Project   = "loop-engineering-lab"
      ManagedBy = "terraform"
    }
  }
}

resource "aws_sns_topic" "billing_alert" {
  provider = aws.us_east_1
  name     = "${local.name}-billing-alert"
}

# Budgets からこのトピックに発行できるようにする。
# これが無いと通知先に指定しても届かない。
data "aws_iam_policy_document" "billing_alert_topic" {
  statement {
    actions   = ["SNS:Publish"]
    resources = [aws_sns_topic.billing_alert.arn]

    principals {
      type        = "Service"
      identifiers = ["budgets.amazonaws.com"]
    }
  }
}

resource "aws_sns_topic_policy" "billing_alert" {
  provider = aws.us_east_1
  arn      = aws_sns_topic.billing_alert.arn
  policy   = data.aws_iam_policy_document.billing_alert_topic.json
}

# メールでの購読は、確認メールのリンクをクリックするまで pending のまま。
# Terraform 側からは確認できないので、apply 後に受信箱を見ること。
resource "aws_sns_topic_subscription" "billing_alert_email" {
  provider  = aws.us_east_1
  topic_arn = aws_sns_topic.billing_alert.arn
  protocol  = "email"
  endpoint  = var.billing_alert_email
}

resource "aws_budgets_budget" "monthly" {
  provider     = aws.us_east_1
  name         = "${local.name}-monthly"
  budget_type  = "COST"
  limit_amount = var.monthly_budget_usd
  limit_unit   = "USD"
  time_unit    = "MONTHLY"

  # 実績が閾値を超えたら通知。
  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 100
    threshold_type             = "PERCENTAGE"
    notification_type          = "ACTUAL"
    subscriber_sns_topic_arns  = [aws_sns_topic.billing_alert.arn]
    subscriber_email_addresses = [var.billing_alert_email]
  }

  # 月末の予測が閾値を超えそうなら、実際に超える前に通知。
  # 実績だけだと気づいた時には既に課金されている。
  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 100
    threshold_type             = "PERCENTAGE"
    notification_type          = "FORECASTED"
    subscriber_sns_topic_arns  = [aws_sns_topic.billing_alert.arn]
    subscriber_email_addresses = [var.billing_alert_email]
  }
}
