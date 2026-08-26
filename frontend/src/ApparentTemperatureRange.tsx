import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。TemperatureRange.tsx の formatTemperatureRange と同様。
export function formatApparentTemperatureRange(data: WeatherResponse): string {
  const { value: max, unit } = data.apparent_temperature_max;
  const { value: min } = data.apparent_temperature_min;
  return `体感 最高 ${Math.round(max * 10) / 10}${unit} ・ 最低 ${Math.round(min * 10) / 10}${unit}`;
}

export function ApparentTemperatureRange({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ color: "var(--text-secondary)", fontSize: 16, margin: "4px 0" }}>
      {formatApparentTemperatureRange(data)}
    </p>
  );
}
