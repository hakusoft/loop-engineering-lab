import type { WeatherResponse } from "./api";

// 表示ロジックを純関数に切り出す。Humidity.tsx の formatHumidity と同様。
export function formatWind(data: WeatherResponse): string {
  const { value: speed, unit: speedUnit } = data.wind_speed;
  const { compass } = data.wind_direction;
  const { value: speedMax, unit: speedMaxUnit } = data.wind_speed_max;
  const { value: gusts, unit: gustsUnit } = data.wind_gusts;
  const { value: gustsMax, unit: gustsMaxUnit } = data.wind_gusts_max;
  return `風速 ${Math.round(speed * 10) / 10}${speedUnit}（${compass}） / 本日の最大風速 ${Math.round(speedMax * 10) / 10}${speedMaxUnit} / 瞬間風速 ${Math.round(gusts * 10) / 10}${gustsUnit} / 最大瞬間風速 ${Math.round(gustsMax * 10) / 10}${gustsMaxUnit}`;
}

export function formatWindDirectionDominant(data: WeatherResponse): string {
  const { compass } = data.wind_direction_dominant;
  return `本日の主風向 ${compass}`;
}

export function Wind({ data }: { data: WeatherResponse }) {
  return (
    <p style={{ color: "var(--text-secondary)", fontSize: 16, margin: "0 0 8px" }}>
      {formatWind(data)}
      <br />
      {formatWindDirectionDominant(data)}
    </p>
  );
}
