import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。庭の水やりの目安として地表の温度を出す。
export function formatSoilTemperature(data: WeatherResponse): string {
  const { value, unit } = data.soil_temperature;
  return `土の温度（地表） ${Math.round(value * 10) / 10}${unit}`;
}

export function SoilTemperature({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ color: "#666", fontSize: 14, margin: "4px 0" }}>
      {formatSoilTemperature(data)}
    </p>
  );
}
