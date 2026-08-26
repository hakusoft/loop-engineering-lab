import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。土や葉から失われる水の量を乾きやすさの目安として出す。
export function formatEvapotranspiration(data: WeatherResponse): string {
  const { value, unit } = data.evapotranspiration;
  return `本日の蒸発散量 ${Math.round(value * 10) / 10}${unit}`;
}

export function Evapotranspiration({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ color: "#666", fontSize: 14, margin: "4px 0" }}>
      {formatEvapotranspiration(data)}
    </p>
  );
}
