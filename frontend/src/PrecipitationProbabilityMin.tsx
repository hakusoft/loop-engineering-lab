import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。値の丸め・単位の組み立てだけなのでテスト基盤は不要だが、
// コンポーネントから分離しておくと後から検証しやすい（HumidityRange.tsx と同様）。
//
// 最大値は PrecipitationProbability.tsx が既に「降水確率」として表示しているため、
// ここでは最低だけを表示する。
//
// value は null になり得る（api.ts のコメント参照）。実 API での応答が
// 未確認の項目のため、取れないときは NaN 表示にせず null をそのまま扱う
// （SoilMoistureDeep.tsx と同じ方針）。
export function formatPrecipitationProbabilityMin(data: WeatherResponse): string | null {
  const { value, unit } = data.precipitation_probability_min;
  if (value === null) {
    return null;
  }
  return `最低 ${Math.round(value)}${unit}`;
}

export function PrecipitationProbabilityMin({ data }: { data: WeatherResponse }) {
  const text = formatPrecipitationProbabilityMin(data);
  if (text === null) {
    return null;
  }
  return (
    <p style={{ color: "var(--text-secondary)", fontSize: 16, margin: "4px 0" }}>{text}</p>
  );
}
