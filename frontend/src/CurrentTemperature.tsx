import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。値の丸め・単位の組み立てだけなのでテスト基盤は不要だが、
// コンポーネントから分離しておくと後から検証しやすい。
export function formatTemperature(data: WeatherResponse): string {
  const { value, unit } = data.temperature;
  return `${Math.round(value * 10) / 10}${unit}`;
}

export function CurrentTemperature({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ fontSize: 64, fontWeight: 700, margin: "8px 0", lineHeight: 1 }}>
      {formatTemperature(data)}
    </p>
  );
}
