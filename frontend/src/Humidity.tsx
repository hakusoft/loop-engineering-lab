import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。CurrentTemperature.tsx の formatTemperature と同様。
export function formatHumidity(data: WeatherResponse): string {
  const { value, unit } = data.humidity;
  return `湿度 ${Math.round(value)}${unit}`;
}

export function Humidity({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ color: "#666", fontSize: 14, margin: "0 0 8px" }}>
      {formatHumidity(data)}
    </p>
  );
}
