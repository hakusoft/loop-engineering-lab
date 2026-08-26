import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。雨が雪に変わる高さ（0℃ 高度）を出す。
export function formatFreezingLevel(data: WeatherResponse): string {
  const { value, unit } = data.freezing_level_height;
  return `雪になる高さ 約 ${Math.round(value)}${unit}`;
}

export function FreezingLevel({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: "4px 0" }}>
      {formatFreezingLevel(data)}
    </p>
  );
}
