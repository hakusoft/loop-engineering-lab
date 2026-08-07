import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。TemperatureRange.tsx の formatTemperatureRange と同様。
export function formatUvIndex(data: WeatherResponse): string {
  const current = Math.round(data.uv_index.value * 10) / 10;
  const max = Math.round(data.uv_index_max.value * 10) / 10;
  return `紫外線指数 ${current}（本日の最大 ${max}）`;
}

export function UvIndex({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ color: "#666", fontSize: 14, margin: "4px 0" }}>
      {formatUvIndex(data)}
    </p>
  );
}
