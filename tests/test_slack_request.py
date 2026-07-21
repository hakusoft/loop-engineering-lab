"""slack_request のテスト。Slack API には触らない。

スタブは Slack の conversations.history が返す形を写したもの。
"""

from app.slack_request import (
    TITLE_MAX_LENGTH,
    build_issue,
    build_issue_body,
    build_issue_title,
    has_trigger_reaction,
    is_request_candidate,
)

STUB_MESSAGE = {
    "type": "message",
    "user": "U123ABC",
    "user_name": "kaz",
    "text": "気温グラフに湿度も重ねて表示してほしい\n見比べたいので同じチャートで。",
    "ts": "1753000000.000100",
    "permalink": "https://hakusoft.slack.com/archives/C0BJK86F2K0/p1753000000000100",
    "reactions": [{"name": "ticket", "count": 1, "users": ["U123ABC"]}],
}


def test_title_uses_first_line():
    assert build_issue_title(STUB_MESSAGE["text"]) == "気温グラフに湿度も重ねて表示してほしい"


def test_title_truncates_long_text():
    long_text = "あ" * 200
    title = build_issue_title(long_text)

    assert len(title) == TITLE_MAX_LENGTH
    assert title.endswith("…")


def test_title_falls_back_when_empty():
    assert build_issue_title("   \n  ") == "Slack からの依頼（本文なし）"


def test_title_expands_slack_markup():
    """山括弧記法がタイトルにそのまま出ない。"""
    title = build_issue_title("<@U999|hanako> さんの <https://example.com|要望> を対応したい")

    assert title == "@hanako さんの 要望 を対応したい"
    assert "<" not in title


def test_body_includes_permalink_and_author():
    body = build_issue_body(STUB_MESSAGE)

    assert STUB_MESSAGE["permalink"] in body
    assert "kaz" in body
    assert "湿度も重ねて" in body


def test_body_without_permalink_omits_the_line():
    """permalink が無くても壊れない。"""
    message = {k: v for k, v in STUB_MESSAGE.items() if k != "permalink"}

    body = build_issue_body(message)

    assert "元投稿" not in body
    assert "kaz" in body


def test_has_trigger_reaction_detects_ticket():
    assert has_trigger_reaction(STUB_MESSAGE) is True


def test_has_trigger_reaction_ignores_other_emoji():
    message = {**STUB_MESSAGE, "reactions": [{"name": "eyes", "count": 1}]}

    assert has_trigger_reaction(message) is False


def test_has_trigger_reaction_without_reactions_key():
    """リアクションが 1 つも無い投稿でも落ちない。"""
    message = {k: v for k, v in STUB_MESSAGE.items() if k != "reactions"}

    assert has_trigger_reaction(message) is False


def test_has_trigger_reaction_handles_skin_tone():
    """スキントーン付きの名前でも合図として認識する。"""
    message = {**STUB_MESSAGE, "reactions": [{"name": "ticket::skin-tone-3", "count": 1}]}

    assert has_trigger_reaction(message) is True


def test_is_request_candidate_accepts_normal_message():
    assert is_request_candidate(STUB_MESSAGE) is True


def test_is_request_candidate_rejects_join_message():
    """参加通知は、合図が付いていても依頼として拾わない。

    本文は実チャンネル(#loop-engineering-lab)に流れていたものをそのまま使う。
    """
    join = {
        "type": "message",
        "subtype": "channel_join",
        "user": "U0BH6T6L1E3",
        "text": "<@U0BH6T6L1E3|kaz>さんがチャンネルに参加しました",
        "ts": "1784590915.533199",
        "reactions": [{"name": "ticket", "count": 1}],
    }

    assert has_trigger_reaction(join) is True  # 合図自体は付いている
    assert is_request_candidate(join) is False  # それでも拾わない


def test_is_request_candidate_rejects_bot_message():
    """ループ自身の投稿を拾い直さない。"""
    bot = {**STUB_MESSAGE, "bot_id": "B123456"}

    assert is_request_candidate(bot) is False


def test_is_request_candidate_rejects_empty_text():
    empty = {**STUB_MESSAGE, "text": "   "}

    assert is_request_candidate(empty) is False


def test_is_request_candidate_rejects_without_trigger():
    no_trigger = {**STUB_MESSAGE, "reactions": [{"name": "eyes", "count": 1}]}

    assert is_request_candidate(no_trigger) is False


def test_build_issue_returns_title_and_body():
    issue = build_issue(STUB_MESSAGE)

    assert issue["title"] == "気温グラフに湿度も重ねて表示してほしい"
    assert STUB_MESSAGE["permalink"] in issue["body"]
