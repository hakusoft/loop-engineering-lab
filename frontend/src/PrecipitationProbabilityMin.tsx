import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。値の丸め・単位の組み立てだけなのでテスト基盤は不要だが、
// コンポーネントから分離しておくと後から検証しやすい（HumidityRange.tsx と同様）。
//
// 最大値は PrecipitationProbability.tsx が既に「降水確率」として表示しているため、
// ここでは最低だけを表示する。
export function formatPrecipitationProbabilityMin(data: WeatherResponse): string {
  const { value, unit } = data.precipitation_probability_min;
  return `最低 ${Math.round(value)}${unit}`;
}

export function PrecipitationProbabilityMin({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ color: "var(--text-secondary)", fontSize: 16, margin: "4px 0" }}>
      {formatPrecipitationProbabilityMin(data)}
    </p>
  );
}
