import type { WeatherResponse } from "./api";
import { ItemDescription } from "./ItemDescription";

// 表示ロジックを純関数に切り出す。Humidity.tsx の formatHumidity と同様。
export function formatDewPoint(data: WeatherResponse): string {
  const { value, unit } = data.dew_point;
  return `露点温度 ${Math.round(value * 10) / 10}${unit}`;
}

export function DewPoint({ data }: { data: WeatherResponse }) {
  return (
    <>
      <p style={{ color: "var(--text-secondary)", fontSize: 16, margin: "0 0 8px" }}>
        {formatDewPoint(data)}
      </p>
      <ItemDescription text="空気中の水蒸気が結露し始める温度。高いほどジメジメ感が強い目安" />
    </>
  );
}
