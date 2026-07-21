# Lambda 関数と、それが必要とする最小の権限。

data "aws_iam_policy_document" "assume_role" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "lambda" {
  name               = "${local.name}-lambda"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
}

# ログ書き込みのみ。DB も S3 も使わないので他の権限は付けない。
resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# ロググループは Terraform 側で作る。Lambda に暗黙で作らせると
# 保持期間が無期限になり、無料枠を食い潰すため。
resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/${local.name}"
  retention_in_days = var.log_retention_days
}

resource "aws_lambda_function" "api" {
  function_name = local.name
  role          = aws_iam_role.lambda.arn

  filename         = local.package_path
  source_code_hash = filebase64sha256(local.package_path)

  runtime = "python3.12"
  handler = "app.lambda_handler.handler"

  # 外部 API を叩くので、既定の 3 秒では足りない。
  timeout     = 30
  memory_size = 512

  environment {
    variables = {
      SENTRY_DSN         = var.sentry_dsn
      SENTRY_ENVIRONMENT = var.sentry_environment
    }
  }

  depends_on = [
    aws_iam_role_policy_attachment.lambda_logs,
    aws_cloudwatch_log_group.lambda,
  ]
}
