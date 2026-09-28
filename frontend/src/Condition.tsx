import type { WeatherResponse } from "./api";
import { iconForWeatherCode } from "./weatherIcons";
import { ItemDescription } from "./ItemDescription";

// 表示ロジックを純関数に切り出す。
//
// 「晴れ」のような単語だけでなく、気温や風も含めた一文にしてほしいという
// 声を受け、condition.sentence（app/weather.py の _condition_sentence）を
// 表示するようにする（Issue #486）。天気コード由来の短い語（description）は
// HourlyConditions.tsx 等で引き続き使うため、そちらは変えない。
export function formatCondition(data: WeatherResponse): string {
  return data.condition.sentence;
}

// 天気コードに対応するアイコンを返す。未知のコードはアイコンなし。
export function formatConditionIcon(data: WeatherResponse): string | null {
  return iconForWeatherCode(data.condition.code);
}

export function Condition({ data }: { data: WeatherResponse }) {
  const icon = formatConditionIcon(data);
  return (
    <>
      <p style={{ fontSize: 20, margin: "0 0 8px" }}>
        {icon && <span aria-hidden="true">{icon} </span>}
        {formatCondition(data)}
      </p>
      <ItemDescription text="現在の天気の状況（快晴・曇り・雨など）" />
    </>
  );
}
