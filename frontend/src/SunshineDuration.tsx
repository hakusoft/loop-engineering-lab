import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。Humidity.tsx の formatHumidity と同様。
// API の値は秒単位（sunshine_duration）なので、時間に変換して表示する。
export function formatSunshineDuration(data: WeatherResponse): string {
  const { value } = data.sunshine_duration;
  const hours = value / 3600;
  return `日照時間 ${Math.round(hours * 10) / 10}時間`;
}

export function SunshineDuration({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ color: "#666", fontSize: 16, margin: "4px 0" }}>
      {formatSunshineDuration(data)}
    </p>
  );
}
