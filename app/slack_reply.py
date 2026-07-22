"""Slack のスレッドに bot 名義で返信する。

    SLACK_BOT_TOKEN=... SLACK_CHANNEL_ID=... python -m app.slack_reply <thread_ts> <text>

朝のループ（クラウドルーチン）の返信の出口。ルーチンが Slack MCP（kaz 認証）で
返信すると依頼者と回答者が同一アカウントになるため、返信だけをこの CLI 経由で
bot（loop-engineering-lab アプリ）名義にする。

GitHub Actions の slack-reply ワークフローから呼ばれる想定。
"""

import os
import sys

from app.slack_client import SlackError, post_thread_reply


def validate_args(thread_ts: str, text: str) -> str | None:
    """引数の不備を返す。問題なければ None。

    ts の形式ずれや空文字での誤爆は Slack API まで行かずここで止める。
    """
    ts = thread_ts.strip()
    if not ts:
        return "thread_ts が空"
    # Slack の ts は「秒.マイクロ秒」の数字列（例: 1784748786.516029）
    parts = ts.split(".")
    if len(parts) != 2 or not all(p.isdigit() for p in parts):
        return f"thread_ts の形式が不正: {thread_ts!r}（例: 1784748786.516029）"
    if not text.strip():
        return "text が空"
    return None


def main(argv: list[str]) -> int:
    if len(argv) != 2:
        print("usage: python -m app.slack_reply <thread_ts> <text>", file=sys.stderr)
        return 2

    thread_ts, text = argv
    error = validate_args(thread_ts, text)
    if error:
        print(f"error: {error}", file=sys.stderr)
        return 2

    channel_id = os.environ.get("SLACK_CHANNEL_ID", "").strip()
    if not channel_id:
        print("error: SLACK_CHANNEL_ID が未設定", file=sys.stderr)
        return 2

    try:
        post_thread_reply(channel_id, thread_ts.strip(), text)
    except SlackError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1

    print(f"replied to {channel_id} / {thread_ts.strip()}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
