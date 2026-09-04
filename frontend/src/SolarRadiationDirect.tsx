import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。SolarRadiation.tsx の formatSolarRadiation と同様。
export function formatSolarRadiationDirect(data: WeatherResponse): string {
  const { value, unit } = data.solar_radiation_direct;
  return `直達日射量 ${Math.round(value)}${unit}`;
}

export function SolarRadiationDirect({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ color: "var(--text-secondary)", fontSize: 16, margin: "4px 0" }}>
      {formatSolarRadiationDirect(data)}
    </p>
  );
}
