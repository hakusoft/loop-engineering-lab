import type { SeriesResponse } from "./api";
import { seriesTrend } from "./seriesTrend";

// 今の気温が1時間前と比べて上がったか下がったか分かると助かるという声を受けて
// 追加する（Issue #621）。表示ロジックを純関数に切り出す。
// TemperaturePeakOutlook.tsx と同様、series（SeriesResponse）を使うため
// DISPLAY_ITEMS 経由ではなく App.tsx に直接追加する。
export function formatTemperatureTrend(
  data: SeriesResponse,
  now: Date = new Date(),
): string | null {
  const trend = seriesTrend(data, "気温", now);
  if (!trend) return null;
  if (trend.direction === "same") {
    return "気温は1時間前から変わっていません";
  }
  const arrow = trend.direction === "up" ? "上がって" : "下がって";
  return `気温は1時間前から${trend.diff}°C${arrow}います`;
}

export function TemperatureTrend({ data }: { data: SeriesResponse }) {
  const text = formatTemperatureTrend(data);
  if (text === null) return null;

  return (
    <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: "4px 0" }}>{text}</p>
  );
}
