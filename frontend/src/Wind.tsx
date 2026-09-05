import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。Humidity.tsx の formatHumidity と同様。
//
// 以前は風速・風向・本日の最大風速・瞬間風速・最大瞬間風速を1行に詰め込んでおり、
// パッと見て何の数字か分かりにくいという指摘があった（Issue #265）。
// 項目ごとに関数を分け、画面側もラベルつきで行を分けて表示する。

// 気象庁の「風の強さと吹き方」の目安（m/s基準）を参考にした言葉の目安。
// wind_speed_10m は km/h で来るため m/s に換算してから判定する。
export function windSpeedDescription(speedKmh: number): string {
  const speedMs = speedKmh / 3.6;
  if (speedMs >= 25) {
    return "猛烈な風";
  }
  if (speedMs >= 20) {
    return "非常に強い風";
  }
  if (speedMs >= 15) {
    return "強い風";
  }
  if (speedMs >= 10) {
    return "やや強い風";
  }
  return "穏やかな風";
}

export function formatWindSpeed(data: WeatherResponse): string {
  const { value, unit } = data.wind_speed;
  const { compass } = data.wind_direction;
  const rounded = Math.round(value * 10) / 10;
  return `風速 ${rounded}${unit}（${compass}・${windSpeedDescription(value)}）`;
}

export function formatWindSpeedMax(data: WeatherResponse): string {
  const { value, unit } = data.wind_speed_max;
  return `本日の最大風速 ${Math.round(value * 10) / 10}${unit}`;
}

export function formatWindGusts(data: WeatherResponse): string {
  const { value, unit } = data.wind_gusts;
  return `瞬間風速 ${Math.round(value * 10) / 10}${unit}`;
}

export function formatWindGustsMax(data: WeatherResponse): string {
  const { value, unit } = data.wind_gusts_max;
  return `最大瞬間風速 ${Math.round(value * 10) / 10}${unit}`;
}

export function formatWindDirectionDominant(data: WeatherResponse): string {
  const { compass } = data.wind_direction_dominant;
  return `本日の主風向 ${compass}`;
}

export function Wind({ data }: { data: WeatherResponse }) {
  return (
    <div style={{ margin: "0 0 8px" }}>
      <p style={{ color: "var(--text-secondary)", fontSize: 16, margin: "0 0 2px" }}>
        {formatWindSpeed(data)}
      </p>
      <p style={{ color: "var(--text-tertiary)", fontSize: 13, margin: "0 0 2px" }}>
        {formatWindSpeedMax(data)}
      </p>
      <p style={{ color: "var(--text-tertiary)", fontSize: 13, margin: "0 0 2px" }}>
        {formatWindGusts(data)}
      </p>
      <p style={{ color: "var(--text-tertiary)", fontSize: 13, margin: "0 0 2px" }}>
        {formatWindGustsMax(data)}
      </p>
      <p style={{ color: "var(--text-tertiary)", fontSize: 13, margin: 0 }}>
        {formatWindDirectionDominant(data)}
      </p>
    </div>
  );
}
