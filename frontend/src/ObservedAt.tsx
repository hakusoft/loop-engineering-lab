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

// 「今からどれくらい前か」も知りたいという声を受けて追記する（Issue #317）。
//
// observed_at は日本時間の naive な ISO8601 文字列（タイムゾーン情報なし）。
// 比較する「今」もブラウザのローカルタイムゾーンに関わらず日本時間で揃えないと
// ズレる（利用者が日本国外にいる場合など）ため、Intl.DateTimeFormat で
// 現在時刻を日本時間の文字列に変換してから、observed_at と同じ「タイムゾーン
// 情報のない日本時間」同士で差分を取る。
function nowInJst(): Date {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return new Date(
    `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}:${get("second")}`,
  );
}

export function formatElapsedSince(iso: string, now: Date = nowInJst()): string {
  const observed = new Date(iso);
  const minutes = Math.max(0, Math.round((now.getTime() - observed.getTime()) / 60000));

  if (minutes < 1) return "たった今";
  if (minutes < 60) return `${minutes}分前`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}時間前`;
  const days = Math.round(hours / 24);
  return `${days}日前`;
}

export function ObservedAt({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ color: "var(--text-tertiary)", fontSize: 12, margin: "0 0 8px" }}>
      {formatObservedAt(data.observed_at)}（{formatElapsedSince(data.observed_at)}）
    </p>
  );
}
