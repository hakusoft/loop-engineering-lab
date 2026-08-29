import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。SoilTemperature.tsx と同様。
// 表層（0cm）だけでは霜が降りるかどうかの目安にしづらいという声を受け、
// より深い層（6cm）の土の温度も表示する（Issue #278）。
export function formatSoilTemperatureDeep(data: WeatherResponse): string {
  const { value, unit } = data.soil_temperature_deep;
  return `土の温度（深さ6cm） ${Math.round(value * 10) / 10}${unit}`;
}

export function SoilTemperatureDeep({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: "4px 0" }}>
      {formatSoilTemperatureDeep(data)}
    </p>
  );
}
