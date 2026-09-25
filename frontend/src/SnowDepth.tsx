import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。TemperatureRange.tsx の formatTemperatureRange と同様。
//
// Open-Meteo は積雪の深さをm単位で返すが、普段cm表記に慣れていて数値がピンと
// 来ないという声を受け、cmに変換して表示する（Visibility.tsx の km 変換、
// Issue #355 と同様の考え方）。
export function formatSnowDepth(data: WeatherResponse): string {
  const { value } = data.snow_depth;
  const centimeters = Math.round(value * 10 * 10) / 10;
  return `積雪の深さ ${centimeters}cm`;
}

export function SnowDepth({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ color: "var(--text-secondary)", fontSize: 16, margin: "4px 0" }}>
      {formatSnowDepth(data)}
    </p>
  );
}
