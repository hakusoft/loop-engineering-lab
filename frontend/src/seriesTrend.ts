import type { SeriesResponse } from "./api";

// SeriesResponse の系列（1時間刻み）から、now に最も近い時刻の値と1時間前の値を
// 比べて上がった/下がった/変わらないを返す。TemperatureChart.tsx の uvIndexPeak と
// 同じ「now に最も近いインデックスを探す」考え方を使う。TemperatureTrend.tsx /
// HumidityTrend.tsx の共通ロジックとして切り出す。
//
// 該当する系列が無い、now に最も近い時刻が先頭（1時間前が無い）、または今の値が
// 欠測（null）のときは null を返す。
export type Trend = { direction: "up" | "down" | "same"; diff: number };

export function seriesTrend(
  data: SeriesResponse,
  label: string,
  now: Date = new Date(),
): Trend | null {
  const series = data.series.find((s) => s.label === label);
  if (!series) return null;

  let nowIndex = -1;
  let bestDiff = Infinity;
  data.timestamps.forEach((t, i) => {
    const diff = Math.abs(new Date(t).getTime() - now.getTime());
    if (diff < bestDiff) {
      bestDiff = diff;
      nowIndex = i;
    }
  });
  if (nowIndex <= 0) return null;

  const current = series.values[nowIndex];
  if (current === null) return null;
  const previous = series.values[nowIndex - 1] ?? current;

  const diff = Math.round((current - previous) * 10) / 10;
  const direction = diff > 0 ? "up" : diff < 0 ? "down" : "same";
  return { direction, diff: Math.abs(diff) };
}
