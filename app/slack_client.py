"""Slack API を叩く層。

整形は slack_request.py（純関数）に置いてあり、ここはネットワークだけを担当する。
テストでこちらを呼ばないので、CI は Slack の生死に左右されない。
"""

import os
from typing import Any

import httpx

SLACK_API = "https://slack.com/api"


class SlackError(RuntimeError):
    """Slack API が ok:false を返した。"""


def _token() -> str:
    token = os.environ.get("SLACK_BOT_TOKEN", "").strip()
    if not token:
        raise SlackError("SLACK_BOT_TOKEN が未設定")
    return token


def _call(method: str, params: dict[str, Any], timeout: float = 15.0) -> dict[str, Any]:
    response = httpx.get(
        f"{SLACK_API}/{method}",
        params=params,
        headers={"Authorization": f"Bearer {_token()}"},
        timeout=timeout,
    )
    response.raise_for_status()
    payload = response.json()

    if not payload.get("ok"):
        error = payload.get("error", "unknown")
        # not_in_channel は「Bot を招待し忘れ」で、原因が分かりにくいので明示する
        if error == "not_in_channel":
            raise SlackError(
                f"Bot がチャンネルに参加していない（{method}）。"
                "Slack で /invite するか、チャンネルにアプリを追加すること"
            )
        raise SlackError(f"{method} が失敗: {error}")

    return payload


def fetch_recent_messages(channel_id: str, limit: int = 50) -> list[dict[str, Any]]:
    """チャンネルの直近の投稿を取得する。リアクション情報も含まれる。"""
    payload = _call("conversations.history", {"channel": channel_id, "limit": limit})
    return payload.get("messages", [])


def fetch_permalink(channel_id: str, message_ts: str) -> str:
    """投稿への permalink を取得する。Issue から元依頼を辿れるようにするため。"""
    payload = _call("chat.getPermalink", {"channel": channel_id, "message_ts": message_ts})
    return payload.get("permalink", "")


def fetch_user_name(user_id: str) -> str:
    """表示名を取得する。取れなければ ID をそのまま返す。"""
    if not user_id:
        return "unknown"
    try:
        payload = _call("users.info", {"user": user_id})
    except SlackError:
        # 表示名が取れないだけで起票を止める必要はない
        return user_id
    user = payload.get("user", {})
    profile = user.get("profile", {})
    return profile.get("display_name") or user.get("real_name") or user_id


def post_thread_reply(channel_id: str, thread_ts: str, text: str) -> None:
    """依頼のスレッドに返信する。起票されたことを依頼者に伝えるため。"""
    response = httpx.post(
        f"{SLACK_API}/chat.postMessage",
        json={"channel": channel_id, "thread_ts": thread_ts, "text": text},
        headers={
            "Authorization": f"Bearer {_token()}",
            "Content-Type": "application/json; charset=utf-8",
        },
        timeout=15.0,
    )
    response.raise_for_status()
    payload = response.json()
    if not payload.get("ok"):
        raise SlackError(f"chat.postMessage が失敗: {payload.get('error', 'unknown')}")
