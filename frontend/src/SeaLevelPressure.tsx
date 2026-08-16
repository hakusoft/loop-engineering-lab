import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。Pressure.tsx の formatPressure と同様。
export function formatSeaLevelPressure(data: WeatherResponse): string {
  const { value, unit } = data.sea_level_pressure;
  return `海面気圧 ${Math.round(value * 10) / 10}${unit}`;
}

export function SeaLevelPressure({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ color: "#666", fontSize: 16, margin: "0 0 8px" }}>
      {formatSeaLevelPressure(data)}
    </p>
  );
}
