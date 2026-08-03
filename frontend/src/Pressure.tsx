import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。Humidity.tsx の formatHumidity と同様。
export function formatPressure(data: WeatherResponse): string {
  const { value, unit } = data.pressure;
  return `気圧 ${Math.round(value * 10) / 10}${unit}`;
}

export function Pressure({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ color: "#666", fontSize: 14, margin: "0 0 8px" }}>
      {formatPressure(data)}
    </p>
  );
}
