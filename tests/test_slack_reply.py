"""slack_reply のテスト。Slack には接続しない。

ワークフロー経由の呼び出しは引数が文字列でしか渡ってこないので、
形式ずれ・空文字をどこまで弾けるかが安全弁になる。そこを固定する。
"""

import pytest

from app import slack_reply


class TestValidateArgs:
    def test_正常な引数は通る(self):
        assert slack_reply.validate_args("1784748786.516029", "返信本文") is None

    def test_前後の空白は許容する(self):
        assert slack_reply.validate_args(" 1784748786.516029 ", "返信本文") is None

    @pytest.mark.parametrize(
        "thread_ts",
        [
            "",
            "   ",
            "1784748786",  # 小数点なし
            "1784748786.516029.1",  # 区切りが多い
            "abc.def",  # 数字でない
            "p1784748786516029",  # permalink の形式のまま
        ],
    )
    def test_不正な_ts_は弾く(self, thread_ts):
        error = slack_reply.validate_args(thread_ts, "返信本文")
        assert error is not None
        assert "thread_ts" in error

    def test_空の本文は弾く(self):
        error = slack_reply.validate_args("1784748786.516029", "   ")
        assert error is not None
        assert "text" in error


class TestMain:
    def test_引数不足は_usage_を出して_2(self, capsys):
        assert slack_reply.main(["1784748786.516029"]) == 2
        assert "usage" in capsys.readouterr().err

    def test_不正な_ts_は_2(self, capsys):
        assert slack_reply.main(["not-a-ts", "本文"]) == 2
        assert "thread_ts" in capsys.readouterr().err

    def test_チャンネル未設定は_2(self, monkeypatch, capsys):
        monkeypatch.delenv("SLACK_CHANNEL_ID", raising=False)
        assert slack_reply.main(["1784748786.516029", "本文"]) == 2
        assert "SLACK_CHANNEL_ID" in capsys.readouterr().err

    def test_正常系は_post_thread_reply_を呼ぶ(self, monkeypatch):
        monkeypatch.setenv("SLACK_CHANNEL_ID", "C0BJK86F2K0")
        calls = []
        monkeypatch.setattr(
            slack_reply,
            "post_thread_reply",
            lambda channel, ts, text: calls.append((channel, ts, text)),
        )
        assert slack_reply.main([" 1784748786.516029 ", "返信本文"]) == 0
        assert calls == [("C0BJK86F2K0", "1784748786.516029", "返信本文")]

    def test_Slack_エラーは_1(self, monkeypatch, capsys):
        monkeypatch.setenv("SLACK_CHANNEL_ID", "C0BJK86F2K0")

        def boom(channel, ts, text):
            raise slack_reply.SlackError("chat.postMessage が失敗: not_in_channel")

        monkeypatch.setattr(slack_reply, "post_thread_reply", boom)
        assert slack_reply.main(["1784748786.516029", "本文"]) == 1
        assert "not_in_channel" in capsys.readouterr().err
