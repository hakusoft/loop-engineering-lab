output "api_url" {
  description = "デプロイされた API のベース URL"
  value       = aws_apigatewayv2_stage.default.invoke_url
}

output "function_name" {
  description = "Lambda 関数名（ログ確認用）"
  value       = aws_lambda_function.api.function_name
}

output "github_deploy_role_arn" {
  description = "GitHub Actions が引き受けるロール。Secrets の AWS_DEPLOY_ROLE_ARN に設定する"
  value       = aws_iam_role.github_deploy.arn
}
