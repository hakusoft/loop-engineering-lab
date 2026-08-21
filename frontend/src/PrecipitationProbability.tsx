import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。TemperatureRange.tsx の formatTemperatureRange と同様。
// 降水確率が高いときの傘の注意書き（旧 PrecipitationWarning.tsx）はここに統合している。
const WARNING_THRESHOLD = 50;

export function formatPrecipitationProbability(data: WeatherResponse): string {
  const { value, unit } = data.precipitation_probability;
  return `降水確率 ${Math.round(value)}${unit}`;
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
    <p style={{ color: "#666", fontSize: 16, margin: "4px 0" }}>
      {formatPrecipitationProbability(data)}
      {warning ? ` ${warning}` : ""}
    </p>
  );
}
