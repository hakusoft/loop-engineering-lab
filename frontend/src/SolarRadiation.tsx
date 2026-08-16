import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。Pressure.tsx の formatPressure と同様。
export function formatSolarRadiation(data: WeatherResponse): string {
  const { value, unit } = data.solar_radiation;
  return `日射量 ${Math.round(value)}${unit}`;
}

export function SolarRadiation({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ color: "#666", fontSize: 16, margin: "4px 0" }}>
      {formatSolarRadiation(data)}
    </p>
  );
}
