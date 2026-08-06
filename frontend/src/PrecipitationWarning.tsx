import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。降水確率が高いときだけ注意コメントを返す。
const WARNING_THRESHOLD = 50;

export function formatPrecipitationWarning(data: WeatherResponse): string | null {
  const { value } = data.precipitation_probability;
  if (value < WARNING_THRESHOLD) {
    return null;
  }
  return "☂️ 傘があると安心です";
}

export function PrecipitationWarning({ data }: { data: WeatherResponse }) {
  const message = formatPrecipitationWarning(data);
  if (!message) {
    return null;
  }
  return (
    <p style={{ color: "#1c7ed6", fontSize: 14, margin: "4px 0" }}>{message}</p>
  );
}
