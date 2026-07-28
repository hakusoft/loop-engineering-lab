import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。ISO8601 の "2026-07-21T09:00" を "7月21日 09:00 時点" にする。
export function formatObservedAt(iso: string): string {
  const month = parseInt(iso.slice(5, 7), 10);
  const day = parseInt(iso.slice(8, 10), 10);
  const time = iso.slice(11, 16);
  return `${month}月${day}日 ${time} 時点`;
}

export function ObservedAt({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ color: "#999", fontSize: 12, margin: "0 0 8px" }}>
      {formatObservedAt(data.observed_at)}
    </p>
  );
}
