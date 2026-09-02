import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。TemperatureMean.tsx の formatTemperatureMean と同様。
export function formatApparentTemperatureMean(data: WeatherResponse): string {
  const { value, unit } = data.apparent_temperature_mean;
  return `体感の平均 ${Math.round(value * 10) / 10}${unit}`;
}

export function ApparentTemperatureMean({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ color: "var(--text-secondary)", fontSize: 16, margin: "4px 0" }}>
      {formatApparentTemperatureMean(data)}
    </p>
  );
}
