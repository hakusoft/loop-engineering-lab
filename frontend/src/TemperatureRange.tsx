import type { WeatherResponse } from "./api";

// 日付（YYYY-MM-DD）を「M/D」の表記にする。
function formatMonthDay(date: string): string {
  const [, month, day] = date.split("-");
  return `${Number(month)}/${Number(day)}`;
}

// 表示ロジックを純関数に切り出す。値の丸め・単位の組み立てだけなのでテスト基盤は不要だが、
// コンポーネントから分離しておくと後から検証しやすい。
export function formatTemperatureRange(data: WeatherResponse): string {
  const { value: max, unit, date } = data.temperature_max;
  const { value: min } = data.temperature_min;
  return `最高 ${Math.round(max * 10) / 10}${unit} ・ 最低 ${Math.round(min * 10) / 10}${unit}（${formatMonthDay(date)}）`;
}

export function TemperatureRange({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ color: "var(--text-secondary)", fontSize: 16, margin: "4px 0" }}>
      {formatTemperatureRange(data)}
    </p>
  );
}
