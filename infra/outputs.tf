output "api_url" {
  description = "デプロイされた API のベース URL"
  value       = aws_apigatewayv2_stage.default.invoke_url
}

output "function_name" {
  description = "Lambda 関数名（ログ確認用）"
  value       = aws_lambda_function.api.function_name
}
