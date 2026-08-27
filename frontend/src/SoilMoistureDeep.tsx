import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。SoilMoisture.tsx の formatSoilMoisture と同様。
export function formatSoilMoistureDeep(data: WeatherResponse): string {
  const { value, unit } = data.soil_moisture_deep;
  return `土の湿り気（1〜3cm） ${Math.round(value * 100) / 100}${unit}`;
}

export function SoilMoistureDeep({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ color: "#666", fontSize: 14, margin: "4px 0" }}>
      {formatSoilMoistureDeep(data)}
    </p>
  );
}
