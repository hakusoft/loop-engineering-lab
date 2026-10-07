import type { SeriesResponse } from "./api";

// 表示ロジックを純関数に切り出す。WindPeakOutlook.tsx の
// formatWindPeakOutlook と同じ考え方。ピーク自体は format_hourly_series 側
// （wind_speed_peak と同じ考え方）で計算済みのものをそのまま使う。
//
// 「体感温度の最高・最低も何時頃だったか知りたい」という声を受けて追加する。
export function formatApparentTemperaturePeakOutlook(data: SeriesResponse): string | null {
  const peak = data.apparent_temperature_peak;
  const trough = data.apparent_temperature_trough;
  if (!peak && !trough) return null;

  // "2026-08-26T15:00" -> "15:00"。
  const toTime = (t: string) => t.slice(11, 16);

  const parts: string[] = [];
  if (peak) {
    parts.push(`体感温度の最高は${toTime(peak.time)}ごろ（${Math.round(peak.value * 10) / 10}°C）`);
  }
  if (trough) {
    parts.push(`最低は${toTime(trough.time)}ごろ（${Math.round(trough.value * 10) / 10}°C）`);
  }
  return `${parts.join("、")}の見込み`;
}

export function ApparentTemperaturePeakOutlook({ data }: { data: SeriesResponse }) {
  const text = formatApparentTemperaturePeakOutlook(data);
  if (text === null) return null;

  return (
    <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: "4px 0" }}>{text}</p>
  );
}
