import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。Humidity.tsx の formatHumidity と同様。
// API の値は既に時間単位（sunshine_duration.unit === "h"）なので変換不要。
export function formatSunshineDuration(data: WeatherResponse): string {
  const { value } = data.sunshine_duration;
  return `日照時間 ${Math.round(value * 10) / 10}時間`;
}

export function SunshineDuration({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ color: "#666", fontSize: 14, margin: "4px 0" }}>
      {formatSunshineDuration(data)}
    </p>
  );
}
