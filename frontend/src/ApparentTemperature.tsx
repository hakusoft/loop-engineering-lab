import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。CurrentTemperature.tsx の formatTemperature と同様。
export function formatApparentTemperature(data: WeatherResponse): string {
  const { value, unit } = data.apparent_temperature;
  return `体感 ${Math.round(value * 10) / 10}${unit}`;
}

export function ApparentTemperature({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ fontSize: 24, fontWeight: 600, margin: "0 0 8px", color: "#444" }}>
      {formatApparentTemperature(data)}
    </p>
  );
}
