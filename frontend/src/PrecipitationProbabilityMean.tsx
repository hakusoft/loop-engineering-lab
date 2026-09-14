import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。HumidityMean.tsx の formatHumidityMean と同様。
//
// value は null になり得る（api.ts のコメント参照）。実 API での応答が
// 未確認の項目のため、取れないときは NaN 表示にせず null をそのまま扱う
// （SoilMoistureDeep.tsx と同じ方針）。
export function formatPrecipitationProbabilityMean(data: WeatherResponse): string | null {
  const { value, unit } = data.precipitation_probability_mean;
  if (value === null) {
    return null;
  }
  return `平均 ${Math.round(value)}${unit}`;
}

export function PrecipitationProbabilityMean({ data }: { data: WeatherResponse }) {
  const text = formatPrecipitationProbabilityMean(data);
  if (text === null) {
    return null;
  }
  return (
    <p style={{ color: "var(--text-secondary)", fontSize: 16, margin: "4px 0" }}>{text}</p>
  );
}
