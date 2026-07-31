import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。Humidity.tsx の formatHumidity と同様。
export function formatWind(data: WeatherResponse): string {
  const { value: speed, unit: speedUnit } = data.wind_speed;
  const { compass } = data.wind_direction;
  return `風速 ${Math.round(speed * 10) / 10}${speedUnit}（${compass}）`;
}

export function Wind({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ color: "#666", fontSize: 14, margin: "0 0 8px" }}>
      {formatWind(data)}
    </p>
  );
}
