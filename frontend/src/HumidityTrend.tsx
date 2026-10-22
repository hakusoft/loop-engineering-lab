import type { SeriesResponse } from "./api";
import { seriesTrend } from "./seriesTrend";

// 気温と同じく、今の湿度も1時間前と比べて上がったか下がったか分かると助かる
// という声を受けて追加する（Issue #621）。TemperatureTrend.tsx と同じ考え方。
export function formatHumidityTrend(
  data: SeriesResponse,
  now: Date = new Date(),
): string | null {
  const trend = seriesTrend(data, "湿度", now);
  if (!trend) return null;
  if (trend.direction === "same") {
    return "湿度は1時間前から変わっていません";
  }
  const arrow = trend.direction === "up" ? "上がって" : "下がって";
  return `湿度は1時間前から${trend.diff}%${arrow}います`;
}

export function HumidityTrend({ data }: { data: SeriesResponse }) {
  const text = formatHumidityTrend(data);
  if (text === null) return null;

  return (
    <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: "4px 0" }}>{text}</p>
  );
}
