import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。Precipitation.tsx の formatPrecipitation と同様。
export function formatPrecipitationType(data: WeatherResponse): string {
  const { value: rain, unit: rainUnit } = data.rain;
  const { value: snow, unit: snowUnit } = data.snowfall;
  return `雨 ${Math.round(rain * 10) / 10}${rainUnit} ・ 雪 ${Math.round(snow * 10) / 10}${snowUnit}`;
}

export function PrecipitationType({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ color: "#666", fontSize: 14, margin: "4px 0" }}>
      {formatPrecipitationType(data)}
    </p>
  );
}
