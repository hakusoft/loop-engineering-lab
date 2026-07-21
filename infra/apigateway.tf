# API Gateway (HTTP API)。REST API より安く、この用途には十分。

resource "aws_apigatewayv2_api" "api" {
  name          = local.name
  protocol_type = "HTTP"

  # フロント（CloudFront 配信）から fetch で叩くため CORS を許可する。
  # ここで設定すると OPTIONS プリフライトを API Gateway が捌き、Lambda に届かない。
  # FastAPI 側の CORSMiddleware にすると Mangum 経由で OPTIONS を通すことになり、
  # 確認事項が増えるので Gateway 側で完結させる。
  #
  # 認証も Cookie も無い公開の読み取り専用 API なので origin は "*" で足りる。
  # CloudFront の URL は apply 後に決まり、ここに書くと二度手間になるのも理由。
  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["GET", "OPTIONS"]
    allow_headers = ["*"]
    max_age       = 3600
  }
}

resource "aws_apigatewayv2_integration" "lambda" {
  api_id                 = aws_apigatewayv2_api.api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.api.invoke_arn
  payload_format_version = "2.0"
}

# ルーティングは FastAPI 側が持つので、ここでは全部流す。
resource "aws_apigatewayv2_route" "proxy" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "$default"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.api.id
  name        = "$default"
  auto_deploy = true
}

resource "aws_lambda_permission" "apigw" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.api.execution_arn}/*/*"
}
