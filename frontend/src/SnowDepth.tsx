import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。TemperatureRange.tsx の formatTemperatureRange と同様。
export function formatSnowDepth(data: WeatherResponse): string {
  const { value, unit } = data.snow_depth;
  return `積雪の深さ ${value}${unit}`;
}

export function SnowDepth({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ color: "#666", fontSize: 14, margin: "4px 0" }}>
      {formatSnowDepth(data)}
    </p>
  );
}
