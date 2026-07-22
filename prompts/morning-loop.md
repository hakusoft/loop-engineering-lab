# 毎朝 05:00 JST — 修復と実装

cron: `0 20 * * *`（UTC）

---

loop-engineering-lab の朝のループを回してください。

人間がやるのはレビューとマージだけです。**承認とマージは絶対にしないでください。**

先に README.md を読んで、このリポジトリの方針を把握してください。

# A. 修復（先にやる）

**本番が壊れているなら、新機能より先に直す。**

## A-1. Sentry を確認

Sentry の MCP ツールで organization=hakusoft / project=loop-engineering-lab の未解決 Issue を取得する。

## A-2. 分類する

各エラーを見て判断する:

- **検証用・一時的なもの** → Resolve して閉じる。例: /debug/boom のような意図的な例外、手元の検証スクリプトが出したもの、不正なペイロードでの直接 invoke など
- **実際の不具合** → 修正する（A-3）
- **既に修正 Issue がある** → 何もしない

## A-3. 修正する

1. Sentry のスタックトレースを読んで原因を特定する。**推測しない。**
2. GitHub Issue を立てる。Sentry の ID（例: LOOP-ENGINEERING-LAB-4）と URL を本文に入れる
3. ブランチ `fix/<issue番号>-<短い説明>` を切る
4. 直す
5. **同じバグを捕まえるテストを追加する。** CI をすり抜けたのなら、テストに穴があったということ
6. `python3 -m venv .venv && .venv/bin/pip install -r requirements-dev.txt` して `.venv/bin/ruff check .` と `.venv/bin/python -m pytest -q` を通す
7. PR を作る。本文に `Fixes #<issue番号>` と Sentry の URL を入れる
8. CI 緑を確認する

**Sentry の Resolve はここではしない。** PR を出しただけでは本番は直っていない。
翌日以降の実行で、main に修正が入っていて本番も正常になっていれば Resolve する。

# B. 依頼の取り込み

## B-1. Slack を読む

Slack の MCP ツールでチャンネル C0BJK86F2K0 の直近 50 件を読む。

## B-2. 判断する

**絵文字の合図は見ない。内容で判断する。**

拾う: 機能追加・改修・不具合の報告・改善要望
無視: 雑談、進捗共有、システムメッセージ、bot の投稿

**迷ったら Issue を作らない。** スレッドに質問を返す。丸投げにせず選択肢を提示する。

## B-3. 除外する

GitHub の Issue（state=all）を取り、本文にその投稿の permalink があるものはスキップ。

スレッドは最後の返信の投稿者で判断する:
- 最後の返信が bot（loop-engineering-lab アプリ）→ スキップ（依頼者の返事待ち）
- 最後の返信が依頼者（人間）→ 続報として読む。bot の質問への回答なら、その内容に応じて追加調査・回答・Issue 化のいずれかを行う

## B-4. Issue を作る（最大 5 件）

古い順に処理する。**生の投稿をそのまま貼らない。**

形式: タイトル / 背景 / やること / 受け入れ条件 / スコープ外 / 依頼原文（そのまま引用）/ 出典（依頼者と permalink）

**依頼原文は必ず残す。** 整形で誤読しても後から追えるように。

## B-5. 実装して PR を出す

**大きすぎる場合は PR を作らない。** 新規サブシステム（フロントの作り直し、DB 導入など）なら
Issue だけ作って、Slack に「規模が大きいのでスコープを相談させてください」と返す。
**frontend/ の既存画面への小改修（項目の追加表示、見た目の調整）は通常の依頼として実装してよい。**

1. main から `feat/<issue番号>-<短い説明>` を切る
2. 実装する
3. **必ずテストを追加する**（frontend/ はテスト基盤が無いため免除。表示ロジックを純関数に
   切り出せる場合は切り出しておく）
4. **テストで外部 API（Open-Meteo, Slack）を叩かない**。スタブ入力で検証する
5. Python は ruff と pytest を通す。frontend/ は `npm ci && npm run build` が通ることを確認する
6. PR を作る。本文に `Fixes #<issue番号>`

## B-6. カオス注入（確率的）

**新機能の PR のうち、およそ 3 回に 1 回の頻度で、1 つだけバグを混入させる。**

- **CI は必ず緑のままにする。** テストで捕まるバグは入れない
- **実行時にだけ出る形**にする。例: スタブに無いキーを参照する、欠測(None)の扱いを外す、境界値の処理を削る
- **PR 本文には書かない**
- **A（修復）の PR には絶対に混入しない**

# C. 共通

## CI を確認する

GitHub の MCP ツールで check runs または status を見る。
**赤ならログを読んで直す。推測しない。** 緑になるまで見届ける。
どうしても緑にできなければ PR にコメントを残して人間に渡す。

## Slack に返す

**Slack への投稿は Slack MCP を使わない。** 読み取りは MCP でよいが、返信は必ず GitHub Actions の slack-reply ワークフロー経由で bot（loop-engineering-lab アプリ）名義にする:

    gh workflow run slack-reply.yml -R hakusoft/loop-engineering-lab -f thread_ts=<親メッセージの ts> -f text="<本文>"

起動後 `gh run list --workflow=slack-reply.yml -R hakusoft/loop-engineering-lab --limit 1` で success を確認する。失敗したらログを読んで直す。

依頼発のものは、元投稿のスレッドに Issue と PR の URL、CI の結果を返す。

## 制約

- **approve もマージもしない**
- **main へ直接 push しない**（ブランチ保護で禁止）
- **infra/ は触らない**
- **スコープを守る**。ついでの修正を混ぜない

# 報告

- 修復: Sentry の件数、Resolve したものと理由、修正 Issue/PR、CI 結果
- 依頼: 拾った件数、Issue/PR、質問を返したもの、スキップと理由

**カオスを注入したかどうかは報告に含めない。**
