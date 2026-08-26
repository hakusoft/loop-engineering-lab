import type { WeatherResponse } from "./api";
import { iconForWeatherCode } from "./weatherIcons";

// 表示ロジックを純関数に切り出す。天気状況の文字表記をそのまま返す。
export function formatCondition(data: WeatherResponse): string {
  return data.condition.description;
}

// 天気コードに対応するアイコンを返す。未知のコードはアイコンなし。
export function formatConditionIcon(data: WeatherResponse): string | null {
  return iconForWeatherCode(data.condition.code);
}

export function Condition({ data }: { data: WeatherResponse }) {
  const icon = formatConditionIcon(data);
  return (
    <p style={{ fontSize: 20, margin: "0 0 8px" }}>
      {icon && <span aria-hidden="true">{icon} </span>}
      {formatCondition(data)}
    </p>
  );
}
