import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。HumidityMean.tsx の formatHumidityMean と同様。
export function formatPrecipitationProbabilityMean(data: WeatherResponse): string {
  const { value, unit } = data.precipitation_probability_mean;
  return `平均 ${Math.round(value)}${unit}`;
}

export function PrecipitationProbabilityMean({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ color: "var(--text-secondary)", fontSize: 16, margin: "4px 0" }}>
      {formatPrecipitationProbabilityMean(data)}
    </p>
  );
}
