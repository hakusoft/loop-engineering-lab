import type { SeriesResponse } from "./api";

// 表示ロジックを純関数に切り出す。サマリー文字列はサーバー側で組み立てている。
export function formatDailySummary(data: SeriesResponse): string {
  return data.daily_summary;
}

export function DailySummary({ data }: { data: SeriesResponse }) {
  return (
    <p style={{ fontSize: 16, fontWeight: 600, margin: "8px 0" }}>
      今日は {formatDailySummary(data)}
    </p>
  );
}
