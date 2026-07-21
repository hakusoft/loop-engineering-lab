"""slack_to_issue のテスト。Slack にも GitHub にも接続しない。

重複防止が壊れると「実行のたびに同じ Issue が積まれる」という、
気づいたときには散らかっている類の失敗になる。そこを固定する。
"""

import pytest

from app import slack_to_issue

CHANNEL = "C0BJK86F2K0"
REPO = "hakusoft/loop-engineering-lab"
PERMALINK = "https://hakusofthq.slack.com/archives/C0BJK86F2K0/p1784591693819119"

REQUEST = {
    "type": "message",
    "user": "U0BH6T6L1E3",
    "text": "気温グラフに湿度も重ねて表示してほしい",
    "ts": "1784591693.819119",
    "reactions": [{"name": "ticket", "count": 1}],
}

JOIN = {
    "type": "message",
    "subtype": "channel_join",
    "user": "U0BH6T6L1E3",
    "text": "<@U0BH6T6L1E3|kaz>さんがチャンネルに参加しました",
    "ts": "1784590915.533199",
    "reactions": [{"name": "ticket", "count": 1}],
}


@pytest.fixture
def fake_slack(monkeypatch):
    """Slack 呼び出しを差し替える。ネットワークには出ない。"""
    posted = []
    monkeypatch.setattr(slack_to_issue, "fetch_permalink", lambda c, ts: PERMALINK)
    monkeypatch.setattr(slack_to_issue, "fetch_user_name", lambda u: "kaz")
    monkeypatch.setattr(
        slack_to_issue,
        "post_thread_reply",
        lambda c, ts, text: posted.append(text),
    )
    return posted


def test_skips_already_created_issue(monkeypatch, fake_slack):
    """同じ投稿から二度 Issue を立てない。"""
    monkeypatch.setattr(slack_to_issue, "fetch_recent_messages", lambda c, limit=50: [REQUEST])
    monkeypatch.setattr(slack_to_issue, "fetch_known_permalinks", lambda r, limit=100: {PERMALINK})

    created = []
    monkeypatch.setattr(
        slack_to_issue, "create_issue", lambda *a: created.append(a) or {"number": 1, "html_url": "x"}
    )

    assert slack_to_issue.run(CHANNEL, REPO) == 0
    assert created == []


def test_creates_issue_for_new_request(monkeypatch, fake_slack):
    monkeypatch.setattr(slack_to_issue, "fetch_recent_messages", lambda c, limit=50: [REQUEST])
    monkeypatch.setattr(slack_to_issue, "fetch_known_permalinks", lambda r, limit=100: set())

    created = []

    def fake_create(repo, title, body):
        created.append({"title": title, "body": body})
        return {"number": 42, "html_url": "https://github.com/x/y/issues/42"}

    monkeypatch.setattr(slack_to_issue, "create_issue", fake_create)

    assert slack_to_issue.run(CHANNEL, REPO) == 1
    assert created[0]["title"] == "気温グラフに湿度も重ねて表示してほしい"
    assert PERMALINK in created[0]["body"]


def test_replies_to_thread_after_creating(monkeypatch, fake_slack):
    monkeypatch.setattr(slack_to_issue, "fetch_recent_messages", lambda c, limit=50: [REQUEST])
    monkeypatch.setattr(slack_to_issue, "fetch_known_permalinks", lambda r, limit=100: set())
    monkeypatch.setattr(
        slack_to_issue,
        "create_issue",
        lambda *a: {"number": 42, "html_url": "https://github.com/x/y/issues/42"},
    )

    slack_to_issue.run(CHANNEL, REPO)

    assert len(fake_slack) == 1
    assert "issues/42" in fake_slack[0]


def test_ignores_join_message_even_with_trigger(monkeypatch, fake_slack):
    """参加通知は合図が付いていても拾わない。"""
    monkeypatch.setattr(slack_to_issue, "fetch_recent_messages", lambda c, limit=50: [JOIN])
    monkeypatch.setattr(slack_to_issue, "fetch_known_permalinks", lambda r, limit=100: set())

    created = []
    monkeypatch.setattr(slack_to_issue, "create_issue", lambda *a: created.append(a))

    assert slack_to_issue.run(CHANNEL, REPO) == 0
    assert created == []


def test_dry_run_creates_nothing(monkeypatch, fake_slack):
    monkeypatch.setattr(slack_to_issue, "fetch_recent_messages", lambda c, limit=50: [REQUEST])
    monkeypatch.setattr(slack_to_issue, "fetch_known_permalinks", lambda r, limit=100: set())

    created = []
    monkeypatch.setattr(slack_to_issue, "create_issue", lambda *a: created.append(a))

    assert slack_to_issue.run(CHANNEL, REPO, dry_run=True) == 1
    assert created == []


def test_thread_reply_failure_does_not_lose_the_issue(monkeypatch, fake_slack):
    """返信に失敗しても、起票済みなら成功として数える。"""
    monkeypatch.setattr(slack_to_issue, "fetch_recent_messages", lambda c, limit=50: [REQUEST])
    monkeypatch.setattr(slack_to_issue, "fetch_known_permalinks", lambda r, limit=100: set())
    monkeypatch.setattr(
        slack_to_issue,
        "create_issue",
        lambda *a: {"number": 42, "html_url": "https://github.com/x/y/issues/42"},
    )

    def boom(*a):
        raise slack_to_issue.SlackError("chat:write が無い")

    monkeypatch.setattr(slack_to_issue, "post_thread_reply", boom)

    assert slack_to_issue.run(CHANNEL, REPO) == 1


def test_known_permalinks_extracts_from_issue_body(monkeypatch):
    """Issue 本文から permalink を拾えること。"""

    class FakeResponse:
        def raise_for_status(self):
            pass

        def json(self):
            return [
                {"body": f"## 出典\n\n- 依頼者: kaz\n- 元投稿: {PERMALINK}\n"},
                {"body": "permalink を含まない Issue"},
                {"body": None},
            ]

    monkeypatch.setenv("GITHUB_TOKEN", "dummy")
    monkeypatch.setattr(slack_to_issue.httpx, "get", lambda *a, **k: FakeResponse())

    assert slack_to_issue.fetch_known_permalinks(REPO) == {PERMALINK}
