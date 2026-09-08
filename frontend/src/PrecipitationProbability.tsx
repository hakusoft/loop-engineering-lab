import type { WeatherResponse } from "./api";

// 日付（YYYY-MM-DD）を「M/D」の表記にする。TemperatureRange.tsx の formatMonthDay と同様。
function formatMonthDay(date: string): string {
  const [, month, day] = date.split("-");
  return `${Number(month)}/${Number(day)}`;
}

// 表示ロジックを純関数に切り出す。TemperatureRange.tsx の formatTemperatureRange と同様。
// 降水確率が高いときの傘の注意書き（旧 PrecipitationWarning.tsx）はここに統合している。
const WARNING_THRESHOLD = 50;

export function formatPrecipitationProbability(data: WeatherResponse): string {
  const { value, unit, date } = data.precipitation_probability;
  return `降水確率 ${Math.round(value)}${unit}（${formatMonthDay(date)}）`;
}

export function formatPrecipitationWarning(data: WeatherResponse): string | null {
  const { value } = data.precipitation_probability;
  if (value < WARNING_THRESHOLD) {
    return null;
  }
  return "☂️ 傘があると安心です";
}

export function PrecipitationProbability({ data }: { data: WeatherResponse }) {
  const warning = formatPrecipitationWarning(data);
  return (
    <p style={{ color: "var(--text-secondary)", fontSize: 16, margin: "4px 0" }}>
      {formatPrecipitationProbability(data)}
      {warning ? ` ${warning}` : ""}
    </p>
  );
}
