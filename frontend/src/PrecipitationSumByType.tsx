import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。PrecipitationSum.tsx の formatPrecipitationSum と同様。
export function formatPrecipitationSumByType(data: WeatherResponse): string {
  const { value: rainSum, unit: rainSumUnit } = data.rain_sum;
  const { value: showersSum, unit: showersSumUnit } = data.showers;
  const { value: snowfallSum, unit: snowfallSumUnit } = data.snowfall_sum;
  // 雨(mm)と雪(cm)で単位が違うとどちらが多いか比べにくいという声（Issue #411）を
  // 受け、表示だけ雪をmmに換算して揃える（PrecipitationType.tsx と同様）。
  const snowfallSumMm = snowfallSumUnit === "cm" ? snowfallSum * 10 : snowfallSum;
  const snowfallSumMmUnit = snowfallSumUnit === "cm" ? "mm" : snowfallSumUnit;
  return `内訳: 雨 ${Math.round(rainSum * 10) / 10}${rainSumUnit} ・ にわか雨 ${Math.round(showersSum * 10) / 10}${showersSumUnit} ・ 雪 ${Math.round(snowfallSumMm * 10) / 10}${snowfallSumMmUnit}`;
}

export function PrecipitationSumByType({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ color: "var(--text-secondary)", fontSize: 16, margin: "4px 0" }}>
      {formatPrecipitationSumByType(data)}
    </p>
  );
}
