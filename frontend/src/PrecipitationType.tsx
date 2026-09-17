import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。Precipitation.tsx の formatPrecipitation と同様。
export function formatPrecipitationType(data: WeatherResponse): string {
  const { value: rain, unit: rainUnit } = data.rain;
  const { value: snow, unit: snowUnit } = data.snowfall;
  // 雨(mm)と雪(cm)で単位が違うとどちらが多いか比べにくいという声（Issue #411）を
  // 受け、表示だけ雪をmmに換算して揃える（Visibility.tsx のm→km換算と同様、
  // API の値・単位自体は変えない）。
  const snowMm = snowUnit === "cm" ? snow * 10 : snow;
  const snowMmUnit = snowUnit === "cm" ? "mm" : snowUnit;
  return `雨 ${Math.round(rain * 10) / 10}${rainUnit} ・ 雪 ${Math.round(snowMm * 10) / 10}${snowMmUnit}`;
}

export function PrecipitationType({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ color: "var(--text-secondary)", fontSize: 16, margin: "4px 0" }}>
      {formatPrecipitationType(data)}
    </p>
  );
}
