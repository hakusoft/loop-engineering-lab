"""Sentry の初期化。

DSN は環境変数から読む。設定されていなければ何もしない（初期化をスキップする）。
テストやローカルで DSN 無しに動かしたときに落ちないようにするため。
"""

import os


def _on_lambda() -> bool:
    """Lambda 実行環境かどうか。ランタイムが必ず立てる変数で判定する。"""
    return bool(os.environ.get("AWS_LAMBDA_FUNCTION_NAME"))


def init_sentry() -> bool:
    """Sentry を初期化する。DSN が無ければ何もせず False を返す。"""
    dsn = os.environ.get("SENTRY_DSN", "").strip()
    if not dsn:
        return False

    import sentry_sdk

    integrations = []
    if _on_lambda():
        # Lambda は応答を返した時点で実行を凍結するので、
        # 送信がバックグラウンドのままだと Sentry に届かない。
        # この統合がハンドラを包み、応答前に flush する。
        from sentry_sdk.integrations.aws_lambda import AwsLambdaIntegration

        integrations.append(AwsLambdaIntegration(timeout_warning=True))

    sentry_sdk.init(
        dsn=dsn,
        environment=os.environ.get("SENTRY_ENVIRONMENT", "local"),
        # 送信量が読めないうちは絞る。infra が立ったら見直す。
        traces_sample_rate=0.0,
        send_default_pii=False,
        integrations=integrations,
    )
    return True
