import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。SoilTemperature.tsx の formatSoilTemperature と同様。
export function formatSoilMoisture(data: WeatherResponse): string {
  const { value, unit } = data.soil_moisture;
  return `土の湿り気（地表） ${Math.round(value * 100) / 100}${unit}`;
}

export function SoilMoisture({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ color: "#666", fontSize: 14, margin: "4px 0" }}>
      {formatSoilMoisture(data)}
    </p>
  );
}
