import type { WeatherResponse } from "./api";
import { ItemDescription } from "./ItemDescription";

// 表示ロジックを純関数に切り出す。PrecipitationSum.tsx の formatPrecipitationSum と同様。
export function formatPrecipitation(data: WeatherResponse): string {
  const { value, unit } = data.precipitation;
  return `現在の降水量 ${Math.round(value * 10) / 10}${unit}`;
}

export function Precipitation({ data }: { data: WeatherResponse }) {
  return (
    <>
      <p style={{ color: "var(--text-secondary)", fontSize: 16, margin: "4px 0" }}>
        {formatPrecipitation(data)}
      </p>
      {/* precipitation・rain・showers の3つの数字の関係が分かりにくいという声を受け、
          内訳であることを明記する（Issue #537）。 */}
      <ItemDescription text="雨・にわか雨・雪を合わせた、今降っている量の合計です。内訳は「もっと見る」の「雨」「にわか雨」でご確認いただけます" />
    </>
  );
}
