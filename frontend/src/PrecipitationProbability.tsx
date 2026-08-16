import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。TemperatureRange.tsx の formatTemperatureRange と同様。
export function formatPrecipitationProbability(data: WeatherResponse): string {
  const { value, unit } = data.precipitation_probability;
  return `降水確率 ${Math.round(value)}${unit}`;
}

export function PrecipitationProbability({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ color: "#666", fontSize: 16, margin: "4px 0" }}>
      {formatPrecipitationProbability(data)}
    </p>
  );
}
