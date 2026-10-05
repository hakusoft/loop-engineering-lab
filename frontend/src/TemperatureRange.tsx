import type { WeatherResponse } from "./api";
import { ItemDescription } from "./ItemDescription";
import { formatTemperatureValue } from "./formatTemperatureValue";

// 日付（YYYY-MM-DD）を「M/D」の表記にする。
function formatMonthDay(date: string): string {
  const [, month, day] = date.split("-");
  return `${Number(month)}/${Number(day)}`;
}

// 表示ロジックを純関数に切り出す。値の丸め・単位の組み立てだけなのでテスト基盤は不要だが、
// コンポーネントから分離しておくと後から検証しやすい。
// Math.round(x * 10) / 10 だと値がちょうど整数のとき小数点以下が落ちて、
// 現在の気温の表示と桁数がばらつく(Issue #528)。toFixed(1) で常に1桁に揃える。
export function formatTemperatureRange(data: WeatherResponse): string {
  const { value: max, unit, date } = data.temperature_max;
  const { value: min } = data.temperature_min;
  return `最高 ${formatTemperatureValue(max)}${unit} ・ 最低 ${formatTemperatureValue(min)}${unit}（${formatMonthDay(date)}）`;
}

export function TemperatureRange({ data }: { data: WeatherResponse }) {
  return (
    <>
      <p style={{ color: "var(--text-secondary)", fontSize: 16, margin: "4px 0" }}>
        {formatTemperatureRange(data)}
      </p>
      <ItemDescription text="本日の気温の最高・最低" />
    </>
  );
}
