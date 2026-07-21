"""observability のテスト。Sentry へは送らない。

Lambda 上で AwsLambdaIntegration が入らないと、応答後に実行が凍結されて
エラーが送信されないまま切られる（本番で実際に踏んだ）。
その分岐が壊れていないことを確かめる。
"""

from app.observability import _on_lambda, init_sentry


def test_init_is_skipped_without_dsn(monkeypatch):
    monkeypatch.delenv("SENTRY_DSN", raising=False)

    assert init_sentry() is False


def test_init_is_skipped_when_dsn_is_blank(monkeypatch):
    monkeypatch.setenv("SENTRY_DSN", "   ")

    assert init_sentry() is False


def test_detects_lambda_environment(monkeypatch):
    monkeypatch.setenv("AWS_LAMBDA_FUNCTION_NAME", "loop-engineering-lab")

    assert _on_lambda() is True


def test_detects_non_lambda_environment(monkeypatch):
    monkeypatch.delenv("AWS_LAMBDA_FUNCTION_NAME", raising=False)

    assert _on_lambda() is False
