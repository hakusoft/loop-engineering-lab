import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。Evapotranspiration.tsx の formatEvapotranspiration と同様。
export function formatVaporPressureDeficit(data: WeatherResponse): string {
  const { value, unit } = data.vapor_pressure_deficit;
  return `飽差 ${Math.round(value * 100) / 100}${unit}`;
}

export function VaporPressureDeficit({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: "4px 0" }}>
      {formatVaporPressureDeficit(data)}
    </p>
  );
}
