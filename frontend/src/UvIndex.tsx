import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。TemperatureRange.tsx の formatTemperatureRange と同様。
export function formatUvIndex(data: WeatherResponse): string {
  const { value } = data.uv_index_max;
  return `紫外線指数（最大） ${Math.round(value * 10) / 10}`;
}

export function UvIndex({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ color: "#666", fontSize: 14, margin: "4px 0" }}>
      {formatUvIndex(data)}
    </p>
  );
}
