"""Sentry の初期化。

DSN は環境変数から読む。設定されていなければ何もしない（初期化をスキップする）。
テストやローカルで DSN 無しに動かしたときに落ちないようにするため。
"""

import os


def init_sentry() -> bool:
    """Sentry を初期化する。DSN が無ければ何もせず False を返す。"""
    dsn = os.environ.get("SENTRY_DSN", "").strip()
    if not dsn:
        return False

    import sentry_sdk

    sentry_sdk.init(
        dsn=dsn,
        environment=os.environ.get("SENTRY_ENVIRONMENT", "local"),
        # 送信量が読めないうちは絞る。infra が立ったら見直す。
        traces_sample_rate=0.0,
        send_default_pii=False,
    )
    return True
