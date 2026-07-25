import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。天気状況の文字表記をそのまま返す。
export function formatCondition(data: WeatherResponse): string {
  return data.condition.description;
}

export function Condition({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ fontSize: 20, margin: "0 0 8px" }}>{formatCondition(data)}</p>
  );
}
