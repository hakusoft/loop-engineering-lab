import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。PrecipitationProbability.tsx の formatPrecipitationProbability と同様。
export function formatPrecipitationSum(data: WeatherResponse): string {
  const { value, unit } = data.precipitation_sum;
  return `本日の合計降水量 ${Math.round(value * 10) / 10}${unit}`;
}

export function PrecipitationSum({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ color: "#666", fontSize: 14, margin: "4px 0" }}>
      {formatPrecipitationSum(data)}
    </p>
  );
}
