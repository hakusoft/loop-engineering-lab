import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。TemperatureMean.tsx の formatTemperatureMean と同様。
//
// Open-Meteo のモデル値は仕様上まれに100%を超えることがある。Humidity.tsx の
// formatHumidity と同じ理由（Issue #276）で、表示側だけ100%で上限キャップする。
export function formatHumidityMean(data: WeatherResponse): string {
  const { value, unit } = data.humidity_mean;
  return `平均 ${Math.round(Math.min(value, 100) * 10) / 10}${unit}`;
}

export function HumidityMean({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ color: "var(--text-secondary)", fontSize: 16, margin: "4px 0" }}>
      {formatHumidityMean(data)}
    </p>
  );
}
