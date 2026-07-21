"""Slack の依頼投稿から GitHub Issue を起票する。

    SLACK_BOT_TOKEN=... GITHUB_TOKEN=... python -m app.slack_to_issue

:ticket: が付いた投稿を拾い、Issue にして、スレッドに結果を返す。

重複防止は「起票済み Issue の本文に permalink があるか」で判定する。
状態ファイルを持たないので、実行環境が変わっても壊れない。
"""

import os
import sys
from typing import Any

import httpx

from app.slack_client import (
    SlackError,
    fetch_permalink,
    fetch_recent_messages,
    fetch_user_name,
    post_thread_reply,
)
from app.slack_request import build_issue, is_request_candidate

GITHUB_API = "https://api.github.com"


def _github_headers() -> dict[str, str]:
    token = os.environ.get("GITHUB_TOKEN", "").strip()
    if not token:
        raise RuntimeError("GITHUB_TOKEN が未設定")
    return {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }


def fetch_known_permalinks(repository: str, limit: int = 100) -> set[str]:
    """起票済み Issue の本文に含まれる permalink を集める。

    これが重複防止の要。同じ投稿を二度 Issue にしないための照合先になる。
    """
    known: set[str] = set()

    response = httpx.get(
        f"{GITHUB_API}/repos/{repository}/issues",
        params={"state": "all", "per_page": limit},
        headers=_github_headers(),
        timeout=30.0,
    )
    response.raise_for_status()

    for issue in response.json():
        body = issue.get("body") or ""
        for line in body.splitlines():
            if "slack.com/archives/" in line:
                # 「- 元投稿: <URL>」の形で入っている
                known.add(line.split()[-1].strip())

    return known


def create_issue(repository: str, title: str, body: str) -> dict[str, Any]:
    response = httpx.post(
        f"{GITHUB_API}/repos/{repository}/issues",
        json={"title": title, "body": body},
        headers=_github_headers(),
        timeout=30.0,
    )
    response.raise_for_status()
    return response.json()


def run(channel_id: str, repository: str, dry_run: bool = False) -> int:
    """1 回分の取り込みを実行する。作成した Issue 数を返す。"""
    messages = fetch_recent_messages(channel_id)
    candidates = [m for m in messages if is_request_candidate(m)]

    if not candidates:
        print("依頼（:ticket: 付き）は無し")
        return 0

    known = fetch_known_permalinks(repository)
    created = 0

    # 古い順に処理する。Issue 番号が投稿順と揃って読みやすい。
    for message in reversed(candidates):
        ts = message.get("ts", "")
        permalink = fetch_permalink(channel_id, ts)

        if permalink and permalink in known:
            print(f"skip（起票済み）: {permalink}")
            continue

        enriched = {
            **message,
            "permalink": permalink,
            "user_name": fetch_user_name(message.get("user", "")),
        }
        issue_input = build_issue(enriched)

        if dry_run:
            print(f"[dry-run] 起票する: {issue_input['title']}")
            created += 1
            continue

        issue = create_issue(repository, issue_input["title"], issue_input["body"])
        number, url = issue["number"], issue["html_url"]
        print(f"起票: #{number} {issue_input['title']}")

        try:
            post_thread_reply(channel_id, ts, f"Issue を起票しました → {url}")
        except SlackError as exc:
            # 返信できなくても起票自体は成功している。止めない。
            print(f"警告: スレッド返信に失敗: {exc}", file=sys.stderr)

        created += 1

    return created


def main() -> int:
    channel_id = os.environ.get("SLACK_CHANNEL_ID", "").strip()
    repository = os.environ.get("GITHUB_REPOSITORY", "").strip()
    dry_run = os.environ.get("DRY_RUN", "").lower() in ("1", "true", "yes")

    if not channel_id:
        print("SLACK_CHANNEL_ID が未設定", file=sys.stderr)
        return 1
    if not repository:
        print("GITHUB_REPOSITORY が未設定", file=sys.stderr)
        return 1

    created = run(channel_id, repository, dry_run=dry_run)
    print(f"作成した Issue: {created} 件")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
