import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。ISO8601 の "2026-07-21T09:00" を "7月21日 09:00 時点（日本時間）" にする。
//
// fetch_forecast() は Open-Meteo に timezone=Asia/Tokyo を指定して取得しており
// 値自体は既に日本時間だが、ISO8601 文字列にタイムゾーン情報が付かないため、
// 表示だけでは UTC と見分けがつかないという声を受けて明記する（Issue #206）。
export function formatObservedAt(iso: string): string {
  const month = parseInt(iso.slice(5, 7), 10);
  const day = parseInt(iso.slice(8, 10), 10);
  const time = iso.slice(11, 16);
  return `${month}月${day}日 ${time} 時点（日本時間）`;
}

export function ObservedAt({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ color: "var(--text-tertiary)", fontSize: 12, margin: "0 0 8px" }}>
      {formatObservedAt(data.observed_at)}
    </p>
  );
}
