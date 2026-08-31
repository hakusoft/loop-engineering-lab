import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。TemperatureRange.tsx の formatTemperatureRange と同様。
export function formatTemperatureMean(data: WeatherResponse): string {
  const { value, unit } = data.temperature_mean;
  return `平均 ${Math.round(value * 10) / 10}${unit}`;
}

export function TemperatureMean({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ color: "var(--text-secondary)", fontSize: 16, margin: "4px 0" }}>
      {formatTemperatureMean(data)}
    </p>
  );
}
