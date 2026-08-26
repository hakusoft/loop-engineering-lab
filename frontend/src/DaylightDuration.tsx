import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。SunshineDuration.tsx の formatSunshineDuration と同様。
// API の値は既に時間単位（daylight_duration.unit === "h"）なので変換不要。
export function formatDaylightDuration(data: WeatherResponse): string {
  const { value } = data.daylight_duration;
  return `可照時間 ${Math.round(value * 10) / 10}時間`;
}

export function DaylightDuration({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ color: "var(--text-secondary)", fontSize: 16, margin: "4px 0" }}>
      {formatDaylightDuration(data)}
    </p>
  );
}
