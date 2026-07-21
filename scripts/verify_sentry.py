"""Sentry にエラーが届くかを確認するための使い捨てスクリプト。

SENTRY_DSN を環境変数に入れて実行する:

    SENTRY_DSN='...' .venv/bin/python scripts/verify_sentry.py

実際に /weather/series の整形を、壊れた入力で呼んで例外を出す。
作り物の例外ではなく、実際に起こりうる形（上流のスキーマ変更）で鳴らす。
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.observability import init_sentry  # noqa: E402
from app.weather import format_hourly_series  # noqa: E402


def main() -> int:
    if not init_sentry():
        print("SENTRY_DSN が未設定。何も送らずに終了する。")
        return 1

    import sentry_sdk

    # 上流が hourly のキー名を変えた、というシナリオ。
    # format_hourly_series は KeyError になる。
    broken = {
        "latitude": 35.68,
        "longitude": 139.76,
        "hourly_units": {"temperature_2m": "°C"},
        "hourly": {
            "time": ["2026-07-21T00:00"],
            # temperature_2m が temp_2m に変わった想定
            "temp_2m": [26.1],
            "relative_humidity_2m": [78],
        },
    }

    try:
        format_hourly_series(broken)
    except Exception as exc:
        print(f"意図した例外が発生: {type(exc).__name__}: {exc}")
        sentry_sdk.capture_exception(exc)
        sentry_sdk.flush(timeout=10)
        print("Sentry に送信した。ダッシュボードを確認すること。")
        return 0

    print("例外が発生しなかった。想定と違う。")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
