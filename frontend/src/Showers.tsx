import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。PrecipitationType.tsx と同様。
export function formatShowers(data: WeatherResponse): string {
  const { value, unit } = data.showers;
  return `にわか雨 ${Math.round(value * 10) / 10}${unit}`;
}

export function Showers({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: "4px 0" }}>{formatShowers(data)}</p>
  );
}
