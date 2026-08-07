import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。PrecipitationSum.tsx の formatPrecipitationSum と同様。
export function formatPrecipitation(data: WeatherResponse): string {
  const { value, unit } = data.precipitation_probability;
  return `現在の降水量 ${Math.round(value * 10) / 10}${unit}`;
}

export function Precipitation({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ color: "#666", fontSize: 14, margin: "4px 0" }}>
      {formatPrecipitation(data)}
    </p>
  );
}
