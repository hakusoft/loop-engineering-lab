import type { SeriesResponse } from "./api";

// 表示ロジックを純関数に切り出す。WindPeakOutlook.tsx の
// formatWindPeakOutlook と同じ考え方。ピーク自体は format_hourly_series 側
// （wind_speed_peak と同じ考え方）で計算済みのものをそのまま使う。
//
// 「日射量が一番強かった時刻も分かると嬉しい」という声を受けて追加する。
export function formatSolarRadiationPeakOutlook(data: SeriesResponse): string | null {
  const peak = data.shortwave_radiation_peak;
  if (!peak) return null;

  // "2026-08-26T15:00" -> "15:00"。
  const toTime = (t: string) => t.slice(11, 16);

  return `日射量は${toTime(peak.time)}ごろ（${Math.round(peak.value * 10) / 10}W/m²）が最大の見込み`;
}

export function SolarRadiationPeakOutlook({ data }: { data: SeriesResponse }) {
  const text = formatSolarRadiationPeakOutlook(data);
  if (text === null) return null;

  return (
    <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: "4px 0" }}>{text}</p>
  );
}
