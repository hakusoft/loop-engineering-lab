import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。PrecipitationSum.tsx の formatPrecipitationSum と同様。
export function formatPrecipitationHours(data: WeatherResponse): string {
  const { value, unit } = data.precipitation_hours;
  return `本日の降水時間 ${Math.round(value * 10) / 10}${unit}`;
}

export function PrecipitationHours({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ color: "#666", fontSize: 14, margin: "4px 0" }}>
      {formatPrecipitationHours(data)}
    </p>
  );
}
