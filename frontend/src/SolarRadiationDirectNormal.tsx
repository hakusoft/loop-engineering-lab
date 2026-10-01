import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。SolarRadiationDirect.tsx の
// formatSolarRadiationDirect と同様。value は null になり得る
// （Humidity.tsx の formatHumidity と同じ方針で、欠測時は行自体を残して伝える）。
export function formatSolarRadiationDirectNormal(data: WeatherResponse): string {
  const { value, unit } = data.solar_radiation_direct_normal;
  if (value === null) {
    return "法線面直達日射量 現在取得できません";
  }
  return `法線面直達日射量 ${Math.round(value)}${unit}`;
}

export function SolarRadiationDirectNormal({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ color: "var(--text-secondary)", fontSize: 16, margin: "4px 0" }}>
      {formatSolarRadiationDirectNormal(data)}
    </p>
  );
}
