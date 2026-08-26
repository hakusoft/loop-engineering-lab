import type { SeriesResponse } from "./api";

// 表示ロジックを純関数に切り出す。雷の時間帯が無ければ null（表示しない）。
export function formatThunderstormOutlook(data: SeriesResponse): string | null {
  const hours = data.thunderstorm_hours;
  if (hours.length === 0) return null;

  // "2026-08-26T15:00" -> "15時"。連続していても最初と最後だけ伝える。
  const toHour = (t: string) => `${t.slice(11, 13)}時`;
  const first = toHour(hours[0]);
  const last = toHour(hours[hours.length - 1]);
  const span = first === last ? first : `${first}〜${last}`;
  return `本日、夕立・雷の可能性あり（${span}ごろ）`;
}

export function ThunderstormOutlook({ data }: { data: SeriesResponse }) {
  const text = formatThunderstormOutlook(data);
  if (text === null) return null;

  return (
    <p style={{ color: "#e2492c", fontSize: 14, fontWeight: 600, margin: "4px 0" }}>{text}</p>
  );
}
