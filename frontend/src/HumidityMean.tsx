import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。TemperatureMean.tsx の formatTemperatureMean と同様。
export function formatHumidityMean(data: WeatherResponse): string {
  const { value, unit } = data.humidity_mean;
  return `平均 ${Math.round(value * 10) / 10}${unit}`;
}

export function HumidityMean({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ color: "var(--text-secondary)", fontSize: 16, margin: "4px 0" }}>
      {formatHumidityMean(data)}
    </p>
  );
}
