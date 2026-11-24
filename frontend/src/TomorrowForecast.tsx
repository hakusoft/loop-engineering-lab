import type { WeatherResponse } from "./api";
import { ItemDescription } from "./ItemDescription";

// 表示ロジックを純関数に切り出す。DewPoint.tsx の formatDewPoint と同様。
export function formatTomorrowForecast(data: WeatherResponse): string {
  const { condition, temperature_max, temperature_min, precipitation_probability_max } =
    data.tomorrow;
  return (
    `明日: ${condition.description} 最高${Math.round(temperature_max.value)}${temperature_max.unit}` +
    ` / 最低${Math.round(temperature_min.value)}${temperature_min.unit}` +
    `（降水確率${Math.round(precipitation_probability_max.value)}${precipitation_probability_max.unit}）`
  );
}

export function TomorrowForecast({ data }: { data: WeatherResponse }) {
  return (
    <>
      <p style={{ color: "var(--text-secondary)", fontSize: 16, margin: "0 0 8px" }}>
        {formatTomorrowForecast(data)}
      </p>
      <ItemDescription text="明日1日分の予報。今日の値とは別に、Open-Meteoの翌日分のデータから取得" />
    </>
  );
}
