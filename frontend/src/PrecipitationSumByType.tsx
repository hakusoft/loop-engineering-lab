import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。PrecipitationSum.tsx の formatPrecipitationSum と同様。
export function formatPrecipitationSumByType(data: WeatherResponse): string {
  const { value: rainSum, unit: rainSumUnit } = data.rain_sum;
  const { value: showersSum, unit: showersSumUnit } = data.showers;
  const { value: snowfallSum, unit: snowfallSumUnit } = data.snowfall_sum;
  return `内訳: 雨 ${Math.round(rainSum * 10) / 10}${rainSumUnit} ・ にわか雨 ${Math.round(showersSum * 10) / 10}${showersSumUnit} ・ 雪 ${Math.round(snowfallSum * 10) / 10}${snowfallSumUnit}`;
}

export function PrecipitationSumByType({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ color: "var(--text-secondary)", fontSize: 16, margin: "4px 0" }}>
      {formatPrecipitationSumByType(data)}
    </p>
  );
}
