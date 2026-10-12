import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。Pressure.tsx の formatPressure と同様。
//
// 瞬間値(その時点の値)なのか平均値なのか分からないという声を受け、明記する
// （Issue #570）。solar_radiation（Open-Meteo の current.shortwave_radiation）は
// 元から瞬間値で、積算値は solar_radiation_sum が別にあるため、値自体は変えない。
export function formatSolarRadiation(data: WeatherResponse): string {
  const { value, unit } = data.solar_radiation;
  return `日射量 ${Math.round(value)}${unit}（瞬間値）`;
}

export function SolarRadiation({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ color: "var(--text-secondary)", fontSize: 16, margin: "4px 0" }}>
      {formatSolarRadiation(data)}
    </p>
  );
}
