import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。凍結高度（0℃高度、FreezingLevel.tsx）とは別の
// 変数で、積雪境界（湿球温度ベース）の高度を示す（Issue #597）。
export function formatSnowfallHeight(data: WeatherResponse): string {
  const { value, unit } = data.snowfall_height;
  return `降雪境界の高さ 約 ${Math.round(value)}${unit}`;
}

export function SnowfallHeight({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: "4px 0" }}>
      {formatSnowfallHeight(data)}
    </p>
  );
}
