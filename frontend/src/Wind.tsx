import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。Humidity.tsx の formatHumidity と同様。
//
// 以前は風速・風向・本日の最大風速・瞬間風速・最大瞬間風速を1行に詰め込んでおり、
// パッと見て何の数字か分かりにくいという指摘があった（Issue #265）。
// 項目ごとに関数を分け、画面側もラベルつきで行を分けて表示する。
export function formatWindSpeed(data: WeatherResponse): string {
  const { value, unit } = data.wind_speed;
  const { compass } = data.wind_direction;
  return `風速 ${Math.round(value * 10) / 10}${unit}（${compass}）`;
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
