# GitHub Actions からのデプロイ用ロール。
#
# 長期のアクセスキーを GitHub に置かない。Actions が OIDC トークンを提示し、
# AWS 側で一時credentialに交換する。漏洩しても再利用できない。

# OIDC プロバイダはアカウント内に 1 つしか作れず、他のリポジトリが既に作っている。
# ここでは参照するだけ（この Terraform の管理外）。
data "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"
}

data "aws_iam_policy_document" "github_assume_role" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [data.aws_iam_openid_connect_provider.github.arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    # このリポジトリの main ブランチからのみ引き受け可能にする。
    # 他リポジトリや PR ブランチから借りられないようにするための肝。
    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["repo:${var.github_repository}:ref:refs/heads/main"]
    }
  }
}

resource "aws_iam_role" "github_deploy" {
  name = "${local.name}-github-deploy"
  # IAM の description は ASCII のみ（日本語を入れると ValidationError）
  description        = "Lets GitHub Actions update the Lambda function code"
  assume_role_policy = data.aws_iam_policy_document.github_assume_role.json
}

# CI がやるのはコード更新だけ。IAM も API Gateway も触らせない。
# CI が暴走しても被害が広がらないようにするため。
data "aws_iam_policy_document" "github_deploy" {
  statement {
    actions = [
      "lambda:UpdateFunctionCode",
      "lambda:GetFunction",
      "lambda:GetFunctionConfiguration",
    ]
    resources = [aws_lambda_function.api.arn]
  }
}

resource "aws_iam_role_policy" "github_deploy" {
  name   = "deploy"
  role   = aws_iam_role.github_deploy.id
  policy = data.aws_iam_policy_document.github_deploy.json
}
