# loop-engineering-lab

Slack に依頼を書くと、翌朝には本番に出ている。その一周を AI だけで回す実験です。

デモ: https://d10o14tv6y0g4t.cloudfront.net

人間が手を動かすのは、最初の依頼を書くところだけ。

```mermaid
flowchart TD
    SLACK[Slack の依頼] --> ISSUE[Issue]
    ISSUE --> PR[実装 PR]
    PR --> CI{CI}
    CI -->|赤| PR
    CI -->|緑| REVIEW[AI レビュー]
    REVIEW -->|問題あり| PR
    REVIEW -->|承認| MERGE([マージ])
    MERGE --> PROD[本番]
    PROD -->|実行時エラー| SENTRY[Sentry]
    SENTRY --> ISSUE

    classDef human fill:#0b7285,stroke:#075c6b,color:#fff
    class SLACK human
```

依頼から本番反映まで、およそ 1 時間。上のデモも今朝このループが更新しました。

## 毎朝 3 つのルーチンが動く

| 時刻 | ルーチン | やること |
|---|---|---|
| 04:30 | 依頼生成 | デモ用の依頼を Slack に投稿する（本来は人がやる部分） |
| 05:00 | 朝のループ | Sentry 修復 → Slack 読解 → Issue 化 → 実装 → PR → CI 緑まで |
| 06:00 | レビュー | 差分をチェックし、問題がなければ承認してマージ |

作る側と見る側は別に動かしています。書いた本人が自分の PR を承認することはありません。
レビュー側は文脈を引き継がず、差分だけを読み直します。

### わざとバグを混ぜて、見抜けるか毎日試す

実装 PR には 3 回に 1 回くらい、わざとバグを混ぜます。
CI をすり抜け、本番で実際に動いて初めて表に出る種類のものです。

レビューが気づけばマージ前に差し戻し、見逃せば本番でエラーが起きて翌朝に直る。
どちらに転んでも、ループの中で閉じます。

| 混ぜたバグ | 検知 | 記録 |
|---|---|---|
| 北寄りの風向きで `/weather` が 500 になる | Sentry | [#43](../../issues/43) → [#44](../../pull/44) |
| 視程のキー名が違い `/weather` が 500 になる | Sentry | [#67](../../issues/67) → [#68](../../pull/68) |
| 日の出と日の入りの時刻が逆に表示される | レビュー | [#61](../../issues/61) → [#62](../../pull/62) |

3 つ目は例外を投げず動いてしまうため、Sentry には出ません。
差分を読んで気づくしかないバグで、これはレビューが見つけました。

### あいまいな依頼は、聞き返す

判断が割れる依頼は、推測で実装を始めず、選択肢を添えて聞き返します。

![Slack で bot が依頼者に確認の質問を返している様子。「スマホで見てたら、たまにグラフの右端が切れて見えることがある気がします」という報告に対し、bot が「パソコンでも同じ現象が起きますか、それともスマホだけですか」など 3 点を選択肢つきで質問している](docs/images/slack-clarifying-question.png)

依頼は人間名義、返信は bot 名義でアカウントを分けています。
スレッドの最後が bot なら返事待ち、人間なら続報として翌朝のループが追います。

## 技術構成

```mermaid
flowchart LR
    BROWSER[Browser]
    subgraph AWS["AWS ap-northeast-1"]
        direction TB
        AGW[API Gateway] --> LAMBDA[Lambda / FastAPI]
        CF[CloudFront / OAC] --> S3[(S3 静的ファイル)]
        LAMBDA -.-> LOGS[CloudWatch Logs]
    end
    BROWSER -->|fetch| AGW
    BROWSER --> CF
    GHA[GitHub Actions] -->|OIDC: API 更新| LAMBDA
    GHA -->|OIDC: 画面更新| S3
    LAMBDA --> OM[Open-Meteo]
    LAMBDA -.-> SENTRY[Sentry]

    classDef aws fill:#ff9900,stroke:#232f3e,color:#232f3e
    classDef ext fill:#e8e8e8,stroke:#666,color:#333
    class AGW,LAMBDA,LOGS,CF,S3 aws
    class OM,SENTRY,GHA,BROWSER ext
```

| 役割 | 使っているもの |
|---|---|
| 実行基盤 | Lambda + API Gateway（FastAPI を Mangum で載せる） |
| フロント配信 | S3 + CloudFront（OAC で S3 は非公開） |
| IaC | Terraform（state は S3。変更は手動 `apply`） |
| CI/CD | GitHub Actions。main マージで自動デプロイ（OIDC、鍵を置かない） |
| 監視 | Sentry |
| 自動化 | Claude Code のクラウドルーチン（[`prompts/`](prompts/)） |

天気アプリはループが実装した成果物であって主題ではありません。
ループの定義は [`prompts/`](prompts/) にあります。

## ループを成立させている設計判断

**CI の赤は、コードが壊れたときだけ起きるようにする。**
外部要因で赤くなると、AI が「自分の変更が壊した」と読み違えるため、
テストは外部 API を叩きません。

**インフラ変更は人間が承認する。** `apply` は作り替えを伴い得るため、ここは自動化していません。

## 開発

```bash
python3 -m venv .venv && .venv/bin/pip install -r requirements-dev.txt
.venv/bin/ruff check . && .venv/bin/python -m pytest -q   # CI と同じ
```

フロントは [`frontend/`](frontend/)、デプロイ手順は [`infra/README.md`](infra/README.md)。
