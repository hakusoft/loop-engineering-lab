import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。SolarRadiation.tsx の formatSolarRadiation と同様。
export function formatSolarRadiationDiffuse(data: WeatherResponse): string {
  const { value, unit } = data.solar_radiation_diffuse;
  return `拡散日射量 ${Math.round(value)}${unit}`;
}

export function SolarRadiationDiffuse({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ color: "var(--text-secondary)", fontSize: 16, margin: "4px 0" }}>
      {formatSolarRadiationDiffuse(data)}
    </p>
  );
}
