import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。値の丸め・単位の組み立てだけなのでテスト基盤は不要だが、
// コンポーネントから分離しておくと後から検証しやすい。
//
// Open-Meteo のモデル値は仕様上まれに100%を超えることがある。Humidity.tsx の
// formatHumidity と同じ理由（Issue #276）で、表示側だけ100%で上限キャップする。
export function formatHumidityRange(data: WeatherResponse): string {
  const { value: max, unit } = data.humidity_max;
  const { value: min } = data.humidity_min;
  return `最高 ${Math.round(Math.min(max, 100) * 10) / 10}${unit} ・ 最低 ${Math.round(Math.min(min, 100) * 10) / 10}${unit}`;
}

export function HumidityRange({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ color: "var(--text-secondary)", fontSize: 16, margin: "4px 0" }}>
      {formatHumidityRange(data)}
    </p>
  );
}
