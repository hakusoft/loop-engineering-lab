"""Slack の依頼投稿を、GitHub Issue の体裁に整える。

取得（Slack API を叩く部分）とは分けてあり、ここは純関数だけを置く。
ネットワークに触らないので、スタブ入力でテストできる。
CI が赤いとき「Slack が落ちた」ではなく「コードが壊れた」と読めるようにするため。
"""

import re
from typing import Any

# Issue タイトルの上限。GitHub 自体はもっと許容するが、
# 一覧で読める長さに切る。
TITLE_MAX_LENGTH = 72

# 依頼の合図に使う絵文字。この名前のリアクションが付いた投稿だけを拾う。
TRIGGER_REACTION = "ticket"


def _strip_slack_markup(text: str) -> str:
    """Slack 記法を、Issue に載せて読める素のテキストに均す。

    `<@U123>` や `<http://example.com|表示名>` のような山括弧記法は、
    そのまま Issue に貼ると読めないため展開する。
    """
    # <http://example.com|表示名> -> 表示名 / <http://example.com> -> URL そのもの
    text = re.sub(r"<(https?://[^|>]+)\|([^>]+)>", r"\2", text)
    text = re.sub(r"<(https?://[^>]+)>", r"\1", text)
    # <@U123|name> -> @name / <@U123> -> @U123
    text = re.sub(r"<@([UW][A-Z0-9]+)\|([^>]+)>", r"@\2", text)
    text = re.sub(r"<@([UW][A-Z0-9]+)>", r"@\1", text)
    # <#C123|general> -> #general
    text = re.sub(r"<#(C[A-Z0-9]+)\|([^>]+)>", r"#\2", text)
    return text


def build_issue_title(text: str) -> str:
    """投稿本文から Issue のタイトルを作る。

    1 行目を使う。長すぎる場合は語の途中で切らずに省略する。
    """
    cleaned = _strip_slack_markup(text).strip()
    first_line = next((ln.strip() for ln in cleaned.splitlines() if ln.strip()), "")

    if not first_line:
        return "Slack からの依頼（本文なし）"

    if len(first_line) <= TITLE_MAX_LENGTH:
        return first_line

    return first_line[: TITLE_MAX_LENGTH - 1].rstrip() + "…"


def build_issue_body(message: dict[str, Any]) -> str:
    """投稿から Issue 本文を作る。

    元投稿への permalink を必ず含める。後から「この Issue はどの依頼だったか」を
    辿れるようにするため。
    """
    text = _strip_slack_markup(message.get("text", "")).strip()
    permalink = message.get("permalink", "")
    user = message.get("user_name") or message.get("user", "unknown")

    body = ["## 依頼内容（Slack より）", "", text or "_(本文なし)_", ""]
    body += ["## 出典", "", f"- 依頼者: {user}"]
    if permalink:
        body.append(f"- 元投稿: {permalink}")
    body += [
        "",
        "---",
        "",
        f"この Issue は Slack の :{TRIGGER_REACTION}: リアクションを合図に自動起票された。",
    ]
    return "\n".join(body)


def has_trigger_reaction(message: dict[str, Any], trigger: str = TRIGGER_REACTION) -> bool:
    """この投稿に、合図の絵文字リアクションが付いているか。

    Slack のリアクション名はスキントーン等で `+1::skin-tone-2` の形になることが
    あるため、`::` より前で比較する。
    """
    for reaction in message.get("reactions", []):
        name = reaction.get("name", "").split("::")[0]
        if name == trigger:
            return True
    return False


def is_request_candidate(message: dict[str, Any], trigger: str = TRIGGER_REACTION) -> bool:
    """この投稿を依頼として拾ってよいか。

    合図のリアクションが付いていても、参加通知などのシステムメッセージは拾わない。
    Slack はこれらに subtype を付けるので、それで弾く（実チャンネルで
    `channel_join` が流れているのを確認済み）。
    ボットの投稿も、ループ自身の書き込みを拾い直す事故を避けるため除外する。
    """
    if message.get("subtype"):
        return False
    if message.get("bot_id"):
        return False
    if not message.get("text", "").strip():
        return False
    return has_trigger_reaction(message, trigger)


def build_issue(message: dict[str, Any]) -> dict[str, str]:
    """投稿から、Issue 起票に渡す dict を作る。"""
    return {
        "title": build_issue_title(message.get("text", "")),
        "body": build_issue_body(message),
    }
