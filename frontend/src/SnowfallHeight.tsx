import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。FreezingLevel.tsx の formatFreezingLevel と同様。
export function formatSnowfallHeight(data: WeatherResponse): string {
  const { value, unit } = data.snowfall_height;
  return `雪が降る高さ 約 ${Math.round(value)}${unit}`;
}

export function SnowfallHeight({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: "4px 0" }}>
      {formatSnowfallHeight(data)}
    </p>
  );
}
