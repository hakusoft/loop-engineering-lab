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
    #
    # sub には owner/repo の数値 ID が埋め込まれる:
    #   repo:hakusoft@261719523/loop-engineering-lab@1307073366:ref:refs/heads/main
    # 名前だけで書くと一致せず AssumeRoleWithWebIdentity が拒否される（実際に踏んだ）。
    # 実際の形式は次で確認できる:
    #   gh api repos/<owner>/<repo>/actions/oidc/customization/sub
    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["${var.github_sub_claim_prefix}:ref:refs/heads/main"]
    }
  }
}

resource "aws_iam_role" "github_deploy" {
  name = "${local.name}-github-deploy"
  # IAM の description は ASCII のみ（日本語を入れると ValidationError）
  description        = "Lets GitHub Actions update the Lambda function code"
  assume_role_policy = data.aws_iam_policy_document.github_assume_role.json
}

# CI がやるのは Lambda コード更新とフロント配信だけ。IAM も API Gateway も触らせない。
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

  # フロントの配信: ビルド成果物を S3 に同期する。
  # 対象はフロント用バケットだけに絞る（他バケットには触らせない）。
  statement {
    actions = [
      "s3:PutObject",
      "s3:DeleteObject",
      "s3:ListBucket",
    ]
    resources = [
      aws_s3_bucket.frontend.arn,
      "${aws_s3_bucket.frontend.arn}/*",
    ]
  }

  # 配信後に CloudFront のキャッシュを無効化する。
  # CreateInvalidation は distribution ARN に絞れるが、GetInvalidation で完了を
  # 待てるようにしておく。
  statement {
    actions = [
      "cloudfront:CreateInvalidation",
      "cloudfront:GetInvalidation",
    ]
    resources = [aws_cloudfront_distribution.frontend.arn]
  }
}

resource "aws_iam_role_policy" "github_deploy" {
  name   = "deploy"
  role   = aws_iam_role.github_deploy.id
  policy = data.aws_iam_policy_document.github_deploy.json
}
