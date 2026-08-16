import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。Humidity.tsx の formatHumidity と同様。
export function formatDewPoint(data: WeatherResponse): string {
  const { value, unit } = data.dew_point;
  return `露点温度 ${Math.round(value * 10) / 10}${unit}`;
}

export function DewPoint({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ color: "#666", fontSize: 16, margin: "0 0 8px" }}>
      {formatDewPoint(data)}
    </p>
  );
}
