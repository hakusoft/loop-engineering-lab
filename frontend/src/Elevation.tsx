import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。Humidity.tsx の formatHumidity と同様。
export function formatElevation(data: WeatherResponse): string {
  const { value, unit } = data.elevation;
  return `標高 ${Math.round(value)}${unit}`;
}

export function Elevation({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ color: "#666", fontSize: 14, margin: "4px 0" }}>
      {formatElevation(data)}
    </p>
  );
}
