import type { SeriesResponse } from "./api";

// 表示ロジックを純関数に切り出す。ThunderstormOutlook.tsx の
// formatThunderstormOutlook と同様。ピーク自体は format_hourly_series 側
// （cape_peak と同じ考え方）で計算済みのものをそのまま使う。
//
// 「最大瞬間風速の数字は見れるけど、それが何時ごろの予想か分からない」
// という声を受けて追加する。
export function formatWindPeakOutlook(data: SeriesResponse): string | null {
  const speedPeak = data.wind_speed_peak;
  const gustsPeak = data.wind_gusts_peak;
  if (!speedPeak && !gustsPeak) return null;

  // "2026-08-26T15:00" -> "15:00"。
  const toTime = (t: string) => t.slice(11, 16);

  const parts: string[] = [];
  if (speedPeak) {
    parts.push(`最大風速は${toTime(speedPeak.time)}ごろ（${Math.round(speedPeak.value * 10) / 10}km/h）`);
  }
  if (gustsPeak) {
    parts.push(`最大瞬間風速は${toTime(gustsPeak.time)}ごろ（${Math.round(gustsPeak.value * 10) / 10}km/h）`);
  }
  return `${parts.join("、")}の見込み`;
}

export function WindPeakOutlook({ data }: { data: SeriesResponse }) {
  const text = formatWindPeakOutlook(data);
  if (text === null) return null;

  return (
    <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: "4px 0" }}>{text}</p>
  );
}
